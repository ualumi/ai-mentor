from pydantic import BaseModel

class SSOResponse(BaseModel):
    access_token: str
    user: dict