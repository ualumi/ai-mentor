from pydantic import BaseModel

class StartSessionRequest(BaseModel):
  #intervention_id: str
  competency: str


class SessionResponse(BaseModel):
    session_id: str
    competency: str
    methodology: str
    current_step: int
