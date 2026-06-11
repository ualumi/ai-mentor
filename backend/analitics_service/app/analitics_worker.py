import asyncio
import json

import redis.exceptions as redis_exceptions

from app.core.redis_client import redis
from app.utils.hint_logic import generate_analysis


REQUEST_PATTERN = "analytics_request:*"


async def _handle_analytics_message(message):
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
    condition_description = payload.get("condition")
    mode = payload.get("mode")

    condition = None
    if condition_description:
        condition = condition_description.get("description")

    if condition:
        print("condition received", condition)
    else:
        print("no condition")

    if not user_id or not code:
        return

    analysis = await generate_analysis(code)

    if "analysis" in analysis:
        analysis = analysis["analysis"]

    out = {
        "user_id": user_id,
        "attempt_id": attempt_id,
        "analysis": analysis,
        "learning_session_id": learning_session_id,
        "step_id": step_id,
        "code": code,
        "condition": condition,
        "mode": mode,
    }

    await redis.publish(
        f"analytics_response:{user_id}",
        json.dumps(out),
    )

    print(f"analytics_response sent for {user_id}")


async def analitics_worker():
    while True:
        pubsub = redis.pubsub()
        try:
            await pubsub.psubscribe(REQUEST_PATTERN)
            print("Analytics service listening analytics_request:*")

            async for message in pubsub.listen():
                if message["type"] != "pmessage":
                    continue

                try:
                    await _handle_analytics_message(message)
                except Exception as e:
                    print(f"Analytics worker error: {e}")

        except asyncio.CancelledError:
            raise
        except (redis_exceptions.TimeoutError, redis_exceptions.ConnectionError) as e:
            print(f"Analytics Redis listener disconnected: {e}. Reconnecting...")
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Analytics worker crashed: {e}. Restarting...")
            await asyncio.sleep(2)
        finally:
            await pubsub.close()
