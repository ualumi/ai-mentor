from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
import aiohttp
import json
from app.core.redis_client import redis
from app.core.websocket_manager import manager

router = APIRouter()

CHANNEL_IN = "mentor_in"  # код от пользователя → AI

# 🔹 URL user_service — можно взять из docker-compose сети
USER_SERVICE_URL = "http://user_service:8002/auth/verify-token"


async def verify_token(token: str):
    """Проверка токена через user_service"""
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(
                USER_SERVICE_URL,
                headers={"Authorization": f"Bearer {token}"}
            ) as resp:
                if resp.status == 200:
                    return await resp.json()  # { "user_id": ..., "email": ... }
                return None
        except Exception as e:
            print(f"⚠️ Ошибка запроса к user_service: {e}")
            return None


@router.websocket("/ws/mentor")
async def websocket_mentor(websocket: WebSocket):
    """
    WebSocket соединение пользователя.
    Проверяет токен через user_service.
    Отправляет введённый код в Redis → mentor_in.
    """
    # 1️⃣ Принимаем подключение
    await websocket.accept()

    # 2️⃣ Извлекаем токен из query-параметров
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        print("❌ Отклонено подключение: отсутствует токен")
        return

    # 3️⃣ Проверяем токен через user_service
    user_data = await verify_token(token)
    if not user_data:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        print("❌ Отклонено подключение: неверный токен")
        return

    # 4️⃣ Получаем user_id из ответа user_service
    user_id = str(user_data.get("user_id"))
    print(f"✅ Подключён пользователь {user_id}")

    # 5️⃣ Подключаем WebSocket к менеджеру
    await manager.connect(websocket, user_id)

    try:
        while True:
            # 6️⃣ Получаем сообщение от клиента
            data = await websocket.receive_text()
            message = {"user_id": user_id, "code": data}

            # 7️⃣ Отправляем сообщение в Redis
            await redis.publish(CHANNEL_IN, json.dumps(message))
    except WebSocketDisconnect:
        print(f"🔌 Отключился пользователь {user_id}")
    except Exception as e:
        print(f"⚠️ WebSocket error: {e}")
    finally:
        manager.disconnect(user_id)



'''from fastapi import APIRouter, WebSocket
import json
from app.core.redis_client import redis
from app.core.websocket_manager import manager

router = APIRouter()

CHANNEL_IN = "mentor_in"   # код от пользователя → AI
# Ответы слушаются из mentor_out (через redis_listener)

@router.websocket("/ws/mentor/{user_id}")
async def websocket_mentor(websocket: WebSocket, user_id: str):
    """
    WebSocket соединение пользователя.
    Отправляет введённый код в Redis → mentor_in.
    Ответы приходят через redis_listener.
    """
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = {"user_id": user_id, "code": data}
            await redis.publish(CHANNEL_IN, json.dumps(message))
    except Exception as e:
        print(f"⚠️ WebSocket error: {e}")
    finally:
        manager.disconnect(user_id)'''