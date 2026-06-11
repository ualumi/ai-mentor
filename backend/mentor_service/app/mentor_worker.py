import asyncio
import json

import redis.exceptions as redis_exceptions

from app.core.redis_client import redis
from app.utils.hint_logic import generate_hint


REQUEST_PATTERN = "mentor_request:*"


async def _handle_mentor_message(message):
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
        return

    hint = await generate_hint(code)

    response = {
        "user_id": user_id,
        "attempt_id": attempt_id,
        "hint": hint,
        "learning_session_id": learning_session_id,
        "step_id": step_id,
    }

    await redis.publish(
        f"mentor_response:{user_id}",
        json.dumps(response),
    )

    print(f"mentor_response sent for {user_id}")


async def mentor_worker():
    while True:
        pubsub = redis.pubsub(ignore_subscribe_messages=True)
        try:
            await pubsub.psubscribe(REQUEST_PATTERN)
            print("Mentor AI listening mentor_request:*")

            while True:
                try:
                    message = await pubsub.get_message(timeout=1.0)
                except redis_exceptions.TimeoutError:
                    continue

                if message is None:
                    continue

                if message["type"] != "pmessage":
                    continue

                try:
                    await _handle_mentor_message(message)
                except Exception as e:
                    print(f"Mentor worker error: {e}")

        except asyncio.CancelledError:
            raise
        except (redis_exceptions.TimeoutError, redis_exceptions.ConnectionError) as e:
            print(f"Mentor Redis listener disconnected: {e}. Reconnecting...")
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Mentor worker crashed: {e}. Restarting...")
            await asyncio.sleep(2)
        finally:
            await pubsub.close()
