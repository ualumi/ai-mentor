def compute_reward(prev_ema, new_ema, is_correct, weaknesses_count):

    knowledge_gain = new_ema - prev_ema

    error_penalty = weaknesses_count * 0.05

    correctness_bonus = 0.1 if is_correct else -0.1

    reward = (
        knowledge_gain
        + correctness_bonus
        - error_penalty
    )

    return round(reward, 3)