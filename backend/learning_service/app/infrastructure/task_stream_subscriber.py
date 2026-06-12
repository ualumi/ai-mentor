import asyncio
import json

import redis.exceptions as redis_exceptions

from app.infrastructure.redis import redis_client


STREAM_PREFIX = "task_condition:"


async def listen_task_streams():
    print("Learning Service listening task_condition streams")

    last_ids = {}

    while True:
        try:
            keys = await redis_client.keys(f"{STREAM_PREFIX}*")

            streams = {}
            for key in keys:
                streams[key] = last_ids.get(key, "0-0")

            if not streams:
                await asyncio.sleep(1)
                continue

            response = await redis_client.xread(
                streams=streams,
                count=10,
                block=5000,
            )

            for stream_name, messages in response:
                for message_id, fields in messages:
                    last_ids[stream_name] = message_id
                    await handle_task_event(fields)

        except asyncio.CancelledError:
            raise
        except (redis_exceptions.TimeoutError, redis_exceptions.ConnectionError) as e:
            print(f"Learning task stream listener disconnected: {e}. Retrying...")
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Learning task stream listener error: {e}. Retrying...")
            await asyncio.sleep(2)


async def handle_task_event(fields):
    session_id = fields.get("learning_session_id")
    condition_raw = fields.get("condition")

    if not session_id or not condition_raw:
        return

    try:
        condition = json.loads(condition_raw)
    except Exception:
        return

    key = f"learning:session:{session_id}"

    await redis_client.hset(
        key,
        mapping={
            "current_condition": json.dumps(condition),
        },
    )

    print(f"condition saved for session {session_id}")
