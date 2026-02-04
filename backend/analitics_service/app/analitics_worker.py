'''import asyncio, json
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
            print(f"Mentor worker error: {e}")'''

import json
from app.core.redis_client import redis
from app.utils.hint_logic import generate_analysis

CHANNEL_IN = "analyze"
CHANNEL_OUT = "analysis_result"

async def mentor_worker():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_IN)

    print("📊 Analytics service listening analyze...")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue

        try:
            payload = json.loads(message["data"])
            session_id = payload.get("session_id")
            code = payload.get("code")

            if not session_id or not code:
                continue

            analysis = await generate_analysis(code)

            out = {
                "session_id": session_id,
                "analysys": analysis,
                "analysis": {
                    "competencies": {
                    "python_loops": 0.4
                    },
                    "confidence": 0.7
                }
            }

            await redis.publish(CHANNEL_OUT, json.dumps(out))
            print(f"📤 analysis_result sent for {session_id}")

        except Exception as e:
            print(f"Analytics worker error: {e}")

