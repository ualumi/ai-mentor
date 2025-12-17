'''import asyncio
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
        asyncio.create_task(redis_listener())'''

import asyncio
import json
from app.core.redis_client import redis
from app.core.websocket_manager import manager

# Каналы Redis
CHANNEL_MENTOR_OUT = "mentor_out"       # подсказки ИИ-ментора
CHANNEL_RESULTS = "code_results"        # результаты выполнения кода песочницей
#new
CHANNEL_MENTOR_RESPONSE = "mentor_response"

async def redis_listener():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_MENTOR_OUT, CHANNEL_RESULTS)
    #new
    await pubsub.subscribe(CHANNEL_RESULTS, CHANNEL_MENTOR_RESPONSE)

    print("🔄 Redis listener запущен (websocket-service слушает mentor_out и code_results)")

    async for message in pubsub.listen():
        if message is None or message.get("type") != "message":
            continue
        try:
            payload_raw = message["data"]
            payload = json.loads(payload_raw)
            user_id = payload.get("user_id")

            if message["channel"] == CHANNEL_MENTOR_OUT:
                hint = payload.get("hint")
                if not user_id or hint is None:
                    continue
                await manager.send_personal_message(f"ИИ-ментор: {hint}", user_id)

            elif message["channel"] == CHANNEL_RESULTS:
                result = payload.get("result")
                if not user_id or result is None:
                    continue
                await manager.send_personal_message(f"Песочница:\n{result}", user_id)
            
            #new
            elif message["channel"] == CHANNEL_MENTOR_RESPONSE:
                hint = payload.get("hint")
                await manager.send_personal_message(
                    f"ИИ-ментор: {hint}", user_id
                )

        except Exception as e:
            print(f"Redis listener error: {e}")


def start_redis_listener_on_startup(app):
    @app.on_event("startup")
    async def startup_event():
        asyncio.create_task(redis_listener())
