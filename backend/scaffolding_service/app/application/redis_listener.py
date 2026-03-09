import json
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
        await redis_client.publish(
            f"task_condition:{user_id}",  # канал конкретного пользователя
            json.dumps({
                "learning_session_id": learning_session_id,
                "user_id": user_id,
                "condition": condition,
                "mode": "module"
            })
        )

    print(f"📘 task generated for session {learning_session_id}, отправлено для {user_id}")