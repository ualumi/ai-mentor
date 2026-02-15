from pydantic import BaseModel
from typing import List, Dict, Any


class AnalysisPayload(BaseModel):
    test_code: Dict[str, Any]
    analysis_result: Dict[str, Any]


class CodeAnnotation(BaseModel):
    line: int
    type: str
    message: str
    confidence: float