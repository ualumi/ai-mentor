import json
import asyncio
from app.infrastructure.redis import redis_client

STREAM_PREFIX = "task_condition:"
LAST_ID = "0-0"  # можно хранить offset

async def listen_task_streams():

    print("📡 Learning Service слушает task_condition streams")

    last_ids = {}

    while True:

        # 🔥 можно оптимизировать (сначала просто так)
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
            block=5000
        )

        for stream_name, messages in response:

            for message_id, fields in messages:

                last_ids[stream_name] = message_id

                await handle_task_event(fields)


async def handle_task_event(fields):

    session_id = fields.get("learning_session_id")
    condition_raw = fields.get("condition")

    if not session_id or not condition_raw:
        return

    try:
        condition = json.loads(condition_raw)
    except:
        return

    key = f"learning:session:{session_id}"

    # 🔥 сохраняем текущее задание
    await redis_client.hset(
        key,
        mapping={
            "current_condition": json.dumps(condition)
        }
    )

    print(f"✅ condition saved for session {session_id}")