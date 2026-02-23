from pydantic import BaseModel

class StepRequest(BaseModel):
    user_id: str
    learning_session_id: str
    step_id: int
    code: str
    failed_attempts: int
    competency: str

class StepResponse(BaseModel):
    status: str
    hint: str | None = None