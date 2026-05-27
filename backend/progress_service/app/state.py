from collections import defaultdict
from typing import Dict, List


# competency -> related competency -> weight
COMPETENCY_GRAPH = defaultdict(lambda: defaultdict(float))

# source competency -> target competency -> relation type -> weight
TYPED_COMPETENCY_GRAPH = defaultdict(lambda: defaultdict(lambda: defaultdict(float)))

# raw competency label -> canonical competency label
SKILL_ALIASES: Dict[str, str] = {}

# canonical competency -> metadata about known aliases and semantic matching
SKILL_REGISTRY: Dict[str, dict] = {}

# user_id -> action/module key -> value estimate
USER_ACTION_STATS = defaultdict(
    lambda: defaultdict(
        lambda: {
            "count": 0,
            "value": 0.0,
        }
    )
)

# user_id -> bandit action key -> LinUCB matrices/vectors
USER_BANDIT_STATS = defaultdict(dict)

# user_id -> raw analysis payloads
RAW_ANALYSIS: Dict[str, List[dict]] = {}

# user_id -> normalized evidence items
EVIDENCE_STORE: Dict[str, List[dict]] = {}

# user_id -> {"skills": ..., "clusters": ...}
USER_PROGRESS = {}

# user_id -> latest module recommendations
USER_RECOMMENDATIONS: Dict[str, List[dict]] = {}

# user_id -> pending recommendation waiting for the next attempt result
PENDING_ACTIONS = {}

# user_id:learning_session_id -> selected module context
ACTIVE_MODULES = {}

# user_id -> historical recommendations and rewards
RECOMMENDATION_HISTORY: Dict[str, List[dict]] = defaultdict(list)
