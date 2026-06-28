import asyncio
import json

import redis.exceptions as redis_exceptions

from app.application.orchestrators.learning_orchestrator import generate_next_task
from app.application.orchestrators.task_payload_builder import build_adaptive_task_payload
from app.application.queries.get_session import get_session
from app.infrastructure.redis import redis_client


async def _handle_next_step_message(msg):
    try:
        data = json.loads(msg["data"])
    except Exception:
        return

    session_id = data.get("learning_session_id")

    if not session_id:
        return

    session = await get_session(session_id)

    if not session:
        return

    raw_task = await redis_client.get(f"pending_next_task:{session_id}")

    if raw_task:
        task = json.loads(raw_task)
    else:
        progress_raw = await redis_client.get(
            f"all_user_progress:{session['user_id']}"
        )
        progress = json.loads(progress_raw) if progress_raw else {}
        task = await build_adaptive_task_payload(
            competency=session["competency"],
            progress_raw=progress,
        )
        print(f"No pending task for {session_id}; built task from progress")

    await generate_next_task(session, task)

    print(f"Generated next task for {session_id}")

    await redis_client.delete(f"pending_next_task:{session_id}")


async def listen_next_step():
    while True:
        pubsub = redis_client.pubsub(ignore_subscribe_messages=True)
        try:
            await pubsub.subscribe("learning.next_step")
            print("Learning Service listening learning.next_step")

            while True:
                try:
                    msg = await pubsub.get_message(timeout=1.0)
                except redis_exceptions.TimeoutError:
                    continue

                if msg is None:
                    continue

                if msg["type"] != "message":
                    continue

                try:
                    await _handle_next_step_message(msg)
                except Exception as e:
                    print(f"Learning next_step message error: {e}")

        except asyncio.CancelledError:
            raise
        except (redis_exceptions.TimeoutError, redis_exceptions.ConnectionError) as e:
            print(f"Learning next_step listener disconnected: {e}. Reconnecting...")
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Learning next_step listener crashed: {e}. Restarting...")
            await asyncio.sleep(2)
        finally:
            await pubsub.close()
