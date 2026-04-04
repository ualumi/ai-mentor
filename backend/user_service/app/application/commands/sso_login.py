import httpx
import asyncio
from app.application.queries.get_by_email import get_user_by_email
from app.core.models import User
from app.core.database import AsyncSession
from app.core.security import create_access_token

INTEGRATION_SERVICE_URL = "http://integration_service:8012/api/integration/sso"
REDIS_URL = "redis://localhost:6379"  # если нужно слушать события

async def sso_login_command(sso_token: str, db: AsyncSession):
    # 1️⃣ Запрос к integration_service
    async with httpx.AsyncClient() as client:
        r = await client.get(INTEGRATION_SERVICE_URL, params={"token": sso_token}, timeout=5)
    if r.status_code != 200:
        raise ValueError(f"SSO failed: {r.text}")

    data = r.json()
    user_data = data.get("user")
    if not user_data:
        raise ValueError("No user data returned from SSO")

    email = user_data["email"]

    # 2️⃣ Проверяем есть ли пользователь локально
    user = await get_user_by_email(email, db)
    if not user:
        # Создаем пользователя локально без пароля
        from app.core.models import User
        user = User(
            username=user_data.get("username", email.split("@")[0]),
            email=email,
            password_hash=""  # пустой пароль, авторизация через SSO
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # 3️⃣ Генерация локального JWT
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return token, user_data