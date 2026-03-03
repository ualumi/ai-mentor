import json
from app.core.redis_client import redis
from app.utils.hint_logic import generate_analysis

REQUEST_PATTERN = "analytics_request:*"

async def analitics_worker():
    pubsub = redis.pubsub()
    await pubsub.psubscribe(REQUEST_PATTERN)

    print("📊 Analytics service listening analytics_request:*")

    async for message in pubsub.listen():
        if message["type"] != "pmessage":
            continue

        try:
            channel = message["channel"]  # analytics_request:{user_id}
            print(message)
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

            # 🔎 Генерация анализа
            analysis = await generate_analysis(code)

            if "analysis" in analysis:
                analysis = analysis["analysis"]

            out = {
                "user_id": user_id,
                "attempt_id": attempt_id,
                "analysis": analysis,
                "learning_session_id": learning_session_id,
                "step_id": step_id,
                "code": code
            }

            # 🔥 Публикуем ТОЛЬКО в канал пользователя
            await redis.publish(
                f"analytics_response:{user_id}",
                json.dumps(out)
            )

            print(f"📤 analytics_response sent for {user_id}")

        except Exception as e:
            print(f"Analytics worker error: {e}")

'''import json
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
            print(f"Analytics worker error: {e}")'''

