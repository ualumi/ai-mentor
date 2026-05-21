from app.domain.graph_builder import get_related_skills
from app.state import COMPETENCY_GRAPH


MAX_RECOMMENDATIONS = 3
TASK_VARIANTS = (
    ("support", -0.1, -0.05),
    ("balanced", 0.0, 0.0),
    ("stretch", 0.1, 0.05),
)


def build_module_candidates(user_progress: dict, limit: int = MAX_RECOMMENDATIONS) -> list[dict]:
    skills = user_progress.get("skills", {})

    if not skills:
        return []

    ranked = []

    for skill, state in skills.items():
        priority = _learning_need(skill, state, user_progress)
        ranked.append((skill, priority))

    ranked.sort(key=lambda item: item[1], reverse=True)

    return [
        build_module_candidate(skill, priority, user_progress)
        for skill, priority in ranked[:limit]
    ]


def build_module_candidate(
    main_skill: str,
    priority: float,
    user_progress: dict,
) -> dict:
    skills = user_progress["skills"]
    main_state = skills[main_skill]
    related_skills = _select_related_skills(main_skill, user_progress)
    difficulty = _choose_difficulty(main_state)
    goal = _choose_goal(main_state)

    tags = [{
        "name": main_skill,
        "required_level": _main_required_level(main_state),
    }]

    for related_skill in related_skills:
        tags.append({
            "name": related_skill,
            "required_level": _related_required_level(
                skills.get(related_skill, {}),
                main_state,
            ),
        })

    return {
        "type": "educational_module",
        "main_competency": main_skill,
        "difficulty": round(difficulty, 3),
        "tags": tags[:3],
        "goal": goal,
        "priority": round(priority, 3),
        "explanation": {
            "reason": _explain_goal(goal, main_skill),
            "signals": {
                "bkt_mastery": main_state.get("bkt_mastery", main_state.get("mastery", 0.0)),
                "ema_mastery": main_state.get("ema_mastery", main_state.get("ema", 0.0)),
                "deficit": main_state.get("deficit", 1.0),
                "trend": main_state.get("trend", 0.0),
                "ema_trend": main_state.get("ema_trend", 0.0),
                "attempts": main_state.get("attempts", 0),
                "avg_involvement": main_state.get("avg_involvement", 0.0),
                "confidence": main_state.get("confidence", 0.0),
                "uncertainty": main_state.get("uncertainty", 1.0),
                "graph_degree": _graph_degree(main_skill),
            },
        },
    }


def build_task_parameter_candidates(
    module: dict,
    user_progress: dict,
) -> list[dict]:
    main_skill = module["main_competency"]
    skills = user_progress.get("skills", {})
    main_state = skills.get(main_skill, {})
    base_difficulty = _choose_difficulty(main_state)
    base_tags = module.get("tags", [])
    candidates = []

    for variant, difficulty_delta, level_delta in TASK_VARIANTS:
        tags = []

        for tag in base_tags:
            required_level = tag.get("required_level", 0.5) + level_delta
            if tag["name"] == main_skill:
                required_level += 0.05 if variant == "stretch" else 0.0

            tags.append({
                "name": tag["name"],
                "required_level": round(_clamp(required_level, 0.2, 0.95), 3),
            })

        candidates.append({
            "type": "module_task_parameters",
            "variant": variant,
            "main_competency": main_skill,
            "difficulty": round(_clamp(base_difficulty + difficulty_delta, 0.2, 0.9), 3),
            "tags": tags,
            "goal": module.get("goal", _choose_goal(main_state)),
            "priority": module.get("priority", 0.0),
            "module": {
                "main_competency": main_skill,
                "goal": module.get("goal"),
                "priority": module.get("priority"),
            },
            "explanation": {
                "reason": f"{variant} task parameters selected inside the active module.",
                "module_reason": module.get("explanation", {}).get("reason"),
                "signals": module.get("explanation", {}).get("signals", {}),
            },
        })

    return candidates


def recommendation_key(recommendation: dict) -> str:
    tags = ",".join(tag["name"] for tag in recommendation.get("tags", []))
    difficulty_bucket = round(recommendation.get("difficulty", 0.5), 1)

    return f"{recommendation['main_competency']}|{difficulty_bucket}|{tags}"


def recommendation_features(recommendation: dict, user_progress: dict) -> list[float]:
    skill = recommendation["main_competency"]
    state = user_progress.get("skills", {}).get(skill, {})
    related_tags = [
        tag["name"]
        for tag in recommendation.get("tags", [])
        if tag["name"] != skill
    ]
    related_deficit = _average_related_deficit(related_tags, user_progress)

    return [
        state.get("deficit", 1.0),
        max(0.0, -state.get("trend", 0.0)),
        min(state.get("attempts", 0), 10) / 10.0,
        state.get("avg_involvement", 0.0),
        state.get("confidence", 0.0),
        state.get("uncertainty", 1.0),
        min(_graph_degree(skill), 10) / 10.0,
        related_deficit,
    ]


def _learning_need(skill: str, state: dict, user_progress: dict) -> float:
    deficit = state.get("deficit", 1.0)
    negative_trend = max(0.0, -state.get("trend", 0.0))
    avg_involvement = state.get("avg_involvement", 0.0)
    uncertainty = state.get("uncertainty", 1.0)
    graph_bonus = min(_graph_degree(skill), 10) / 10.0
    cluster_signal = (
        user_progress
        .get("clusters", {})
        .get("signals", {})
        .get(skill, 0.0)
    )

    if avg_involvement < 0.2 and state.get("attempts", 0) < 2:
        return 0.1 * deficit

    return (
        0.45 * deficit
        + 0.2 * negative_trend
        + 0.15 * avg_involvement
        + 0.1 * graph_bonus
        + 0.05 * uncertainty
        + 0.05 * cluster_signal
    )


def _select_related_skills(main_skill: str, user_progress: dict) -> list[str]:
    skills = user_progress.get("skills", {})
    related = get_related_skills(main_skill, top_k=6)
    ranked = []

    for skill in related:
        if skill not in skills:
            continue

        relation = COMPETENCY_GRAPH[main_skill].get(skill, 0.0)
        deficit = skills[skill].get("deficit", 1.0)
        ranked.append((skill, relation * (0.5 + deficit)))

    ranked.sort(key=lambda item: item[1], reverse=True)

    selected = [skill for skill, _ in ranked[:2]]

    if len(selected) < 2:
        fallback = sorted(
            (
                (skill, state.get("deficit", 1.0))
                for skill, state in skills.items()
                if skill != main_skill and skill not in selected
            ),
            key=lambda item: item[1],
            reverse=True,
        )
        selected.extend(skill for skill, _ in fallback[: 2 - len(selected)])

    return selected[:2]


def _choose_difficulty(state: dict) -> float:
    mastery = state.get("bkt_mastery", state.get("mastery", state.get("ema", 0.0)))
    negative_trend = max(0.0, -state.get("trend", 0.0))
    uncertainty = state.get("uncertainty", 1.0)
    difficulty = 0.35 + 0.45 * mastery - 0.2 * negative_trend - 0.1 * uncertainty

    return _clamp(difficulty, 0.25, 0.85)


def _choose_goal(state: dict) -> str:
    deficit = state.get("deficit", 1.0)
    trend = state.get("trend", 0.0)
    attempts = state.get("attempts", 0)

    if attempts < 2:
        return "initial_practice"

    if deficit > 0.65 or trend < -0.05:
        return "remediation"

    if deficit > 0.35:
        return "consolidation"

    return "transfer"


def _main_required_level(state: dict) -> float:
    return round(_clamp(0.65 + 0.25 * state.get("deficit", 1.0), 0.65, 0.9), 3)


def _related_required_level(related_state: dict, main_state: dict) -> float:
    related_deficit = related_state.get("deficit", 0.5)
    main_deficit = main_state.get("deficit", 1.0)

    return round(_clamp(0.25 + 0.25 * related_deficit + 0.1 * main_deficit, 0.25, 0.6), 3)


def _average_related_deficit(related_tags: list[str], user_progress: dict) -> float:
    if not related_tags:
        return 0.0

    skills = user_progress.get("skills", {})
    deficits = [
        skills.get(tag, {}).get("deficit", 1.0)
        for tag in related_tags
    ]

    return sum(deficits) / len(deficits)


def _graph_degree(skill: str) -> int:
    return len([
        related_skill
        for related_skill in COMPETENCY_GRAPH[skill]
        if related_skill != skill
    ])


def _explain_goal(goal: str, main_skill: str) -> str:
    if goal == "remediation":
        return f"{main_skill} selected because the learner shows a high deficit or negative trend."

    if goal == "consolidation":
        return f"{main_skill} selected for medium-difficulty consolidation practice."

    if goal == "transfer":
        return f"{main_skill} selected for transfer practice after stable progress."

    return f"{main_skill} selected for initial focused practice."


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(float(value), high))
