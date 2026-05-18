'''from datetime import datetime

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

    user_progress[comp] = comp_state'''

from datetime import datetime

ALPHA = 0.3
DECAY = 0.995

def apply_evidence(skills_state: dict, ev: dict):

    competency = ev["competency"]

    # насколько навык был задействован
    involvement_weight = ev["weight"]

    # насколько правильно применен
    score = ev["score"] / 10.0

    applied = ev["applied"]

    if not applied:
        score *= 0.3

    current_state = skills_state.get(
        competency,
        {
            "ema": 0.0,
            "attempts": 0,
            "trend": 0.0,
            "mastery": False,
            "last_updated": None,

            # NEW
            "avg_weight": 0.0,
            "deficit": 1.0
        }
    )

    prev_ema = current_state["ema"]

    # -----------------------------------
    # competence update with involvement
    # -----------------------------------

    weighted_score = score * involvement_weight
    decayed_prev = prev_ema * DECAY
    '''new_ema = (
        ALPHA * weighted_score
        + (1 - ALPHA) * prev_ema
    )'''
    new_ema = (
        ALPHA * weighted_score
        + (1 - ALPHA) * decayed_prev
    )

    # -----------------------------------
    # track average skill involvement
    # -----------------------------------

    attempts = current_state["attempts"] + 1

    prev_avg_weight = current_state["avg_weight"]

    new_avg_weight = (
        (
            prev_avg_weight
            * current_state["attempts"]
        )
        + involvement_weight
    ) / attempts

    # -----------------------------------
    # deficit estimation
    # -----------------------------------

    deficit = 1.0 - new_ema

    # -----------------------------------
    # mastery logic
    # -----------------------------------

    mastery = (
        new_ema > 0.8
        and attempts >= 3
    )

    # -----------------------------------
    # update state
    # -----------------------------------

    current_state.update({
        "ema": round(new_ema, 3),

        "attempts": attempts,

        "trend": round(
            new_ema - prev_ema,
            3
        ),

        "mastery": mastery,

        "avg_weight": round(
            new_avg_weight,
            3
        ),

        "deficit": round(
            deficit,
            3
        ),

        "last_updated": datetime.utcnow().isoformat()
    })

    skills_state[competency] = current_state
