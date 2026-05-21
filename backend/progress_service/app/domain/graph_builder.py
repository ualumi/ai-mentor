from app.state import COMPETENCY_GRAPH


EDGE_DECAY = 0.995
EDGE_INCREMENT = 0.15
MAX_EDGE_WEIGHT = 1.0
MIN_EDGE_WEIGHT = 0.05


def update_graph(evidence_list: list[dict]):
    active_skills = {
        ev["competency"]
        for ev in evidence_list
        if ev.get("competency")
    }

    for source in list(COMPETENCY_GRAPH.keys()):
        for target in list(COMPETENCY_GRAPH[source].keys()):
            COMPETENCY_GRAPH[source][target] *= EDGE_DECAY

            if COMPETENCY_GRAPH[source][target] < MIN_EDGE_WEIGHT:
                del COMPETENCY_GRAPH[source][target]

    for skill in active_skills:
        COMPETENCY_GRAPH[skill][skill] = 1.0

    for ev in evidence_list:
        source = ev["competency"]
        score = max(0.0, min(ev.get("score", 0.0) / 10.0, 1.0))
        weight = max(0.0, min(ev.get("weight", 1.0), 1.0))
        confidence = max(0.0, min(ev.get("confidence", 1.0), 1.0))
        reinforcement = EDGE_INCREMENT * score * weight * confidence

        for target in active_skills:
            if source == target:
                continue

            current = COMPETENCY_GRAPH[source].get(target, 0.0)
            COMPETENCY_GRAPH[source][target] = min(
                current + reinforcement,
                MAX_EDGE_WEIGHT,
            )


def get_related_skills(skill: str, top_k: int = 2) -> list[str]:
    neighbors = COMPETENCY_GRAPH.get(skill, {})
    ranked = sorted(
        neighbors.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    return [
        related_skill
        for related_skill, _ in ranked
        if related_skill != skill
    ][:top_k]
