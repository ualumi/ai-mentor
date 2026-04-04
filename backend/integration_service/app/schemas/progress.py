from pydantic import BaseModel
from typing import Dict

class ProgressResponse(BaseModel):
    status: str
    skills: Dict[str, float]