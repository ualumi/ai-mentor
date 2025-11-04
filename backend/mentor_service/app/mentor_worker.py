'''import asyncio, json
from app.core.redis_client import redis
from app.utils.hint_logic import generate_hint

CHANNEL_IN = "mentor_in"
CHANNEL_OUT = "mentor_out"

async def mentor_worker():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_IN)
    print("🧠 Mentor AI слушает Redis канал mentor_in...")

    async for message in pubsub.listen():
        if message is None or message["type"] != "message":
            continue

        try:
            payload = json.loads(message["data"])
            user_id = payload.get("user_id")
            code = payload.get("code")

            if not user_id or not code:
                continue

            # Генерация подсказки (или вызов LLM)
            hint = await generate_hint(code)

            # Публикуем результат обратно в Redis
            response = {"user_id": user_id, "hint": hint}
            await redis.publish(CHANNEL_OUT, json.dumps(response))

        except Exception as e:
            print(f"Mentor worker error: {e}")


if __name__ == "__main__":
    asyncio.run(mentor_worker())'''


import asyncio, json
from app.core.redis_client import redis
from app.utils.hint_logic import generate_hint

CHANNEL_IN = "mentor_in"
CHANNEL_OUT = "mentor_out"

async def mentor_worker():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_IN)
    print("🧠 Mentor AI слушает канал mentor_in...")

    async for message in pubsub.listen():
        if message is None or message["type"] != "message":
            continue
        try:
            payload = json.loads(message["data"])
            user_id = payload.get("user_id")
            code = payload.get("code")

            if not user_id or not code:
                continue

            hint = await generate_hint(code)

            response = {"user_id": user_id, "hint": hint}
            await redis.publish(CHANNEL_OUT, json.dumps(response))
            print(f"💡 Отправлена подсказка пользователю {user_id}")

        except Exception as e:
            print(f"Mentor worker error: {e}")
