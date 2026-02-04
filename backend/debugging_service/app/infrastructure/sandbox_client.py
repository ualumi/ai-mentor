# scaffolding_service/app/infrastructure/sandbox_client.py
'''
import json
import uuid
import asyncio
from app.infrastructure.redis import redis_client

SUBMIT_CHANNEL = "submit_code"
RESULT_CHANNEL = "code_results"


async def execute_code(code: str, timeout: int = 5) -> dict:
    request_id = str(uuid.uuid4())

    payload = {
        "request_id": request_id,
        "code": code,
        "language": "python",
        "timeout": timeout
    }

    pubsub = redis_client.pubsub()
    await pubsub.subscribe(RESULT_CHANNEL)

    # отправляем код в песочницу
    await redis_client.publish(SUBMIT_CHANNEL, json.dumps(payload))

    try:
        async for msg in pubsub.listen():
            if msg["type"] != "message":
                continue

            data = json.loads(msg["data"])

            if data.get("request_id") == request_id:
                await pubsub.unsubscribe(RESULT_CHANNEL)
                return data

    except asyncio.TimeoutError:
        return {
            "success": False,
            "stderr": "Sandbox timeout"
        }
'''