import asyncio
import json

import redis.exceptions as redis_exceptions

from app.application.orchestrators.learning_orchestrator import handle_progress_event
from app.infrastructure.redis import redis_client


async def _run_handle_progress_event(event):
    try:
        await handle_progress_event(event)
    except Exception as e:
        print(f"handle_progress_event error: {e}")


async def _handle_progress_message(msg):
    print("Received message on channel:", msg.get("channel"), "with data:", msg.get("data"))

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

    event = {
        "user_id": user_id,
        "progress": progress_raw,
        "learning_session_id": data.get("learning_session_id"),
        "task_recommendations": recommendations,
        "task_parameters": task_parameters,
        "score": score,
        "attempt_id": attempt_id,
    }

    asyncio.create_task(_run_handle_progress_event(event))


async def listen_progress_events():
    while True:
        pubsub = redis_client.pubsub(ignore_subscribe_messages=True)
        try:
            await pubsub.psubscribe("user_progress:*")
            print("Learning Service listening user_progress:*")

            while True:
                try:
                    msg = await pubsub.get_message(timeout=1.0)
                except redis_exceptions.TimeoutError:
                    continue

                if msg is None:
                    continue

                if msg["type"] != "pmessage":
                    continue

                try:
                    await _handle_progress_message(msg)
                except Exception as e:
                    print(f"Learning progress message error: {e}")

        except asyncio.CancelledError:
            raise
        except (redis_exceptions.TimeoutError, redis_exceptions.ConnectionError) as e:
            print(f"Learning progress listener disconnected: {e}. Reconnecting...")
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Learning progress listener crashed: {e}. Restarting...")
            await asyncio.sleep(2)
        finally:
            await pubsub.close()
