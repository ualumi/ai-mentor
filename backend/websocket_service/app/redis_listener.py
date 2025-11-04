import asyncio
import json
from app.core.redis_client import redis
from app.core.websocket_manager import manager   # <- импорт singleton-а

CHANNEL_OUT = "mentor_out"

async def redis_listener():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_OUT)
    print("🔄 Redis listener запущен (websocket-service слушает mentor_out)")

    async for message in pubsub.listen():
        if message is None or message.get("type") != "message":
            continue
        try:
            payload_raw = message["data"]
            # payload_raw уже строка, если decode_responses=True
            payload = json.loads(payload_raw)
            print(f"📩 Получено из Redis: {payload}")
            user_id = payload.get("user_id")
            hint = payload.get("hint")

            if not user_id or not hint:
                continue

            # используем экземпляр manager
            await manager.send_personal_message(f"ИИ-ментор: {hint}", user_id)

        except Exception as e:
            print(f"Redis listener error: {e}")

def start_redis_listener_on_startup(app):
    @app.on_event("startup")
    async def startup_event():
        # запускаем фоновой таск
        asyncio.create_task(redis_listener())