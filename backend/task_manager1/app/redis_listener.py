# app/redis_listener.py
# app/redis_listener.py
import json
'''#from app.redis_client import redis
from app.redis_client import redis_sub
from app.state import TASKS, TaskState

CHANNEL_TASK_CONDITION = "task_condition"
CHANNEL_MENTOR_OUT = "mentor_out"
CHANNEL_CODE_RESULTS = "code_results"
CHANNEL_ANALYSIS_RESULT = "analysis_result"

async def redis_listener():
    print("redis corotine started")
    pubsub = redis_sub.pubsub()
    await pubsub.subscribe(
        CHANNEL_TASK_CONDITION,
        CHANNEL_MENTOR_OUT,
        CHANNEL_CODE_RESULTS,
        CHANNEL_ANALYSIS_RESULT
    )

    await pubsub.psubscribe("user_progress:*")

    print("🔄 Redis listener started")

    async for msg in pubsub.listen():
        print(msg)

        if msg["type"] == "pmessage":
            print("2️⃣ Pmessage received")
            channel = msg["channel"].decode() if isinstance(msg["channel"], bytes) else msg["channel"]
            print("3️⃣ Channel:", channel)
            if channel.startswith("user_progress:"):
                print("4️⃣ user_progress matched")
                session_id = channel.split(":")[1]
                print("получено сообщение user_progress")
                #task = TASKS.get(session_id)
                task = TASKS.setdefault(session_id, TaskState())
                if not task:
                    continue

                task.analysis_context["progress"] = payload.get("progress")
                task.analysis_context["recommendations"] = payload.get("recommendations")

                # если есть рекомендация — триггерим WS событие
                if payload.get("recommendations"):
                    task.recommendation = payload["recommendations"]
                    task.recommendation_event.set()

            continue

        if msg["type"] != "message":
            continue
        
        


        channel = msg["channel"]
        payload = json.loads(msg["data"])
        session_id = payload.get("session_id")
        if not session_id:
            continue

        task = TASKS.setdefault(session_id, TaskState())

        if channel == CHANNEL_TASK_CONDITION:
            task.mode = payload["mode"]
            task.methodology = payload.get("methodology")
            task.condition = payload["condition"]
            task.step_id = payload.get("step_id")
            
            task.condition_event.set()
            print(f"📘 Condition received for {session_id}")

        elif channel == CHANNEL_MENTOR_OUT:
            attempt_id = payload.get("attempt_id")
            if attempt_id != task.current_attempt_id:
                continue
            task.mentor_reply = payload.get("hint")
            print(f"🧠 Mentor reply for {session_id}")

        elif channel == CHANNEL_CODE_RESULTS:
            task.sandbox_reply = payload.get("sandbox_result")
            task.reply_event.set()  # ← важно
            print(f"🧪 Sandbox reply for {session_id}")

        elif channel == CHANNEL_ANALYSIS_RESULT:
            task.analysis_result = payload
            task.analysis_context.update(payload)
            print(f"📊 Analysis received for {session_id}")

        # ⬇️ ЛОГИКА ГОТОВНОСТИ ОТВЕТА
        if task.mode == "free":
            if task.mentor_reply is not None:
                task.reply_event.set()

        elif task.mode in ("task", "module"):
            if task.mentor_reply is not None and task.sandbox_reply is not None:
                task.reply_event.set()'''

import json
from app.redis_client import redis_sub
from app.state import TASKS, TaskState
import asyncio

CHANNEL_TASK_CONDITION = "task_condition"
CHANNEL_MENTOR_OUT = "mentor_out"
CHANNEL_CODE_RESULTS = "code_results"
CHANNEL_ANALYSIS_RESULT = "analysis_result"


async def redis_listener():
    print("redis coroutine started")
    pubsub = redis_sub.pubsub()
    await pubsub.subscribe(
        CHANNEL_TASK_CONDITION,
        CHANNEL_MENTOR_OUT,
        CHANNEL_CODE_RESULTS,
        CHANNEL_ANALYSIS_RESULT
    )

    # подписка на все user_progress
    await pubsub.psubscribe("user_progress:*")

    print("🔄 Redis listener started")

    async for msg in pubsub.listen():
        await asyncio.sleep(0)
        print(msg)
        # print(msg)  # можно оставить для отладки

        # -----------------------------
        # PSUBSCRIBE: user_progress
        # -----------------------------
        if msg["type"] == "pmessage":
            channel = msg["channel"].decode() if isinstance(msg["channel"], bytes) else msg["channel"]
            payload = json.loads(msg["data"])
            if channel.startswith("user_progress:"):
                user_id= channel.split(":")[1]

                # создаём TaskState если нет
                task = TASKS.setdefault(user_id, TaskState())

                task.analysis_context["progress"] = payload.get("progress")
                task.analysis_context["recommendations"] = payload.get("recommendations")

                # триггерим событие для WS
                task.progress_event.set()
                if payload.get("recommendations"):
                    task.recommendation = payload["recommendations"]
                    task.recommendation_event.set()

            continue

        # -----------------------------
        # обычные каналы
        # -----------------------------
        if msg["type"] != "message":
            continue

        channel = msg["channel"]
        payload = json.loads(msg["data"])

        user_id = payload.get("user_id")
        if not user_id:
            continue

        task = TASKS.setdefault(user_id, TaskState())

        if channel == CHANNEL_TASK_CONDITION:
            
            task.learning_session_id = payload.get("learning_session_id")
            task.mode = payload["mode"]
            task.methodology = payload.get("methodology")
            task.condition = payload["condition"]
            task.step_id = payload.get("step_id")
            task.condition_event.set()
            print(f"📘 Condition received for {user_id}")

        elif channel == CHANNEL_MENTOR_OUT:
            attempt_id = payload.get("attempt_id")
            if attempt_id != task.current_attempt_id:
                continue
            task.mentor_reply = payload.get("hint")
            task.reply_event.set()
            print(f"🧠 Mentor reply for {user_id}")

        elif channel == CHANNEL_CODE_RESULTS:
            task.sandbox_reply = payload.get("sandbox_result")
            task.reply_event.set()
            print(f"🧪 Sandbox reply for {user_id}")

        elif channel == CHANNEL_ANALYSIS_RESULT:
            task.analysis_result = payload
            task.analysis_context.update(payload)
            task.analysis_event.set()
            print(f"📊 Analysis received for {user_id}")

'''import json
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
            task.step_id = payload.get("step_id")
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
        if task.mentor_reply is not None and task.sandbox_reply is not None:
            task.reply_event.set()'''

