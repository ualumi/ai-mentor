import json
from app.infrastructure.redis import redis_client

async def listen_scaffolding_events():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("scaffolding.events")

    async for msg in pubsub.listen():
        if msg["type"] != "message":
            continue

        data = json.loads(msg["data"])

        if data["event"] == "step_completed":
            print("Шаг пройден:", data)

        if data["event"] == "step_failed":
            print("Ошибка шага:", data)
