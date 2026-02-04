def build_recommendations(progress: dict) -> list[dict]:
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

    return recommendations
