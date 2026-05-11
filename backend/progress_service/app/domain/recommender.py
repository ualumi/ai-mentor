

'''def build_recommendations(progress: dict) -> list[dict]:
    recs = []

    for comp, state in progress.items():
        ema = state["ema"]
        trend = state["trend"]
        attempts = state["attempts"]
        mastery = state["mastery"]

        if ema < 0.5 and attempts >= 2:
            recs.append({
                "type": "module",
                "competency": comp,
                "priority": "high"
            })

        elif 0.5 <= ema < 0.75 and abs(trend) < 0.05:
            recs.append({
                "type": "practice",
                "competency": comp,
                "priority": "medium"
            })

        elif mastery:
            recs.append({
                "type": "challenge",
                "competency": comp,
                "priority": "low"
            })

    return recs'''

from app.domain.bandit_policy import choose_action
from app.state import COMPETENCY_GRAPH

def build_recommendations(progress):

    candidate_actions = []

    for comp, state in progress.items():

        ema = state["ema"]

        # слабая компетенция
        if ema < 0.7:

            candidate_actions.append(comp)

            # добавляем связанные узлы графа
            neighbors = COMPETENCY_GRAPH.get(comp, {})

            for neighbor, weight in neighbors.items():

                if weight > 0.3:
                    candidate_actions.append(neighbor)

    if not candidate_actions:
        return []

    selected = choose_action(candidate_actions)
    print(f"🎯 Selected action: {selected} from candidates: {candidate_actions}")
    print(COMPETENCY_GRAPH)
    return [{
        "type": "adaptive_practice",
        "competency": selected
    }]
