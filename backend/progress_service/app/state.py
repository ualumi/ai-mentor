'''from typing import Dict

# session_id -> {competency_name -> {evidence_count, avg_confidence, trend}}
USER_PROGRESS: Dict[str, Dict[str, dict]] = {}'''

from typing import Dict, List, Any

# 1. Raw данные от аналитики (не интерпретируем!)
RAW_ANALYSIS: Dict[str, List[dict]] = {}

# 2. Унифицированные evidence (через адаптер)
EVIDENCE_STORE: Dict[str, List[dict]] = {}

# 3. Агрегированный прогресс по компетенциям
# session_id -> competency -> state
USER_PROGRESS: Dict[str, Dict[str, dict]] = {}


# 4. Рекомендации (derived state)
USER_RECOMMENDATIONS: Dict[str, List[dict]] = {}