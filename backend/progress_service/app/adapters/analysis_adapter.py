def extract_evidence(raw_analysis: dict) -> list[dict]:
    """
    Преобразует ЛЮБОЙ формат аналитики
    в унифицированные evidence.
    """
    evidence = []

    # БАЗОВЫЙ контракт (можно менять позже)
    competencies = raw_analysis.get("competencies", {})

    for name, signal in competencies.items():
        evidence.append({
            "competency": name,
            "signal": signal,          # может быть +/-
            "confidence": raw_analysis.get("confidence", 0.5),
            "weight": raw_analysis.get("weight", 1.0),
            "source": raw_analysis.get("source", "unknown")
        })

    return evidence
