
'''from app.infrastructure.redis import redis_client
import json
from app.application.orchestrators.learning_orchestrator import handle_progress_event

async def listen_progress_events():
    pubsub = redis_client.pubsub()
    await pubsub.psubscribe("user_progress:*")

    async for msg in pubsub.listen():
        print(f"received msg: {msg}")
        if msg["type"] != "pmessage":
            continue

        data = json.loads(msg["data"])

        await handle_progress_event(data)'''

from app.infrastructure.redis import redis_client
import json
import asyncio
from app.application.orchestrators.learning_orchestrator import handle_progress_event

async def listen_progress_events():
    pubsub = redis_client.pubsub()

    await pubsub.psubscribe("user_progress:*")

    async for msg in pubsub.listen():

        if msg["type"] != "pmessage":
            continue

        '''channel = msg["channel"].decode()
        user_id = int(channel.split(":")[1])'''
        

        '''data = json.loads(msg["data"])

        event = {
            "user_id": data.get("user_id"),
            "progress": data["progress"],
            "recommendations": data.get("recommendations", {})
        }

        # 🔥 отдельная async обработка пользователя
        asyncio.create_task(handle_progress_event(event))'''
        data = json.loads(msg["data"])

        user_id = data.get("user_id")
        progress = data.get("progress", {})

        # 🔥 1. сохраняем (merge, а не перезапись)
        existing_raw = await redis_client.get(f"user_progress:{user_id}")
        existing = json.loads(existing_raw) if existing_raw else {}

        existing.update(progress)

        await redis_client.set(
            f"user_progress:{user_id}",
            json.dumps(existing)
        )

        # 🔥 2. отправляем в orchestrator
        event = {
            "user_id": user_id,
            "progress": progress,
        }

        asyncio.create_task(handle_progress_event(event))