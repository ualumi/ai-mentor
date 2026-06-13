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
    source = payload.get("source")

    condition = _extract_condition_text(condition_description)

    if condition:
        print("condition received", condition)
    else:
        print("no condition")

    if not user_id or not code:
        return

    analysis = await generate_analysis(code, condition=condition)

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
        "source": source,
        "import_request_id": payload.get("import_request_id"),
        "import_case_index": payload.get("import_case_index"),
    }

    await redis.publish(
        f"analytics_response:{user_id}",
        json.dumps(out),
    )

    print(f"analytics_response sent for {user_id}")


def _extract_condition_text(condition) -> str | None:
    if not condition:
        return None

    if isinstance(condition, str):
        return condition

    if not isinstance(condition, dict):
        return str(condition)

    parts = []
    description = condition.get("description")
    if isinstance(description, dict):
        parts.extend(
            str(value)
            for value in (
                description.get("title"),
                description.get("description"),
                description.get("task_context"),
            )
            if value
        )
    elif description:
        parts.append(str(description))

    for key in ("task_context", "requirements", "constraints", "tests"):
        value = condition.get(key)
        if isinstance(value, list):
            parts.extend(str(item) for item in value if item)
        elif value:
            parts.append(str(value))

    return "\n".join(parts) if parts else None


async def analitics_worker():
    while True:
        pubsub = redis.pubsub(ignore_subscribe_messages=True)
        try:
            await pubsub.psubscribe(REQUEST_PATTERN)
            print("Analytics service listening analytics_request:*")

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
