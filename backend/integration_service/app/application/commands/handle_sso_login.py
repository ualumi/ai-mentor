import jwt
import os
from app.infrastructure.db import save_external_identity, get_external_identity
from app.application.services.token_service import create_internal_token

SECRET = os.getenv("SSO_SHARED_SECRET", "supersecret")

async def handle_sso_login(token: str):

    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"], audience="practice_platform")
    except Exception:
        raise Exception("Invalid SSO token")

    external_user_id = payload["sub"]
    email = payload["email"]
    username = payload["username"]

    # 🔎 проверяем есть ли пользователь
    existing = await get_external_identity(external_user_id)

    if existing:
        internal_user_id = existing["internal_user_id"]
    else:
        # 🔥 создаем нового пользователя (упрощенно)
        internal_user_id = int(external_user_id)

        await save_external_identity(
            external_user_id=external_user_id,
            internal_user_id=internal_user_id,
            email=email
        )

    # 🔐 создаем НАШ JWT
    access_token = create_internal_token({
        "sub": str(internal_user_id),
        "email": email
    })

    return {
        "access_token": access_token,
        "user": {
            "id": internal_user_id,
            "email": email,
            "username": username
        }
    }