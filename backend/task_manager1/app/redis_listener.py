# app/redis_listener.py
import json
import asyncio
from app.redis_client import redis
from app.state import TASKS, TaskState

CHANNEL_TASK_CONDITION = "task_condition"
CHANNEL_MENTOR_OUT = "mentor_out"
CHANNEL_CODE_RESULTS = "code_results"


async def redis_listener():
    pubsub = redis.pubsub()
    await pubsub.subscribe(
        CHANNEL_TASK_CONDITION,
        CHANNEL_MENTOR_OUT,
        CHANNEL_CODE_RESULTS,
    )

    print("🔄 Redis listener started")

    async for msg in pubsub.listen():
        if msg["type"] != "message":
            continue

        channel = msg["channel"]
        payload = json.loads(msg["data"])
        session_id = payload.get("session_id")
        step_id = payload.get("step_id")
        if not session_id:
            continue

        task = TASKS.setdefault(session_id, TaskState())

        # 1️⃣ Условие задачи
        if channel == CHANNEL_TASK_CONDITION:
            task.condition = payload["condition"]
            task.condition_event.set()
            print(f"📘 Condition received for {session_id}")

        # 2️⃣ Ответ ментора
        elif channel == CHANNEL_MENTOR_OUT:
            task.mentor_reply = payload["hint"]
            print(f"🧠 Mentor reply for {session_id}")

        # 3️⃣ Ответ песочницы
        elif channel == CHANNEL_CODE_RESULTS:
            task.sandbox_reply = payload["sandbox_result"]
            print(f"🧪 Sandbox reply for {session_id}")

        # Если оба ответа есть — можно отвечать фронту
        if task.mentor_reply and task.sandbox_reply:
            task.reply_event.set()