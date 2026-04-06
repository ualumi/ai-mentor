'''def extract_evidence(raw_analysis: dict) -> list[dict]:
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

    return evidence'''


def extract_evidence(raw_analysis: dict) -> list[dict]:
    evidence = []

    compliance = raw_analysis.get("task_compliance", {})
    tags = raw_analysis.get("tags", [])

    # Добавляем is_correct из correctness
    correctness = raw_analysis.get("correctness", {})
    is_correct = correctness.get("is_correct", False)
    
    '''for tag, data in tags.items():
        evidence.append({
            "competency": tag,
            "score": data.get("score", 0),
            "weight": data.get("required_weight", 1.0),
            "applied": data.get("applied", False),
            "source": "ai_analysis"
        })'''
    
    for tag_data in tags:  # tag_data — это каждый словарь из списка
        evidence.append({
            "competency": tag_data.get("name"),  # поле 'name', не 'competency'
            "score": tag_data.get("score", 0),
            "weight": tag_data.get("weight", 1.0),  # было 'required_weight', а нужно 'weight'
            "applied": tag_data.get("applied", False),
            "source": "ai_analysis"
        })

    return evidence
