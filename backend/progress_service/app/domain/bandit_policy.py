'''import random
from app.state import ACTION_STATS

EPSILON = 0.2

def choose_action(actions):

    # exploration
    if random.random() < EPSILON:
        return random.choice(actions)

    # exploitation
    best_action = None
    best_value = -999

    for action in actions:

        stats = ACTION_STATS[action]

        if stats["value"] > best_value:
            best_value = stats["value"]
            best_action = action

    return best_action or random.choice(actions)

def update_action_value(action, reward):

    stats = ACTION_STATS[action]

    stats["count"] += 1

    n = stats["count"]

    stats["value"] += (
        reward - stats["value"]
    ) / n'''

import random
from app.state import COMPETENCY_GRAPH, USER_ACTION_STATS, USER_PROGRESS


EPSILON = 0.2


def get_deficit_vector(user_progress: dict):
    """
    Converts mastery → deficiency
    """
    return {
        comp: 1.0 - state["ema"]
        for comp, state in user_progress.items()
    }


def compute_graph_signal(action, context):
    """
    How strongly action is connected to weak skills
    """

    score = 0.0

    top_weak = sorted(context.items(), key=lambda x: x[1], reverse=True)[:3]

    for weak_comp, deficit in top_weak:
        score += COMPETENCY_GRAPH[weak_comp].get(action, 0.0) * deficit

    return score


'''def choose_action(user_id: str, actions: list[str]):

    user_progress = USER_PROGRESS[user_id]
    context = get_deficit_vector(user_progress)

    #actions = list(user_progress.keys())

    if not actions:
        return None

    # exploration
    if random.random() < EPSILON:
        return random.choice(actions)

    best_action = None
    best_score = -1e9

    for action in actions:

        base_value = ACTION_STATS[action]["value"]

        graph_bonus = compute_graph_signal(action, context)

        final_score = base_value + 0.7 * graph_bonus

        if final_score > best_score:
            best_score = final_score
            best_action = action

    return best_action'''

'''def choose_action(user_id: str, actions: list[str]):

    # exploration
    if random.random() < EPSILON:
        return random.choice(actions)

    best_action = None
    best_score = -1e9

    user_progress = USER_PROGRESS.get(user_id, {})

    context = {
        comp: 1.0 - state["ema"]
        for comp, state in user_progress.items()
    }

    for action in actions:

        base_value = ACTION_STATS[action]["value"]

        graph_bonus = 0.0

        for weak, deficit in context.items():
            graph_bonus += COMPETENCY_GRAPH[weak].get(action, 0.0) * deficit

        score = base_value + 0.7 * graph_bonus

        if score > best_score:
            best_score = score
            best_action = action

    return best_action or random.choice(actions)'''
import random

from app.state import (
    USER_PROGRESS,
    USER_ACTION_STATS,
    COMPETENCY_GRAPH
)

EPSILON = 0.2


def choose_action(user_id: str, actions: list[str]):

    if not actions:
        return None

    # exploration
    if random.random() < EPSILON:
        return random.choice(actions)

    best_action = None
    best_score = -1e9

    user_progress = USER_PROGRESS.get(
        user_id,
        {
            "skills": {},
            "clusters": {}
        }
    )

    skills = user_progress.get(
        "skills",
        {}
    )

    # -----------------------------
    # weak skills context
    # -----------------------------
    context = {
        comp: state.get("deficit", 1.0)
        for comp, state in skills.items()
    }

    # -----------------------------
    # graph-aware scoring
    # -----------------------------
    for action in actions:

        #base_value = ACTION_STATS[action]["value"]
        base_value = (
            USER_ACTION_STATS[user_id][action]["value"]
        )

        graph_bonus = 0.0

        for weak_skill, deficit in context.items():

            relation_weight = (
                COMPETENCY_GRAPH[weak_skill]
                .get(action, 0.0)
            )

            graph_bonus += (
                relation_weight * deficit
            )

        final_score = (
            base_value
            + 0.7 * graph_bonus
        )

        if final_score > best_score:
            best_score = final_score
            best_action = action

    return best_action


#def update_action_value(action: str, reward: float):

    #stats = ACTION_STATS[action]
def update_action_value(
    user_id: str,
    action: str,
    reward: float
):

    stats = USER_ACTION_STATS[user_id][action]

    stats["count"] += 1

    n = stats["count"]

    stats["value"] += (reward - stats["value"]) / n