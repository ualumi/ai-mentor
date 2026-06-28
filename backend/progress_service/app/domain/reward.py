def compute_module_reward(
    state_before: dict,
    state_after: dict,
    recommendation: dict,
    is_correct: bool,
) -> float:
    main_skill = recommendation["main_competency"]
    tags = recommendation.get("tags", [])
    related_skills = [
        tag["name"]
        for tag in tags
        if tag["name"] != main_skill
    ]

    main_gain = _skill_gain(state_before, state_after, main_skill)
    related_gain = 0.0

    if related_skills:
        related_gain = sum(
            _skill_gain(state_before, state_after, skill)
            for skill in related_skills
        ) / len(related_skills)

    correctness_bonus = 1.0 if is_correct else -0.5
    difficulty = recommendation.get("difficulty", 0.5)
    after_main = state_after.get(main_skill, {})
    difficulty_penalty = _difficulty_penalty(
        difficulty=difficulty,
        mastery=after_main.get("mastery", after_main.get("ema", 0.0)),
        is_correct=is_correct,
    )

    reward = (
        0.55 * main_gain
        + 0.2 * related_gain
        + 0.2 * correctness_bonus
        - 0.05 * difficulty_penalty
    )

    return round(reward, 4)


def _skill_gain(state_before: dict, state_after: dict, skill: str) -> float:
    before = state_before.get(skill, {}).get("mastery", 0.0)
    after = state_after.get(skill, {}).get("mastery", 0.0)

    return max(0.0, after - before)


def _difficulty_penalty(
    difficulty: float,
    mastery: float,
    is_correct: bool,
) -> float:
    if is_correct:
        return max(0.0, mastery - difficulty)

    return max(0.0, difficulty - mastery)


def compute_reward(
    prev_ema: float,
    new_ema: float,
    is_correct: bool,
    time_spent: float = 1.0,
    attempts: int = 1,
    deficit_before: float = 0.0,
):
    knowledge_gain = new_ema - prev_ema
    efficiency = knowledge_gain / (1.0 + time_spent)
    correctness = 1.0 if is_correct else -0.5
    difficulty_penalty = attempts * 0.05
    deficit_reduction = max(0.0, deficit_before - (1.0 - new_ema))

    reward = (
        0.5 * efficiency
        + 0.3 * correctness
        + 0.2 * deficit_reduction
        - difficulty_penalty
    )

    return round(reward, 4)
