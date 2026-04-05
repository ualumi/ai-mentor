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