from pydantic import BaseModel
from typing import Optional

class FrontendMessage(BaseModel):
    type: str
    mode: Optional[str] = None  # free | module
    event: Optional[str] = None  # run_code | submit_code
    code: Optional[str] = None