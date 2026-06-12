

from app.infrastructure.redis import redis_client
import json
import asyncio
from app.application.orchestrators.learning_orchestrator import handle_progress_event

async def listen_progress_events():
    pubsub = redis_client.pubsub()

    await pubsub.psubscribe("user_progress:*")

    async for msg in pubsub.listen():
        print("Received message on channel:", msg.get("channel"), "with data:", msg.get("data"))

        if msg["type"] != "pmessage":
            continue


        data = json.loads(msg["data"])

        user_id = data.get("user_id")
        progress_raw = data.get("progress", {})
        progress_recommendations = (
            progress_raw.get("recommendations", [])
            if isinstance(progress_raw, dict)
            else []
        )
        progress_module_recommendations = (
            progress_raw.get("module_recommendations", [])
            if isinstance(progress_raw, dict)
            else []
        )
        recommendations = (
            data.get("recommendations")
            or data.get("module_recommendations")
            or progress_recommendations
            or progress_module_recommendations
            or []
        )
        task_parameters = data.get("task_parameters") or (
            progress_raw.get("task_parameters")
            if isinstance(progress_raw, dict)
            else None
        )
        attempt_id = data.get("attempt_id")
        print(progress_raw, "progress_raw in listen_progress_events")
        score = data.get("score")
        print(score, "score in listen_progress_events")

        existing_raw = await redis_client.get(f"all_user_progress:{user_id}")
        existing = json.loads(existing_raw) if existing_raw else {}      
        existing.update(progress_raw)
        existing["recommendations"] = recommendations
        existing["task_parameters"] = task_parameters
        await redis_client.set(f"all_user_progress:{user_id}", json.dumps(existing))

        # 🔥 2. отправляем в orchestrator
        event = {
            "user_id": user_id,
            "progress": progress_raw,
            "learning_session_id": data.get("learning_session_id"),
            "task_recommendations": recommendations,
            "task_parameters": task_parameters,
            "score": score,
            "attempt_id": attempt_id
        }

        asyncio.create_task(handle_progress_event(event))
