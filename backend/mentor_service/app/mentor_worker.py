'''import asyncio, json
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
            print(f"Mentor worker error: {e}")'''

import json
from app.core.redis_client import redis
from app.utils.hint_logic import generate_hint

REQUEST_PATTERN = "mentor_request:*"

async def mentor_worker():
    pubsub = redis.pubsub()
    await pubsub.psubscribe(REQUEST_PATTERN)

    print("🧠 Mentor AI слушает mentor_request:* ...")

    async for message in pubsub.listen():
        if message["type"] != "pmessage":
            continue

        try:
            channel = message["channel"]  # mentor_request:{user_id}
            raw_data = message["data"]

            if isinstance(raw_data, bytes):
                raw_data = raw_data.decode()

            payload = json.loads(raw_data)

            user_id = payload.get("user_id")
            code = payload.get("code")
            attempt_id = payload.get("attempt_id")
            learning_session_id = payload.get("learning_session_id")
            step_id = payload.get("step_id")

            if not user_id or not code:
                continue

            # 🔮 Генерация подсказки
            hint = await generate_hint(code)

            response = {
                "user_id": user_id,
                "attempt_id": attempt_id,
                "hint": hint,
                "learning_session_id": learning_session_id,
                "step_id": step_id,
            }

            # 🔥 Публикуем только в канал пользователя
            await redis.publish(
                f"mentor_response:{user_id}",
                json.dumps(response)
            )

            print(f"💡 mentor_response sent for {user_id}")

        except Exception as e:
            print(f"Mentor worker error: {e}")
