import json
import asyncio
import aiohttp
from app.infrastructure.redis import redis_client
from app.domain.debugging import ScaffoldingTask

# Каналы Redis
CHANNEL_SESSION_CREATED = "learning.events"
CHANNEL_CODE_RESULTS = "code_results"
CHANNEL_TASK_CONDITION = "task_condition"

# URL для регистрации сессии в Task Manager
#TASK_MANAGER_URL = "http://task_manager:8004/tasks/register_session"

'''async def register_session(session_id: str):
    """
    Регистрирует session_id в Task Manager через query parameter
    """
    async with aiohttp.ClientSession() as session:
        async with session.post(f"{TASK_MANAGER_URL}?session_id={session_id}") as resp:
            if resp.status != 200:
                text = await resp.text()
                raise Exception(f"Failed to register session {session_id}, status={resp.status}, text={text}")
            data = await resp.json()
            print(f"✅ Session registered in Task Manager: {data}")
            return data'''

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

        payload = json.loads(message["data"])
        channel = message["channel"]

        # 🔹 Старт методологии
        if channel == CHANNEL_SESSION_CREATED:
            if payload.get("methodology") != "scaffolding" or payload.get("event") != "session_created":
                continue

            session_id = payload["session_id"]

            '''# ✅ 1. Регистрируем сессию в Task Manager
            await register_session(session_id)'''

            # ✅ 2. Публикуем первое условие только после успешной регистрации
            first_step = scaffold.get_step(0)
            await asyncio.sleep(0.1)
            await redis_client.publish(
                CHANNEL_TASK_CONDITION,
                json.dumps({
                    "session_id": session_id,
                    "step_id": 0,
                    "condition": {"description": first_step["description"]},
                    "answer": "read_csv1"
                })
            )
            print(f"🚀 Scaffolding стартовал для {session_id}")

        # 🔹 Следующие шаги
        elif channel == CHANNEL_CODE_RESULTS:
            session_id = payload["session_id"]
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
                        "session_id": session_id,
                        "step_id": next_step,
                        "condition": {"description": step["description"]}
                    })
                )
                print(f"➡️ Следующий шаг {next_step} для {session_id}")
            else:
                print(f"🏁 Методология завершена для {session_id}")