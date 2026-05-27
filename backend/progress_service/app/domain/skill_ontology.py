import math
import re
from datetime import datetime
from difflib import SequenceMatcher

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.state import (
    COMPETENCY_GRAPH,
    SKILL_ALIASES,
    SKILL_REGISTRY,
    TYPED_COMPETENCY_GRAPH,
)


MERGE_SIMILARITY_THRESHOLD = 0.86
FUZZY_SIMILARITY_THRESHOLD = 0.92
MIN_PARENT_CONFIDENCE = 0.72

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

_STATIC_PARENTS = {
    "algorithms": {"recursion", "sorting", "search", "dynamic_programming"},
    "programming": {
        "loops",
        "functions",
        "conditionals",
        "recursion",
        "variables",
        "data_structures",
    },
    "math": {"algebra", "calculus", "statistics", "probability", "discrete_math"},
    "discrete_math": {"recursion", "graphs", "combinatorics"},
    "functions": {"recursion"},
}

_STATIC_PREREQUISITES = {
    "recursion": {"functions", "conditionals", "call_stack", "base_case"},
    "loops": {"variables", "conditionals"},
    "dynamic_programming": {"recursion", "arrays"},
}


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
        return SKILL_ALIASES[normalized], 1.0, "alias"

    canonical_by_rule = _canonical_by_rule(normalized)
    if canonical_by_rule:
        return canonical_by_rule, 0.98, "rule"

    candidates = list(SKILL_REGISTRY.keys())
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


def merge_skill_state(skills_state: dict, raw_name: str, canonical: str) -> None:
    raw_normalized = normalize_skill_name(raw_name)
    if raw_normalized == canonical:
        return

    source_keys = [
        key for key in (raw_name, raw_normalized)
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

    if source in COMPETENCY_GRAPH:
        for neighbor, weight in list(COMPETENCY_GRAPH[source].items()):
            if neighbor != target:
                COMPETENCY_GRAPH[target][neighbor] = max(
                    COMPETENCY_GRAPH[target].get(neighbor, 0.0),
                    weight,
                )
        del COMPETENCY_GRAPH[source]

    for node, edges in list(COMPETENCY_GRAPH.items()):
        if source in edges:
            weight = edges.pop(source)
            if node != target:
                edges[target] = max(edges.get(target, 0.0), weight)

    if target in COMPETENCY_GRAPH:
        COMPETENCY_GRAPH[target][target] = 1.0

    _merge_typed_graph_nodes(source, target)


def update_typed_relations(evidence_list: list[dict]) -> None:
    active_skills = {
        evidence["competency"]
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
            _add_typed_edge(source, normalize_skill_name(raw), "same_as", confidence)
            _add_typed_edge(normalize_skill_name(raw), source, "same_as", confidence)

        for target in active_skills:
            if target == source:
                continue

            relation, relation_confidence = infer_relation(source, target)
            reinforcement = confidence * relation_confidence
            _add_typed_edge(source, target, relation, reinforcement)


def infer_relation(source: str, target: str) -> tuple[str, float]:
    if source == target:
        return "same_as", 1.0

    if _is_parent(source, target):
        return "parent_of", 0.9

    if _is_parent(target, source):
        return "child_of", 0.9

    if target in _STATIC_PREREQUISITES.get(source, set()):
        return "prerequisite_of", 0.82

    if source in _STATIC_PREREQUISITES.get(target, set()):
        return "supports", 0.72

    source_tokens = set(source.split("_"))
    target_tokens = set(target.split("_"))
    if source_tokens and target_tokens and source_tokens < target_tokens:
        return "parent_of", MIN_PARENT_CONFIDENCE
    if source_tokens and target_tokens and target_tokens < source_tokens:
        return "child_of", MIN_PARENT_CONFIDENCE

    return "related_to", 0.6


def typed_relation_weight(source: str, target: str, relation_types: set[str] | None = None) -> float:
    relations = TYPED_COMPETENCY_GRAPH.get(source, {}).get(target, {})
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


def _merge_typed_graph_nodes(source: str, target: str) -> None:
    if source in TYPED_COMPETENCY_GRAPH:
        for neighbor, relations in list(TYPED_COMPETENCY_GRAPH[source].items()):
            if neighbor != target:
                for relation, weight in relations.items():
                    _add_typed_edge(target, neighbor, relation, weight)
        del TYPED_COMPETENCY_GRAPH[source]

    for node, edges in list(TYPED_COMPETENCY_GRAPH.items()):
        if source in edges:
            relations = edges.pop(source)
            if node != target:
                for relation, weight in relations.items():
                    _add_typed_edge(node, target, relation, weight)


def _add_typed_edge(source: str, target: str, relation: str, confidence: float) -> None:
    if not source or not target:
        return

    increment = RELATION_REINFORCEMENT.get(relation, 0.25) * max(0.0, min(confidence, 1.0))
    current = TYPED_COMPETENCY_GRAPH[source][target].get(relation, 0.0)
    TYPED_COMPETENCY_GRAPH[source][target][relation] = min(1.0, current + increment)


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


def _is_parent(parent: str, child: str) -> bool:
    return child in _STATIC_PARENTS.get(parent, set())


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
