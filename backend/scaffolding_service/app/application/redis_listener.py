import json
import asyncio
import aiohttp
from app.infrastructure.redis import redis_client
from app.domain.scaffold import ScaffoldingTask
import random

# Каналы Redis
CHANNEL_SESSION_CREATED = "learning.events"
CHANNEL_CODE_RESULTS = "code_results"
CHANNEL_TASK_CONDITION = "task_condition"

# URL для регистрации сессии в Task Manager
#TASK_MANAGER_URL = "http://task_manager:8004/tasks/register_session"

async def redis_listener():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(
        CHANNEL_SESSION_CREATED,
        CHANNEL_CODE_RESULTS
    )

    scaffold = ScaffoldingTask()
    print("🔄 Scaffolding Service слушает события")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue
        print("получено сообщение", message)
        payload = json.loads(message["data"])
        channel = message["channel"]

        # 🔹 Старт методологии
        if channel == CHANNEL_SESSION_CREATED:
            if payload.get("methodology") != "scaffolding" or payload.get("event") != "session_created":
                continue
              
            learning_session_id = payload["learning_session_id"]
            user_id = payload["user_id"]

            '''# ✅ 1. Регистрируем сессию в Task Manager
            await register_session(session_id)'''

            # ✅ 2. Публикуем первое условие только после успешной регистрации
            first_step = scaffold.get_step(0)
            await asyncio.sleep(0.1)
            await redis_client.publish(
                CHANNEL_TASK_CONDITION,
                json.dumps({
                    "learning_session_id": learning_session_id,
                    "step_id": 0,
                    "condition": {"description": first_step["description"]},
                    "mode": "module",
                    "user_id": user_id
                })
            )
            print(f"🚀 Scaffolding стартовал для {user_id}")

        # 🔹 Следующие шаги
        
        elif channel == CHANNEL_CODE_RESULTS:
            user_id = payload["user_id"]
            step_id = payload["step_id"]
            code = payload.get("code", "")

            if not scaffold.validate(step_id, code):
                continue

            next_step = int(step_id) + 1
            if next_step < scaffold.total_steps():
                step = scaffold.get_step(next_step)
                await redis_client.publish(
                    CHANNEL_TASK_CONDITION,
                    json.dumps({
                        "session_id": learning_session_id,
                        "step_id": next_step,
                        "condition": {"description": step["description"]},
                        "mode": "module",
                        "user_id": user_id
                    })
                )
                print(f"➡️ Следующий шаг {next_step} для {learning_session_id}")
            else:
                print(f"🏁 Методология завершена для {learning_session_id}")