from datetime import datetime


ALPHA = 0.35
DECAY = 0.995
MASTERY_THRESHOLD = 0.8
BKT_PRIOR = 0.2
BKT_LEARN = 0.12
BKT_GUESS = 0.2
BKT_SLIP = 0.1


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(float(value), high))


def apply_evidence(skills_state: dict, ev: dict):
    competency = ev["competency"]
    involvement = _clamp(ev.get("weight", 1.0))
    confidence = _clamp(ev.get("confidence", 1.0))
    score = _clamp(ev.get("score", 0.0) / 10.0)

    if not ev.get("applied", False):
        score *= 0.3

    current_state = skills_state.get(
        competency,
        {
            "ema": 0.0,
            "ema_mastery": 0.0,
            "bkt_mastery": BKT_PRIOR,
            "mastery": 0.0,
            "recent_performance": 0.0,
            "attempts": 0,
            "trend": 0.0,
            "avg_involvement": 0.0,
            "confidence": 0.0,
            "deficit": 1.0,
            "uncertainty": 1.0,
            "mastery_reached": False,
            "bkt": {
                "prior": BKT_PRIOR,
                "learn": BKT_LEARN,
                "guess": BKT_GUESS,
                "slip": BKT_SLIP,
            },
            "last_updated": None,
        },
    )

    prev_ema = current_state.get("ema_mastery", current_state.get("ema", 0.0))
    prev_bkt = current_state.get("bkt_mastery", current_state.get("mastery", BKT_PRIOR))
    decayed_prev = prev_ema * DECAY
    effective_signal = score * involvement * confidence
    dynamic_alpha = ALPHA * max(0.2, involvement) * max(0.3, confidence)

    new_ema = (
        dynamic_alpha * effective_signal
        + (1.0 - dynamic_alpha) * decayed_prev
    )
    new_bkt = _update_bkt_mastery(
        prev_mastery=prev_bkt,
        observed_success=score,
        involvement=involvement,
        confidence=confidence,
        applied=ev.get("applied", False),
        params=current_state.get("bkt", {}),
    )
    bkt_params = {
        "prior": BKT_PRIOR,
        "learn": BKT_LEARN,
        "guess": BKT_GUESS,
        "slip": BKT_SLIP,
    }
    new_recent_performance = (
        0.5 * effective_signal
        + 0.5 * current_state.get("recent_performance", 0.0)
    )

    attempts = current_state.get("attempts", 0) + 1
    prev_avg_involvement = current_state.get("avg_involvement", 0.0)
    prev_confidence = current_state.get("confidence", 0.0)

    avg_involvement = (
        prev_avg_involvement * current_state.get("attempts", 0)
        + involvement
    ) / attempts
    avg_confidence = (
        prev_confidence * current_state.get("attempts", 0)
        + confidence
    ) / attempts

    deficit = 1.0 - new_bkt
    uncertainty = 1.0 / (1.0 + attempts * avg_confidence * avg_involvement)
    mastery_reached = new_bkt >= MASTERY_THRESHOLD and attempts >= 3

    current_state.update({
        "ema": round(new_ema, 3),
        "ema_mastery": round(new_ema, 3),
        "bkt_mastery": round(new_bkt, 3),
        "mastery": round(new_bkt, 3),
        "recent_performance": round(new_recent_performance, 3),
        "attempts": attempts,
        "trend": round(new_bkt - prev_bkt, 3),
        "ema_trend": round(new_ema - prev_ema, 3),
        "avg_involvement": round(avg_involvement, 3),
        "confidence": round(avg_confidence, 3),
        "deficit": round(deficit, 3),
        "uncertainty": round(uncertainty, 3),
        "mastery_reached": mastery_reached,
        "bkt": bkt_params,
        "progress_model": "bkt_with_ema_baseline",
        "last_updated": datetime.utcnow().isoformat(),
    })

    skills_state[competency] = current_state


def _update_bkt_mastery(
    prev_mastery: float,
    observed_success: float,
    involvement: float,
    confidence: float,
    applied: bool,
    params: dict,
) -> float:
    prior = _clamp(prev_mastery)
    learn = _effective_learn_rate(params.get("learn", BKT_LEARN), involvement, confidence)
    guess = _clamp(params.get("guess", BKT_GUESS), 0.01, 0.49)
    slip = _effective_slip_rate(params.get("slip", BKT_SLIP), confidence, applied)
    observation = _clamp(observed_success)

    p_correct = prior * (1.0 - slip) + (1.0 - prior) * guess
    posterior_if_correct = prior * (1.0 - slip) / max(p_correct, 1e-9)

    p_incorrect = prior * slip + (1.0 - prior) * (1.0 - guess)
    posterior_if_incorrect = prior * slip / max(p_incorrect, 1e-9)

    posterior = (
        observation * posterior_if_correct
        + (1.0 - observation) * posterior_if_incorrect
    )
    learned_after_attempt = posterior + (1.0 - posterior) * learn

    return _clamp(learned_after_attempt)


def _effective_learn_rate(base_learn: float, involvement: float, confidence: float) -> float:
    return _clamp(
        base_learn * max(0.25, involvement) * max(0.35, confidence),
        0.01,
        0.35,
    )


def _effective_slip_rate(base_slip: float, confidence: float, applied: bool) -> float:
    slip = base_slip + (0.08 * (1.0 - confidence))

    if not applied:
        slip += 0.07

    return _clamp(slip, 0.02, 0.45)
