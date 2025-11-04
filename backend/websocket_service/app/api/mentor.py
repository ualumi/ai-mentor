from fastapi import APIRouter, WebSocket
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
        manager.disconnect(user_id)