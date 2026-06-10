from collections import defaultdict

from app.storage import load_events


def evaluate_recent_events(limit: int = 1000) -> dict:
    events = list(reversed(load_events(limit=limit)))

    recommendation_events = [
        event for event in events
        if event["event_type"] == "recommendation_generated"
    ]
    reward_events = [
        event for event in events
        if event["event_type"] == "reward_computed"
    ]
    progress_events = [
        event for event in events
        if event["event_type"] == "progress_updated"
    ]

    rewards = [
        event["payload"].get("reward")
        for event in reward_events
        if event["payload"].get("reward") is not None
    ]
    correctness = [
        bool(event["payload"].get("is_correct"))
        for event in reward_events
        if event["payload"].get("is_correct") is not None
    ]

    reward_by_variant = defaultdict(list)
    for event in reward_events:
        recommendation = event["payload"].get("recommendation", {})
        variant = recommendation.get("variant", "module")
        reward = event["payload"].get("reward")
        if reward is not None:
            reward_by_variant[variant].append(reward)

    progress_model_metrics = _compare_progress_models(progress_events)

    return {
        "events_seen": len(events),
        "recommendations": len(recommendation_events),
        "resolved_rewards": len(reward_events),
        "progress_updates": len(progress_events),
        "avg_reward": _avg(rewards),
        "success_rate": _avg(correctness),
        "avg_reward_by_variant": {
            variant: round(_avg(values), 4)
            for variant, values in reward_by_variant.items()
        },
        "progress_model_comparison": progress_model_metrics,
    }


def _avg(values: list[float | bool]) -> float | None:
    if not values:
        return None

    return round(sum(float(value) for value in values) / len(values), 4)


def _compare_progress_models(progress_events: list[dict]) -> dict:
    ema_errors = []
    bkt_errors = []
    bkt_wins = 0
    ema_wins = 0

    for event in progress_events:
        payload = event["payload"]
        progress_before = payload.get("progress_before", {})
        skills_before = progress_before.get("skills", {})

        for evidence in payload.get("evidence", []):
            skill = evidence.get("competency")
            if not skill:
                continue

            state_before = skills_before.get(skill, {})
            observed = _evidence_observation(evidence)
            ema_prediction = state_before.get(
                "ema_mastery",
                state_before.get("ema", 0.0),
            )
            bkt_prediction = state_before.get(
                "bkt_mastery",
                state_before.get("mastery", 0.2),
            )
            ema_error = abs(float(ema_prediction) - observed)
            bkt_error = abs(float(bkt_prediction) - observed)

            ema_errors.append(ema_error)
            bkt_errors.append(bkt_error)

            if bkt_error < ema_error:
                bkt_wins += 1
            elif ema_error < bkt_error:
                ema_wins += 1

    return {
        "samples": len(ema_errors),
        "ema_observation_mae": _avg(ema_errors),
        "bkt_observation_mae": _avg(bkt_errors),
        "bkt_better_samples": bkt_wins,
        "ema_better_samples": ema_wins,
    }


def _evidence_observation(evidence: dict) -> float:
    score = _clamp(float(evidence.get("score", 0.0)) / 10.0)

    if not evidence.get("applied", False):
        score *= 0.3

    return _clamp(score)


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(value, high))
