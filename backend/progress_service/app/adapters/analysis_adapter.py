def _clamp(value, low: float, high: float) -> float:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        numeric = low

    return max(low, min(numeric, high))


def extract_evidence(raw_analysis: dict) -> list[dict]:
    evidence = []

    for tag_data in raw_analysis.get("tags", []):
        name = tag_data.get("name") or tag_data.get("competency")

        if not name:
            continue

        evidence.append({
            "competency": str(name),
            "score": _clamp(tag_data.get("score", 0.0), 0.0, 10.0),
            "weight": _clamp(tag_data.get("weight", 1.0), 0.0, 1.0),
            "applied": bool(tag_data.get("applied", False)),
            "confidence": _clamp(tag_data.get("confidence", 1.0), 0.0, 1.0),
            "source": "ai_analysis",
            "reason": tag_data.get("reason") or tag_data.get("evidence"),
        })

    return evidence
