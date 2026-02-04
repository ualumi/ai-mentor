from pydantic import BaseModel

class StepRequest(BaseModel):
    session_id: str
    step_id: int
    code: str
    competency: str


class StepResponse(BaseModel):
    status: str
    hint: str | None = None
