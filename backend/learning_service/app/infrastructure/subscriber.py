import json
from app.infrastructure.redis import redis_client

async def advance_step(session_id: str):
    key = f"learning:session:{session_id}"
    data = await redis_client.hgetall(key)
    if not data:
        return

    current = int(data["current_step"])
    await redis_client.hset(key, "current_step", current + 1)

async def listen_scaffolding_events():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("scaffolding.events")

    async for msg in pubsub.listen():
        if msg["type"] != "message":
            continue

        data = json.loads(msg["data"])

        if data["event"] == "step_completed":
            await advance_step(data["session_id"])

        if data["event"] == "step_failed":
            print("Ошибка шага:", data)
