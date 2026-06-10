from app.domain.skill_ontology import typed_relation_weight, update_typed_relations
from app.state import (
    COMPETENCY_GRAPH,
    USER_COMPETENCY_GRAPHS,
    USER_SKILL_RELATION_STATS,
    USER_TYPED_COMPETENCY_GRAPHS,
)


EDGE_DECAY = 0.995
EDGE_INCREMENT = 0.15
MAX_EDGE_WEIGHT = 1.0
MIN_EDGE_WEIGHT = 0.05


def update_graph(
    evidence_list: list[dict],
    user_id: str | None = None,
    progress_before: dict | None = None,
    progress_after: dict | None = None,
):
    graph = _graph_for_user(user_id)
    typed_graph = _typed_graph_for_user(user_id)
    relation_stats = _relation_stats_for_user(user_id)
    active_skills = {
        ev["competency"]
        for ev in evidence_list
        if ev.get("competency")
    }

    for source in list(graph.keys()):
        for target in list(graph[source].keys()):
            graph[source][target] *= EDGE_DECAY

            if graph[source][target] < MIN_EDGE_WEIGHT:
                del graph[source][target]

    for skill in active_skills:
        graph[skill][skill] = 1.0

    for ev in evidence_list:
        source = ev["competency"]
        score = max(0.0, min(ev.get("score", 0.0) / 10.0, 1.0))
        weight = max(0.0, min(ev.get("weight", 1.0), 1.0))
        confidence = max(0.0, min(ev.get("confidence", 1.0), 1.0))
        reinforcement = EDGE_INCREMENT * score * weight * confidence

        for target in active_skills:
            if source == target:
                continue

            current = graph[source].get(target, 0.0)
            graph[source][target] = min(
                current + reinforcement,
                MAX_EDGE_WEIGHT,
            )

    update_typed_relations(
        evidence_list,
        typed_graph=typed_graph,
        relation_stats=relation_stats,
        progress_before=progress_before,
        progress_after=progress_after,
    )


def get_related_skills(
    skill: str,
    top_k: int = 2,
    user_id: str | None = None,
) -> list[str]:
    graph = _graph_for_user(user_id)
    typed_graph = _typed_graph_for_user(user_id)
    neighbors = graph.get(skill, {})
    ranked = sorted(
        neighbors.items(),
        key=lambda item: _related_rank(skill, item[0], item[1], typed_graph),
        reverse=True,
    )

    return [
        related_skill
        for related_skill, _ in ranked
        if related_skill != skill
    ][:top_k]


def _related_rank(
    source: str,
    target: str,
    graph_weight: float,
    typed_graph: dict,
) -> float:
    pedagogical_weight = typed_relation_weight(
        source,
        target,
        {"prerequisite_of", "child_of", "parent_of", "supports"},
        typed_graph=typed_graph,
    )
    duplicate_penalty = typed_relation_weight(
        source,
        target,
        {"same_as"},
        typed_graph=typed_graph,
    )
    return graph_weight + 0.35 * pedagogical_weight - 0.5 * duplicate_penalty


def _graph_for_user(user_id: str | None) -> dict:
    if user_id is None:
        return COMPETENCY_GRAPH

    return USER_COMPETENCY_GRAPHS[str(user_id)]


def _typed_graph_for_user(user_id: str | None) -> dict:
    if user_id is None:
        from app.state import TYPED_COMPETENCY_GRAPH

        return TYPED_COMPETENCY_GRAPH

    return USER_TYPED_COMPETENCY_GRAPHS[str(user_id)]


def _relation_stats_for_user(user_id: str | None) -> dict:
    if user_id is None:
        from app.state import SKILL_RELATION_STATS

        return SKILL_RELATION_STATS

    return USER_SKILL_RELATION_STATS[str(user_id)]
