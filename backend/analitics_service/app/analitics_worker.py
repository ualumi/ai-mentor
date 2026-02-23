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

async def analitics_worker():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_IN)

    print("📊 Analytics service listening analyze...")

    async for message in pubsub.listen():
        print (message)
        if message["type"] != "message":
            continue
        
        raw_data = message["data"]
        print(type(raw_data), repr(raw_data))
    # Декодируем, если bytes
        if isinstance(raw_data, bytes):
            raw_data = raw_data.decode()

        try:
            payload = json.loads(raw_data)
            user_id = payload.get("user_id")
            code = payload.get("code")
            learning_session_id= payload.get("learning_session_id")

            if not user_id or not code:
                continue

            analysis = await generate_analysis(code)
            # если внутри есть лишний уровень
            if "analysis" in analysis:
                analysis = analysis["analysis"]

            out = {
                "user_id": user_id,
                "analysis": analysis,
                "code":code,
                "learning_session_id": learning_session_id
            }

            await redis.publish(CHANNEL_OUT, json.dumps(out))
            print(f"📤 analysis_result sent for {user_id}")

        except Exception as e:
            print(f"Analytics worker error: {e}")

