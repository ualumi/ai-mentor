import math

import numpy as np

from app.domain.module_builder import recommendation_features, recommendation_key
from app.state import USER_BANDIT_STATS


FEATURE_DIM = 8
EXPLORATION_ALPHA = 0.6
GLOBAL_CONTEXT_ID = "__global__"
GLOBAL_SCORE_WEIGHT = 0.35
PERSONAL_SCORE_WEIGHT = 0.65


def choose_task_parameters(
    bandit_context_id: str,
    candidates: list[dict],
    user_progress: dict,
) -> dict | None:
    if not candidates:
        return None

    best_candidate = None
    best_score = -math.inf

    for candidate in candidates:
        action_key = recommendation_key(candidate)
        features = np.array(
            recommendation_features(candidate, user_progress),
            dtype=float,
        )
        personal_score = _ucb_score(bandit_context_id, action_key, features)
        global_score = _ucb_score(GLOBAL_CONTEXT_ID, action_key, features)
        score = (
            PERSONAL_SCORE_WEIGHT * personal_score
            + GLOBAL_SCORE_WEIGHT * global_score
        )

        if score > best_score:
            best_score = score
            best_candidate = candidate

    return best_candidate


def update_task_parameter_value(
    bandit_context_id: str,
    recommendation: dict,
    user_progress_before: dict,
    reward: float,
):
    action_key = recommendation_key(recommendation)
    features = np.array(
        recommendation_features(recommendation, user_progress_before),
        dtype=float,
    )
    stats = _get_stats(bandit_context_id, action_key)
    stats["A"] += np.outer(features, features)
    stats["b"] += reward * features
    stats["count"] += 1
    stats["value"] += (reward - stats["value"]) / stats["count"]

    global_stats = _get_stats(GLOBAL_CONTEXT_ID, action_key)
    global_stats["A"] += np.outer(features, features)
    global_stats["b"] += reward * features
    global_stats["count"] += 1
    global_stats["value"] += (reward - global_stats["value"]) / global_stats["count"]


def _ucb_score(context_id: str, action_key: str, features: np.ndarray) -> float:
    stats = _get_stats(context_id, action_key)
    a_inv = np.linalg.inv(stats["A"])
    theta = a_inv @ stats["b"]
    predicted_reward = float(theta @ features)
    uncertainty = float(np.sqrt(features.T @ a_inv @ features))

    return predicted_reward + EXPLORATION_ALPHA * uncertainty


def _get_stats(bandit_context_id: str, action_key: str) -> dict:
    if action_key not in USER_BANDIT_STATS[bandit_context_id]:
        USER_BANDIT_STATS[bandit_context_id][action_key] = {
            "A": np.identity(FEATURE_DIM),
            "b": np.zeros(FEATURE_DIM),
            "count": 0,
            "value": 0.0,
        }

    return USER_BANDIT_STATS[bandit_context_id][action_key]
