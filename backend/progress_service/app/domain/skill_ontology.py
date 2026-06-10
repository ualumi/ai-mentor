import math
import re
from datetime import datetime
from difflib import SequenceMatcher

import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_distances, cosine_similarity

from app.state import (
    COMPETENCY_GRAPH,
    SKILL_ALIASES,
    SKILL_HIERARCHY,
    SKILL_REGISTRY,
    SKILL_RELATION_STATS,
    TYPED_COMPETENCY_GRAPH,
    USER_COMPETENCY_GRAPHS,
    USER_SKILL_RELATION_STATS,
    USER_TYPED_COMPETENCY_GRAPHS,
)


MERGE_SIMILARITY_THRESHOLD = 0.86
FUZZY_SIMILARITY_THRESHOLD = 0.92
MIN_PARENT_CONFIDENCE = 0.72
MIN_PREREQUISITE_CONFIDENCE = 0.68
MIN_RELATED_CONFIDENCE = 0.45
HIERARCHY_DISTANCE_THRESHOLD = 0.72
HIERARCHY_MIN_CLUSTER_SIZE = 2

RELATION_REINFORCEMENT = {
    "same_as": 1.0,
    "parent_of": 0.55,
    "child_of": 0.55,
    "prerequisite_of": 0.45,
    "supports": 0.4,
    "related_to": 0.25,
}

_TOKEN_ALIASES = {
    "forloop": "loops",
    "forloops": "loops",
    "for_loop": "loops",
    "for_loops": "loops",
    "whileloop": "loops",
    "whileloops": "loops",
    "циклы": "loops",
    "цикл": "loops",
    "рекурсия": "recursion",
    "рекурсивные": "recursion",
    "функции": "functions",
    "функция": "functions",
    "математика": "math",
    "алгоритмы": "algorithms",
    "условия": "conditionals",
    "cikl": "loops",
    "cikly": "loops",
    "rekursiya": "recursion",
    "rekursivnye": "recursion",
    "funkciya": "functions",
    "funkcii": "functions",
    "matematika": "math",
    "algoritmy": "algorithms",
    "usloviya": "conditionals",
}
_TOKEN_ALIASES.update({
    "циклы": "loops",
    "цикл": "loops",
    "рекурсия": "recursion",
    "рекурсивные": "recursion",
    "функции": "functions",
    "функция": "functions",
    "математика": "math",
    "mathematics": "math",
    "алгоритмы": "algorithms",
    "условия": "conditionals",
})

def canonicalize_evidence_list(evidence_list: list[dict], user_progress: dict) -> list[dict]:
    canonicalized = []

    for evidence in evidence_list:
        canonicalized.append(canonicalize_evidence(evidence, user_progress))

    return canonicalized


def canonicalize_evidence(evidence: dict, user_progress: dict) -> dict:
    raw_name = str(evidence.get("competency", "")).strip()
    canonical, confidence, method = canonicalize_skill(raw_name)
    result = dict(evidence)
    result["raw_competency"] = raw_name
    result["canonical_competency"] = canonical
    result["canonical_confidence"] = round(confidence, 3)
    result["canonicalization_method"] = method
    result["competency"] = canonical

    merge_skill_state(user_progress.get("skills", {}), raw_name, canonical)
    register_skill_alias(raw_name, canonical, confidence, method)

    return result


def canonicalize_skill(raw_name: str) -> tuple[str, float, str]:
    normalized = normalize_skill_name(raw_name)
    if not normalized:
        return raw_name, 0.0, "empty"

    if normalized in SKILL_ALIASES:
        canonical = normalize_skill_name(SKILL_ALIASES[normalized])
        return canonical or SKILL_ALIASES[normalized], 1.0, "alias"

    canonical_by_rule = _canonical_by_rule(normalized)
    if canonical_by_rule:
        return canonical_by_rule, 0.98, "rule"

    candidates = sorted({
        normalize_skill_name(candidate)
        for candidate in SKILL_REGISTRY.keys()
        if normalize_skill_name(candidate)
    })
    if not candidates:
        return normalized, 1.0, "new"

    fuzzy_name, fuzzy_score = _best_fuzzy_match(normalized, candidates)
    if fuzzy_score >= FUZZY_SIMILARITY_THRESHOLD:
        return fuzzy_name, fuzzy_score, "fuzzy"

    embedded_name, embedded_score = _best_embedding_match(normalized, candidates)
    if embedded_score >= MERGE_SIMILARITY_THRESHOLD:
        return embedded_name, embedded_score, "embedding"

    return normalized, 1.0, "new"


def register_skill_alias(
    raw_name: str,
    canonical: str,
    confidence: float,
    method: str,
) -> None:
    raw_normalized = normalize_skill_name(raw_name)
    canonical = normalize_skill_name(canonical) or canonical
    SKILL_ALIASES[raw_normalized] = canonical
    SKILL_ALIASES[canonical] = canonical

    metadata = SKILL_REGISTRY.setdefault(
        canonical,
        {
            "display_name": canonical,
            "aliases": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": None,
            "canonicalization": [],
        },
    )
    aliases = set(metadata.get("aliases", []))
    aliases.add(raw_normalized)
    aliases.add(canonical)
    metadata["aliases"] = sorted(aliases)
    metadata["updated_at"] = datetime.utcnow().isoformat()
    metadata.setdefault("canonicalization", []).append({
        "raw": raw_name,
        "normalized": raw_normalized,
        "confidence": round(confidence, 3),
        "method": method,
        "created_at": datetime.utcnow().isoformat(),
    })


def normalize_skill_state(skills_state: dict) -> None:
    for raw_name in list(skills_state.keys()):
        canonical, confidence, method = canonicalize_skill(raw_name)
        merge_skill_state(skills_state, raw_name, canonical)
        register_skill_alias(raw_name, canonical, confidence, method)


def merge_skill_state(skills_state: dict, raw_name: str, canonical: str) -> None:
    raw_normalized = normalize_skill_name(raw_name)
    if raw_name == canonical and raw_normalized == canonical:
        return

    source_candidates = []
    for key in (raw_name, raw_normalized):
        if key not in source_candidates:
            source_candidates.append(key)

    source_keys = [
        key for key in source_candidates
        if key in skills_state and key != canonical
    ]

    for source_key in source_keys:
        source_state = skills_state.pop(source_key)
        target_state = skills_state.get(canonical)
        skills_state[canonical] = (
            _merge_progress_states(target_state, source_state)
            if target_state
            else source_state
        )

    merge_graph_nodes(raw_normalized, canonical)
    merge_graph_nodes(raw_name, canonical)


def merge_graph_nodes(source: str, target: str) -> None:
    if not source or source == target:
        return

    _merge_untyped_graph_nodes(COMPETENCY_GRAPH, source, target)
    _merge_typed_graph_nodes(TYPED_COMPETENCY_GRAPH, SKILL_RELATION_STATS, source, target)

    for user_graph in USER_COMPETENCY_GRAPHS.values():
        _merge_untyped_graph_nodes(user_graph, source, target)

    for user_id, user_typed_graph in USER_TYPED_COMPETENCY_GRAPHS.items():
        _merge_typed_graph_nodes(
            user_typed_graph,
            USER_SKILL_RELATION_STATS[user_id],
            source,
            target,
        )


def _merge_untyped_graph_nodes(graph: dict, source: str, target: str) -> None:
    if source in graph:
        for neighbor, weight in list(graph[source].items()):
            if neighbor != target:
                graph[target][neighbor] = max(
                    graph[target].get(neighbor, 0.0),
                    weight,
                )
        del graph[source]

    for node, edges in list(graph.items()):
        if source in edges:
            weight = edges.pop(source)
            if node != target:
                edges[target] = max(edges.get(target, 0.0), weight)

    if target in graph:
        graph[target][target] = 1.0


def update_typed_relations(
    evidence_list: list[dict],
    typed_graph: dict | None = None,
    relation_stats: dict | None = None,
    progress_before: dict | None = None,
    progress_after: dict | None = None,
) -> None:
    typed_graph = typed_graph if typed_graph is not None else TYPED_COMPETENCY_GRAPH
    relation_stats = relation_stats if relation_stats is not None else SKILL_RELATION_STATS
    active_skills = {
        evidence["competency"]
        for evidence in evidence_list
        if evidence.get("competency")
    }
    _rebuild_embedding_hierarchy(active_skills)
    evidence_by_skill = {
        evidence["competency"]: evidence
        for evidence in evidence_list
        if evidence.get("competency")
    }

    for evidence in evidence_list:
        source = evidence.get("competency")
        raw = evidence.get("raw_competency", source)
        confidence = _evidence_confidence(evidence)
        if not source:
            continue

        if raw and normalize_skill_name(raw) != source:
            _add_typed_edge(
                source,
                normalize_skill_name(raw),
                "same_as",
                confidence,
                typed_graph=typed_graph,
            )
            _add_typed_edge(
                normalize_skill_name(raw),
                source,
                "same_as",
                confidence,
                typed_graph=typed_graph,
            )

        for target in active_skills:
            if target == source:
                continue

            pair_stats = _update_pair_stats(
                source=source,
                target=target,
                source_evidence=evidence,
                target_evidence=evidence_by_skill[target],
                relation_stats=relation_stats,
                progress_before=progress_before,
                progress_after=progress_after,
            )
            relation, relation_confidence = infer_relation(source, target, pair_stats)
            reinforcement = confidence * relation_confidence
            _add_typed_edge(
                source,
                target,
                relation,
                reinforcement,
                typed_graph=typed_graph,
            )


def infer_relation(source: str, target: str, pair_stats: dict | None = None) -> tuple[str, float]:
    if source == target:
        return "same_as", 1.0

    pair_stats = pair_stats or SKILL_RELATION_STATS.get(source, {}).get(target, {})
    semantic_similarity = _semantic_similarity(source, target)
    source_tokens = set(source.split("_"))
    target_tokens = set(target.split("_"))
    source_generality = _generality_score(source)
    target_generality = _generality_score(target)
    temporal_score = float(pair_stats.get("temporal_support", 0.0))
    reverse_temporal_score = float(pair_stats.get("reverse_temporal_support", 0.0))
    cooccurrence_confidence = _cooccurrence_confidence(pair_stats)

    if semantic_similarity >= MERGE_SIMILARITY_THRESHOLD:
        return "same_as", semantic_similarity

    if (
        source_tokens
        and target_tokens
        and source_tokens < target_tokens
        and semantic_similarity >= 0.35
    ):
        return "parent_of", max(MIN_PARENT_CONFIDENCE, semantic_similarity)

    if (
        source_tokens
        and target_tokens
        and target_tokens < source_tokens
        and semantic_similarity >= 0.35
    ):
        return "child_of", max(MIN_PARENT_CONFIDENCE, semantic_similarity)

    hierarchy_relation = _hierarchy_relation(source, target)
    if hierarchy_relation:
        return hierarchy_relation

    if (
        source_generality > target_generality + 0.25
        and semantic_similarity >= 0.42
        and cooccurrence_confidence >= 0.35
    ):
        return "parent_of", max(MIN_PARENT_CONFIDENCE, semantic_similarity)

    if (
        target_generality > source_generality + 0.25
        and semantic_similarity >= 0.42
        and cooccurrence_confidence >= 0.35
    ):
        return "child_of", max(MIN_PARENT_CONFIDENCE, semantic_similarity)

    if temporal_score >= MIN_PREREQUISITE_CONFIDENCE:
        return "prerequisite_of", temporal_score

    if reverse_temporal_score >= MIN_PREREQUISITE_CONFIDENCE:
        return "supports", reverse_temporal_score

    related_confidence = max(cooccurrence_confidence, semantic_similarity * 0.65)
    if related_confidence >= MIN_RELATED_CONFIDENCE:
        return "related_to", related_confidence

    return "related_to", 0.6


def typed_relation_weight(
    source: str,
    target: str,
    relation_types: set[str] | None = None,
    typed_graph: dict | None = None,
) -> float:
    graph = typed_graph if typed_graph is not None else TYPED_COMPETENCY_GRAPH
    relations = graph.get(source, {}).get(target, {})
    if not relations:
        return 0.0

    if relation_types is None:
        return max(relations.values())

    return max(
        (weight for relation, weight in relations.items() if relation in relation_types),
        default=0.0,
    )


def normalize_skill_name(name: str) -> str:
    normalized = str(name or "").strip().lower()
    normalized = normalized.replace("-", "_").replace("/", "_")
    normalized = re.sub(r"[^\w\s]+", " ", normalized, flags=re.UNICODE)
    tokens = [
        _normalize_token(token)
        for token in re.split(r"[\s_]+", normalized)
        if token
    ]

    if len(tokens) == 1:
        return tokens[0]

    if tokens and tokens[-1] in {"skill", "skills", "навык", "навыки", "navyk", "navyki"}:
        tokens = tokens[:-1]

    return "_".join(tokens)


def _merge_progress_states(target: dict | None, source: dict) -> dict:
    if not target:
        return source

    target_attempts = int(target.get("attempts", 0))
    source_attempts = int(source.get("attempts", 0))
    total_attempts = target_attempts + source_attempts
    if total_attempts <= 0:
        total_attempts = 1

    merged = dict(target)
    for key in ("avg_involvement", "confidence"):
        merged[key] = round(
            (
                target.get(key, 0.0) * target_attempts
                + source.get(key, 0.0) * source_attempts
            ) / total_attempts,
            3,
        )

    for key in ("ema", "ema_mastery", "bkt_mastery", "mastery", "recent_performance"):
        merged[key] = round(
            _weighted_average(
                target.get(key, 0.0),
                max(target_attempts, 1),
                source.get(key, 0.0),
                max(source_attempts, 1),
            ),
            3,
        )

    merged["attempts"] = target_attempts + source_attempts
    merged["deficit"] = round(1.0 - merged.get("bkt_mastery", merged.get("mastery", 0.0)), 3)
    merged["uncertainty"] = round(
        1.0 / (
            1.0
            + max(merged["attempts"], 1)
            * merged.get("confidence", 0.0)
            * merged.get("avg_involvement", 0.0)
        ),
        3,
    )
    merged["trend"] = round(
        _weighted_average(
            target.get("trend", 0.0),
            max(target_attempts, 1),
            source.get("trend", 0.0),
            max(source_attempts, 1),
        ),
        3,
    )
    merged["ema_trend"] = round(
        _weighted_average(
            target.get("ema_trend", 0.0),
            max(target_attempts, 1),
            source.get("ema_trend", 0.0),
            max(source_attempts, 1),
        ),
        3,
    )
    merged["mastery_reached"] = (
        merged.get("bkt_mastery", merged.get("mastery", 0.0)) >= 0.8
        and merged["attempts"] >= 3
    )
    merged["last_updated"] = max(
        str(target.get("last_updated") or ""),
        str(source.get("last_updated") or ""),
    ) or datetime.utcnow().isoformat()
    merged["merged_aliases"] = sorted(
        set(target.get("merged_aliases", []))
        | set(source.get("merged_aliases", []))
    )
    return merged


def _merge_typed_graph_nodes(
    typed_graph: dict,
    relation_stats: dict,
    source: str,
    target: str,
) -> None:
    if source in typed_graph:
        for neighbor, relations in list(typed_graph[source].items()):
            if neighbor != target:
                for relation, weight in relations.items():
                    _add_typed_edge(
                        target,
                        neighbor,
                        relation,
                        weight,
                        typed_graph=typed_graph,
                    )
        del typed_graph[source]

    for node, edges in list(typed_graph.items()):
        if source in edges:
            relations = edges.pop(source)
            if node != target:
                for relation, weight in relations.items():
                    _add_typed_edge(
                        node,
                        target,
                        relation,
                        weight,
                        typed_graph=typed_graph,
                    )

    if source in relation_stats:
        for neighbor, stats in list(relation_stats[source].items()):
            if neighbor != target:
                _merge_pair_stats(target, neighbor, stats, relation_stats=relation_stats)
        del relation_stats[source]

    for node, edges in list(relation_stats.items()):
        if source in edges:
            stats = edges.pop(source)
            if node != target:
                _merge_pair_stats(node, target, stats, relation_stats=relation_stats)


def _add_typed_edge(
    source: str,
    target: str,
    relation: str,
    confidence: float,
    typed_graph: dict | None = None,
) -> None:
    if not source or not target:
        return

    graph = typed_graph if typed_graph is not None else TYPED_COMPETENCY_GRAPH
    increment = RELATION_REINFORCEMENT.get(relation, 0.25) * max(0.0, min(confidence, 1.0))
    current = graph[source][target].get(relation, 0.0)
    graph[source][target][relation] = min(1.0, current + increment)


def _rebuild_embedding_hierarchy(active_skills: set[str]) -> None:
    skills = sorted(set(SKILL_REGISTRY.keys()) | set(active_skills))
    if len(skills) < HIERARCHY_MIN_CLUSTER_SIZE:
        SKILL_HIERARCHY.clear()
        SKILL_HIERARCHY.update({
            "clusters": [],
            "edges": [],
            "updated_at": datetime.utcnow().isoformat(),
            "source": "embedding_hierarchy",
        })
        return

    try:
        vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5))
        matrix = vectorizer.fit_transform(_skill_documents(skills))
    except ValueError:
        return

    distance_matrix = cosine_distances(matrix)
    try:
        clustering = AgglomerativeClustering(
            n_clusters=None,
            metric="precomputed",
            linkage="average",
            distance_threshold=HIERARCHY_DISTANCE_THRESHOLD,
        )
    except TypeError:
        clustering = AgglomerativeClustering(
            n_clusters=None,
            affinity="precomputed",
            linkage="average",
            distance_threshold=HIERARCHY_DISTANCE_THRESHOLD,
        )
    labels = clustering.fit_predict(distance_matrix)
    clusters = []
    hierarchy_edges = []

    for label in sorted(set(labels)):
        members = [
            skill
            for skill, member_label in zip(skills, labels)
            if member_label == label
        ]
        if len(members) < HIERARCHY_MIN_CLUSTER_SIZE:
            continue

        parent = _select_cluster_parent(members, distance_matrix, skills)
        children = [member for member in members if member != parent]
        cohesion = _cluster_cohesion(members, distance_matrix, skills)
        clusters.append({
            "id": f"cluster_{label}",
            "parent": parent,
            "children": children,
            "members": members,
            "cohesion": round(cohesion, 4),
        })

        for child in children:
            confidence = max(MIN_PARENT_CONFIDENCE, min(1.0, cohesion))
            hierarchy_edges.append({
                "source": parent,
                "target": child,
                "relation": "parent_of",
                "confidence": round(confidence, 4),
            })
            _add_typed_edge(parent, child, "parent_of", confidence)
            _add_typed_edge(child, parent, "child_of", confidence)
            _merge_pair_stats(parent, child, {
                "cooccurrences": 0,
                "evidence_strength": 0.0,
                "semantic_similarity": confidence,
                "temporal_support": 0.0,
                "reverse_temporal_support": 0.0,
            })

    SKILL_HIERARCHY.clear()
    SKILL_HIERARCHY.update({
        "clusters": clusters,
        "edges": hierarchy_edges,
        "updated_at": datetime.utcnow().isoformat(),
        "source": "embedding_hierarchy",
        "distance_threshold": HIERARCHY_DISTANCE_THRESHOLD,
    })


def _hierarchy_relation(source: str, target: str) -> tuple[str, float] | None:
    for edge in SKILL_HIERARCHY.get("edges", []):
        if edge["source"] == source and edge["target"] == target:
            return "parent_of", float(edge.get("confidence", MIN_PARENT_CONFIDENCE))

        if edge["source"] == target and edge["target"] == source:
            return "child_of", float(edge.get("confidence", MIN_PARENT_CONFIDENCE))

    return None


def _skill_documents(skills: list[str]) -> list[str]:
    documents = []
    for skill in skills:
        aliases = SKILL_REGISTRY.get(skill, {}).get("aliases", [])
        documents.append(" ".join([skill, *aliases]).replace("_", " "))
    return documents


def _select_cluster_parent(
    members: list[str],
    distance_matrix: np.ndarray,
    all_skills: list[str],
) -> str:
    member_indexes = [all_skills.index(member) for member in members]
    scored = []
    for member, member_index in zip(members, member_indexes):
        mean_distance = float(np.mean([
            distance_matrix[member_index][other_index]
            for other_index in member_indexes
            if other_index != member_index
        ] or [0.0]))
        centrality = 1.0 - mean_distance
        scored.append((
            member,
            0.55 * centrality + 0.45 * _generality_score(member),
        ))

    return max(scored, key=lambda item: item[1])[0]


def _cluster_cohesion(
    members: list[str],
    distance_matrix: np.ndarray,
    all_skills: list[str],
) -> float:
    member_indexes = [all_skills.index(member) for member in members]
    similarities = []
    for index, left in enumerate(member_indexes):
        for right in member_indexes[index + 1:]:
            similarities.append(1.0 - float(distance_matrix[left][right]))

    return max(0.0, min(float(np.mean(similarities)), 1.0)) if similarities else 0.0


def _update_pair_stats(
    source: str,
    target: str,
    source_evidence: dict,
    target_evidence: dict,
    relation_stats: dict | None,
    progress_before: dict | None,
    progress_after: dict | None,
) -> dict:
    stats_store = relation_stats if relation_stats is not None else SKILL_RELATION_STATS
    stats = stats_store[source][target]
    stats["cooccurrences"] = int(stats.get("cooccurrences", 0)) + 1
    stats["evidence_strength"] = round(
        float(stats.get("evidence_strength", 0.0))
        + _evidence_confidence(source_evidence) * _evidence_confidence(target_evidence),
        4,
    )
    stats["semantic_similarity"] = round(_semantic_similarity(source, target), 4)
    stats["updated_at"] = datetime.utcnow().isoformat()

    source_before = _skill_mastery(progress_before, source)
    target_before = _skill_mastery(progress_before, target)
    source_after = _skill_mastery(progress_after, source)
    target_after = _skill_mastery(progress_after, target)
    source_gain = max(0.0, source_after - source_before)
    target_gain = max(0.0, target_after - target_before)

    if source_gain > 0 and target_before < 0.7:
        stats["temporal_support"] = round(
            0.8 * float(stats.get("temporal_support", 0.0))
            + 0.2 * min(1.0, source_gain + max(0.0, 0.7 - target_before)),
            4,
        )

    if target_gain > 0 and source_before < 0.7:
        stats["reverse_temporal_support"] = round(
            0.8 * float(stats.get("reverse_temporal_support", 0.0))
            + 0.2 * min(1.0, target_gain + max(0.0, 0.7 - source_before)),
            4,
        )

    return stats


def _merge_pair_stats(
    source: str,
    target: str,
    incoming: dict,
    relation_stats: dict | None = None,
) -> None:
    stats_store = relation_stats if relation_stats is not None else SKILL_RELATION_STATS
    current = stats_store[source][target]
    current["cooccurrences"] = int(current.get("cooccurrences", 0)) + int(
        incoming.get("cooccurrences", 0)
    )
    current["evidence_strength"] = round(
        float(current.get("evidence_strength", 0.0))
        + float(incoming.get("evidence_strength", 0.0)),
        4,
    )
    for key in ("semantic_similarity", "temporal_support", "reverse_temporal_support"):
        current[key] = max(float(current.get(key, 0.0)), float(incoming.get(key, 0.0)))
    current["updated_at"] = datetime.utcnow().isoformat()


def _cooccurrence_confidence(stats: dict) -> float:
    cooccurrences = int(stats.get("cooccurrences", 0))
    evidence_strength = float(stats.get("evidence_strength", 0.0))
    if cooccurrences <= 0:
        return 0.0

    frequency_confidence = min(cooccurrences / 4.0, 1.0)
    strength_confidence = min(evidence_strength / max(cooccurrences, 1), 1.0)
    return round(0.55 * frequency_confidence + 0.45 * strength_confidence, 4)


def _semantic_similarity(source: str, target: str) -> float:
    if source == target:
        return 1.0

    return max(
        SequenceMatcher(None, source, target).ratio(),
        _embedding_similarity(source, target),
    )


def _embedding_similarity(source: str, target: str) -> float:
    try:
        vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5))
        matrix = vectorizer.fit_transform([source, target])
    except ValueError:
        return 0.0

    return float(cosine_similarity(matrix[0], matrix[1]).flatten()[0])


def _generality_score(skill: str) -> float:
    tokens = [token for token in skill.split("_") if token]
    if not tokens:
        return 0.0

    length_score = 1.0 / len(tokens)
    abstraction_score = max(
        (
            1.0
            for token in tokens
            if token in {"model", "data", "evaluation", "learning", "analysis", "quality"}
        ),
        default=0.0,
    )
    return 0.7 * length_score + 0.3 * abstraction_score


def _skill_mastery(progress: dict | None, skill: str) -> float:
    if not progress:
        return 0.0

    skills = progress.get("skills", progress)
    state = skills.get(skill, {})
    return float(state.get("bkt_mastery", state.get("mastery", 0.0)))


def _best_fuzzy_match(name: str, candidates: list[str]) -> tuple[str, float]:
    scored = [
        (candidate, SequenceMatcher(None, name, candidate).ratio())
        for candidate in candidates
    ]
    return max(scored, key=lambda item: item[1], default=("", 0.0))


def _best_embedding_match(name: str, candidates: list[str]) -> tuple[str, float]:
    documents = candidates + [name]

    try:
        vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5))
        matrix = vectorizer.fit_transform(documents)
    except ValueError:
        return "", 0.0

    scores = cosine_similarity(matrix[-1], matrix[:-1]).flatten()
    if len(scores) == 0:
        return "", 0.0

    best_index = int(scores.argmax())
    return candidates[best_index], float(scores[best_index])


def _canonical_by_rule(normalized: str) -> str | None:
    if normalized in _TOKEN_ALIASES:
        return _TOKEN_ALIASES[normalized]

    tokens = normalized.split("_")
    if "loop" in tokens:
        return "loops"

    if "recursion" in tokens or "recursive" in tokens:
        return "recursion"

    if "function" in tokens:
        return "functions"

    return None


def _normalize_token(token: str) -> str:
    if token in _TOKEN_ALIASES:
        return _TOKEN_ALIASES[token]

    if token.endswith("ies") and len(token) > 4:
        token = f"{token[:-3]}y"
    elif token.endswith("s") and len(token) > 4 and not token.endswith("ss"):
        token = token[:-1]
    return token


def _evidence_confidence(evidence: dict) -> float:
    score = max(0.0, min(float(evidence.get("score", 0.0)) / 10.0, 1.0))
    weight = max(0.0, min(float(evidence.get("weight", 1.0)), 1.0))
    confidence = max(0.0, min(float(evidence.get("confidence", 1.0)), 1.0))
    canonical_confidence = max(
        0.0,
        min(float(evidence.get("canonical_confidence", 1.0)), 1.0),
    )
    return math.sqrt(max(score * weight * confidence * canonical_confidence, 0.0))


def _weighted_average(left: float, left_weight: int, right: float, right_weight: int) -> float:
    return (
        float(left) * left_weight
        + float(right) * right_weight
    ) / max(left_weight + right_weight, 1)
