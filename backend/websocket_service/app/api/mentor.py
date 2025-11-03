from fastapi import APIRouter, WebSocket
import asyncio
import json
from app.core.redis_client import redis
from app.core.websocket_manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()

# Redis channel для Pub/Sub
REDIS_CHANNEL = "mentor_channel"

# Пример подсказок для типовых ошибок
HINTS = {
    "SyntaxError": "Проверьте синтаксис, возможно, лишний или отсутствующий символ.",
    "IndexError": "Выход за пределы списка. Проверьте индексы.",
    "ZeroDivisionError": "Деление на ноль невозможно.",
}


# -------------------------
# WebSocket endpoint для менторского чата
# -------------------------
@router.websocket("/ws/mentor/{user_id}")
async def websocket_mentor(websocket: WebSocket, user_id: str):
    """
    При подключении пользователя добавляем его соединение
    в ConnectionManager. Отправка подсказок идёт через глобальный Redis listener.
    """
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()

            # Публикуем код пользователя в Redis
            message = {
                "user_id": user_id,
                "code": data
            }
            await redis.publish(REDIS_CHANNEL, json.dumps(message))

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(user_id)


# -------------------------
# Глобальный Redis listener
# -------------------------
async def redis_global_listener():
    pubsub = redis.pubsub()
    await pubsub.subscribe(REDIS_CHANNEL)
    print("🌐 Redis listener запущен")

    async for message in pubsub.listen():
        if message is None or message['type'] != 'message':
            continue

        try:
            payload = json.loads(message['data'])
            user_id = payload.get("user_id")
            code = payload.get("code")

            if not user_id or not code:
                continue

            # Генерация подсказки
            hint = generate_hint(code)

            # Отправка подсказки конкретному пользователю
            await manager.send_personal_message(f"ИИ-ментор: {hint}", user_id)

        except Exception as e:
            print(f"Redis listener error: {e}")


# -------------------------
# Функция для генерации подсказок
# -------------------------
def generate_hint(code: str) -> str:
    """
    Простая демонстрационная функция.
    В реальном проекте здесь подключается LLM или NLP-модель.
    """
    for error_type, hint_text in HINTS.items():
        if error_type.lower() in code.lower():
            return hint_text
    return "Попробуй проанализировать логику кода или протестировать шаг за шагом."


# -------------------------
# Стартап функции для FastAPI
# -------------------------
def start_redis_listener_on_startup(app):
    @app.on_event("startup")
    async def startup_event():
        # Запускаем глобальный listener в фоне
        asyncio.create_task(redis_global_listener())
