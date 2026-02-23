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
            attempt_id = payload.get("attempt_id")
            learning_session_id= payload.get("learning_session_id")

            if not user_id or not code:
                continue

            hint = await generate_hint(code)

            response = {"session_id": user_id, "hint": hint, "attempt_id": attempt_id, "learning_session_id": learning_session_id}
            await redis.publish(CHANNEL_OUT, json.dumps(response))
            print(f"💡 Отправлена подсказка пользователю {user_id}, {response}")

        except Exception as e:
            print(f"Mentor worker error: {e}")
