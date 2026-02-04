from datetime import datetime

def apply_evidence(user_progress: dict, session_id: str, ev: dict):
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

    user_progress[comp] = comp_state
