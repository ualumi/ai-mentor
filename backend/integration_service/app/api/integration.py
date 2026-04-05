from fastapi import APIRouter, Depends
from app.application.commands.import_progress import import_progress
from app.core.security import get_current_user

router = APIRouter()

@router.post("/import-progress")
async def import_user_progress(user=Depends(get_current_user)):
    
    user_id = int(user["sub"])
    print(user_id)
    result = await import_progress(user_id)
    print(result)
    return result

from app.application.queries.get_weak_cases import get_weak_cases

@router.get("/weak-cases")
async def weak_cases(user=Depends(get_current_user)):
    user_id = int(user["sub"])
    result = await get_weak_cases(user_id)
    print(result)
    return result