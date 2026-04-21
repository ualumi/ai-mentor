
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

        data = json.loads(msg["data"])

        user_id = data.get("user_id")
        progress_raw = data.get("progress", {})
        

        # 🔥 2. отправляем в orchestrator
        event = {
            "user_id": user_id,
            "progress": progress_raw,
            "learning_session_id": data.get("learning_session_id"),
        }

        asyncio.create_task(handle_progress_event(event))
