import asyncio, json
from app.core.redis_client import redis
from app.utils.hint_logic import generate_hint

CHANNEL_IN = "analyze"

async def mentor_worker():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_IN)
    print("AI слушает канал analyze...")

    async for message in pubsub.listen():
        print(f"получено сообщение {message}")
        if message is None or message["type"] != "message":
            continue
        try:
            payload = json.loads(message["data"])
            session_id = payload.get("session_id")
            condition = payload.get("condition")
            code = payload.get("code")

            if not session_id or not code:
                continue


        except Exception as e:
            print(f"Mentor worker error: {e}")
