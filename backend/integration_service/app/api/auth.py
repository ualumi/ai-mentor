from fastapi import APIRouter, HTTPException
from app.application.commands.handle_sso_login import handle_sso_login

router = APIRouter()

@router.get("/sso")
async def sso_login(token: str):
    """
    Принимаем JWT от внешней платформы
    """

    result = await handle_sso_login(token)

    return result