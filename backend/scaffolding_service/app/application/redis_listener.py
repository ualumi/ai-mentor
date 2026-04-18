"""import json
import asyncio
import random
from app.infrastructure.redis import redis_client
from app.application.task_generator import generate_condition
CHANNEL_METHODLOGY_EVENTS = "learning.events"
CHANNEL_TASK_CONDITION = "task_condition"


TASK_POOL = {
    "loops": [
        "Напишите цикл, который выводит числа от 1 до 10",
        "Посчитайте сумму элементов списка используя цикл",
        "Найдите максимальный элемент массива через цикл"
    ],
    "pandas": [
        "Загрузите CSV файл используя pandas",
        "Посчитайте среднее значение столбца",
        "Отфильтруйте строки по условию"
    ]
}


async def redis_listener():

    pubsub = redis_client.pubsub()

    await pubsub.subscribe(CHANNEL_METHODLOGY_EVENTS)

    print("🔄 Scaffolding Service слушает learning.events")

    async for message in pubsub.listen():

        if message["type"] != "message":
            continue

        payload = json.loads(message["data"])

        # интересует только generate_task
        if payload.get("event") != "generate_task":
            continue

        if payload.get("methodology") != "scaffolding":
            continue

        learning_session_id = payload["learning_session_id"]
        user_id = payload["user_id"]
        competency = payload["competency"]
        attempts = payload.get("attempts", [])

        print(f"📩 Получен запрос на генерацию задания для сессии {learning_session_id} по компетенции {competency} с попытками {attempts}" )
        # 🔹 генерация условия
        condition = generate_condition(
            competency,
            attempts
        )

        # 🔹 публикация задания
        # 🔹 публикация задания на per-user канал
        '''await redis_client.publish(
            f"task_condition:{user_id}",  # канал конкретного пользователя
            json.dumps({
                "learning_session_id": learning_session_id,
                "user_id": user_id,
                "condition": condition,
                "mode": "module"
            })
        )'''
        # Новый вариант с Stream
        stream_key = f"task_condition:{user_id}"  # per-user stream
        await redis_client.xadd(
            stream_key,
            fields={
                "learning_session_id": learning_session_id,
                "user_id": user_id,
                "condition": json.dumps(condition)
            }
        )

    print(f"📘 task generated for session {learning_session_id}, отправлено для {user_id}")"""


import json
import asyncio

from app.infrastructure.redis import redis_client
from app.application.task_generator import generate_condition

CHANNEL_METHODLOGY_EVENTS = "learning.events"
CHANNEL_NEXT_STEP = "scaffolding.next_step"

pending_tasks = {}

async def redis_listener():

    pubsub = redis_client.pubsub()

    await pubsub.subscribe(
        CHANNEL_METHODLOGY_EVENTS,
        CHANNEL_NEXT_STEP
    )

    print("🔄 Scaffolding Service слушает learning.events и scaffolding.next_step")

    async for message in pubsub.listen():
        print(message)
        if message["type"] != "message":
            continue

        payload = json.loads(message["data"])
        channel = message["channel"]
        print(channel)

        # ---------------------------
        # EVENT: session_created
        # ---------------------------
        if payload.get("event") == "session_created":

            learning_session_id = payload["learning_session_id"]
            user_id = payload["user_id"]
            competency = payload["competency"]
            attempts = payload.get("attempts", [])

            condition = generate_condition(
                competency,
                attempts
            )

            stream_key = f"task_condition:{user_id}"

            await redis_client.xadd(
                stream_key,
                fields={
                    "learning_session_id": learning_session_id,
                    "user_id": user_id,
                    "condition": json.dumps(condition)
                }
            )

            print(f"📘 task generated immediately for session {learning_session_id}")

        # ---------------------------
        # EVENT: generate_task
        # ---------------------------
        elif payload.get("event") == "generate_task":

            learning_session_id = payload["learning_session_id"]
            user_id = payload["user_id"]
            competency = payload["competency"]
            attempts = payload.get("attempts", [])

            condition = generate_condition(
                competency,
                attempts
            )

            # сохраняем до next_step
            pending_tasks[learning_session_id] = {
                "user_id": user_id,
                "condition": condition
            }

            print(f"⏳ task prepared for session {learning_session_id}, waiting next_step")


        # ---------------------------
        # EVENT: session_completed
        # ---------------------------
        elif payload.get("event") == "session_completed":

            learning_session_id = payload["learning_session_id"]
            user_id = payload["user_id"]
            #competency = payload["competency"]
            

            condition = (
                "Завершен Модуль!"
            )

            # сохраняем до next_step
            pending_tasks[learning_session_id] = {
                "user_id": user_id,
                "condition": condition
            }

            print(f"⏳ task prepared for session {learning_session_id}, waiting next_step")

        # ---------------------------
        # EVENT: next_step
        # ---------------------------
        elif channel == CHANNEL_NEXT_STEP:

            learning_session_id = payload["learning_session_id"]
            user_id = payload["user_id"]

            '''task = pending_tasks.get(learning_session_id)

            if not task:
                continue'''
            
            task = pending_tasks.get(learning_session_id)

            # 🔥 если нет pending — генерим на лету
            if not task:
                print(f"⚠️ No pending task, generating on demand for {learning_session_id}")

                competency = payload.get("competency")  # может не быть!
                attempts = payload.get("attempts", [])

                # ❗ лучше достать из Redis или передать в событии
                condition = generate_condition(competency, attempts)

                task = {
                    "user_id": user_id,
                    "condition": condition
                }

            stream_key = f"task_condition:{user_id}"

            await redis_client.xadd(
                stream_key,
                fields={
                    "learning_session_id": learning_session_id,
                    "user_id": user_id,
                    "condition": json.dumps(task["condition"])
                }
            )

            #del pending_tasks[learning_session_id]

            print(f"🚀 task sent after next_step for session {learning_session_id}")