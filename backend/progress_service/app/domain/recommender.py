'''def build_recommendations(progress: dict) -> list[dict]:
    """
    Генерирует рекомендации на основе прогресса.
    """
    recommendations = []

    for comp, state in progress.items():
        if state["level"] < 0.4 and state["evidence_count"] >= 2:
            recommendations.append({
                "type": "module",
                "competency": comp,
                "reason": "low_confidence",
                "priority": "high"
            })

    return recommendations'''

def build_recommendations(progress: dict) -> list[dict]:
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

    return recs
