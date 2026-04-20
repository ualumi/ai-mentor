from datetime import datetime

'''def apply_evidence(user_progress: dict, session_id: str, ev: dict):
    comp = ev["competency"]
    signal = ev["signal"]
    confidence = ev["confidence"]

    comp_state = user_progress.get(comp, {
        "evidence_count": 0,
        "level": 0.0,
        "trend": 0.0,
        "last_update": None
    })

    n = comp_state["evidence_count"]
    prev_level = comp_state["level"]

    # простая агрегация (можно заменить моделью)
    new_level = (prev_level * n + signal * confidence) / (n + 1)

    comp_state.update({
        "evidence_count": n + 1,
        "level": new_level,
        "trend": new_level - prev_level,
        "last_update": datetime.utcnow().isoformat()
    })

    user_progress[comp] = comp_state'''

ALPHA = 0.3  # скорость обучения

def apply_evidence(user_progress: dict, ev: dict):
    comp = ev["competency"]
    score = ev["score"] / 10.0     # нормализация
    weight = ev["weight"]
    applied = ev["applied"]

    if not applied:
        score *= 0.3  # штраф за неприменённое знание

    comp_state = user_progress.get(comp, {
        "ema": 0.0,
        "attempts": 0,
        "trend": 0.0,
        "mastery": False
    })

    prev = comp_state["ema"]
    new = ALPHA * score * weight + (1 - ALPHA) * prev

    comp_state.update({
        "ema": round(new, 3),
        "attempts": comp_state["attempts"] + 1,
        "trend": round(new - prev, 3),
        "mastery": new > 0.8 and comp_state["attempts"] >= 3
        #"mastery": True
    })

    user_progress[comp] = comp_state
