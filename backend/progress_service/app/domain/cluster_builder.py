from collections import defaultdict

from app.state import COMPETENCY_GRAPH


def update_clusters(user_progress: dict):
    skills = user_progress["skills"]
    membership = {}
    cluster_signals = defaultdict(float)

    for skill, state in skills.items():
        scores = []

        for other_skill, other_state in skills.items():
            if other_skill == skill:
                continue

            relation = COMPETENCY_GRAPH[skill].get(other_skill, 0.0)
            related_deficit = other_state.get("deficit", 1.0)
            score = relation * related_deficit

            if score > 0:
                scores.append((other_skill, score))

        total = sum(score for _, score in scores) or 1.0
        normalized = [
            (related_skill, round(score / total, 3))
            for related_skill, score in scores
        ]
        membership[skill] = normalized

        source_deficit = state.get("deficit", 1.0)
        for related_skill, weight in normalized:
            cluster_signals[related_skill] += weight * source_deficit

    user_progress["clusters"] = {
        "membership": membership,
        "signals": {
            skill: round(signal, 3)
            for skill, signal in cluster_signals.items()
        },
    }
