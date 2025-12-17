'''from app.core.security import verify_access_token

async def verify_token_query(token: str):
    return verify_access_token(token)'''

'''from fastapi import Header
from app.core.security import verify_access_token

# Теперь FastAPI будет искать заголовок "token"
async def verify_token_query(token: str = Header(...)):
    return verify_access_token(token)'''

from fastapi import Query, HTTPException
from app.core.security import verify_access_token

async def verify_token_query(token: str = Query(...)):
    """
    Принимает токен из URL: /auth/verify-token?token=...
    """
    # Вызываем вашу функцию проверки из security.py
    payload = verify_access_token(token)
    
    # Рекомендуется вернуть user_id явно, чтобы websocket_service его легко прочитал
    return {
        "user_id": payload.get("sub"), 
        "email": payload.get("email")
    }
