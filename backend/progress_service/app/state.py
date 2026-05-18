'''from typing import Dict

# session_id -> {competency_name -> {evidence_count, avg_confidence, trend}}
USER_PROGRESS: Dict[str, Dict[str, dict]] = {}'''
from collections import defaultdict
import numpy as np

# competency -> related competency -> weight
COMPETENCY_GRAPH = defaultdict(lambda: defaultdict(float))

# statistics for ε-greedy

USER_ACTION_STATS = defaultdict(
    lambda: defaultdict(
        lambda: {
            "count": 0,
            "value": 0.0
        }
    )
)

from typing import Dict, List, Any

# 1. Raw данные от аналитики (не интерпретируем!)
RAW_ANALYSIS: Dict[str, List[dict]] = {}

# 2. Унифицированные evidence (через адаптер)
EVIDENCE_STORE: Dict[str, List[dict]] = {}

# 3. Агрегированный прогресс по компетенциям
# session_id -> competency -> state
USER_PROGRESS = {
}

# 4. Рекомендации (derived state)
USER_RECOMMENDATIONS: Dict[str, List[dict]] = {}

PENDING_ACTIONS = {}

USER_BANDIT_STATS = defaultdict(dict)
RECOMMENDATION_HISTORY = defaultdict(list)