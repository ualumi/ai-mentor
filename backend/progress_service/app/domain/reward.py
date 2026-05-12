'''def compute_reward(prev_ema, new_ema, is_correct, weaknesses_count):

    knowledge_gain = new_ema - prev_ema

    error_penalty = weaknesses_count * 0.05

    correctness_bonus = 0.1 if is_correct else -0.1

    reward = (
        knowledge_gain
        + correctness_bonus
        - error_penalty
    )

    return round(reward, 3)'''

def compute_reward(
    prev_ema: float,
    new_ema: float,
    is_correct: bool,
    time_spent: float = 1.0,
    attempts: int = 1,
    deficit_before: float = 0.0
):

    knowledge_gain = new_ema - prev_ema

    efficiency = knowledge_gain / (1.0 + time_spent)

    correctness = 1.0 if is_correct else -0.5

    difficulty_penalty = attempts * 0.05

    # важный смысл: насколько система закрыла дефицит
    deficit_reduction = max(0.0, deficit_before - (1.0 - new_ema))

    reward = (
        0.5 * efficiency +
        0.3 * correctness +
        0.2 * deficit_reduction -
        difficulty_penalty
    )

    return round(reward, 4)