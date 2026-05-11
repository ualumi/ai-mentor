import random
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
    ) / n