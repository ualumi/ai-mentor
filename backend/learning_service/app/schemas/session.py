from pydantic import BaseModel

class StartSessionRequest(BaseModel):
    competency: str
    methodology: str


class SessionResponse(BaseModel):
    session_id: str
    competency: str
    methodology: str
    current_step: int
