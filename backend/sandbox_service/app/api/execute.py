from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.sandbox_runner import run_code

router = APIRouter()

class CodeRequest(BaseModel):
    code: str

@router.post("/execute")
async def execute_code(request: CodeRequest):
    if not request.code:
        raise HTTPException(status_code=400, detail="Code is required")
    result = await run_code(request.code)
    return result
