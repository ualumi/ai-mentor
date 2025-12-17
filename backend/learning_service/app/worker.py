'''import json
from app.core.redis_client import redis_client
from app.orchestrator.orchestrator import LearningOrchestrator

CHANNEL_IN = "code_results"
CHANNEL_MENTOR_REQUEST = "mentor_request"

orchestrator = LearningOrchestrator()

async def orchestrator_worker():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(CHANNEL_IN)
    print("🎓 Learning Orchestrator слушает code_results")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue

        data = json.loads(message["data"])
        user_id = data["user_id"]
        code = data["code"]
        sandbox_result = data["sandbox_result"]

        response = orchestrator.process_attempt(
            user_id, code, sandbox_result
        )

        # Если ошибка — дергаем ИИ-ментора
        if sandbox_result["returncode"] != 0:
            await redis_client.publish(
                CHANNEL_MENTOR_REQUEST,
                json.dumps({
                    "user_id": user_id,
                    "code": code,
                    "methodology": response["methodology"],
                    "step": response["step"]
                })
            )
'''

import json
import logging
from app.core.redis_client import redis_client
from app.orchestrator.orchestrator import LearningOrchestrator

# Настройка логирования, чтобы видеть ошибки в консоли Docker
logger = logging.getLogger(__name__)

CHANNEL_IN = "current_task"
CHANNEL_MENTOR_REQUEST = "mentor_request"

orchestrator = LearningOrchestrator()

async def orchestrator_worker():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(CHANNEL_IN)
    print("🎓 Learning Orchestrator слушает code_results")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue

        try:
            # Десериализация данных
            data = json.loads(message["data"])
            
            # Безопасное извлечение данных (защита от KeyError)
            user_id = data.get("user_id")
            code = data.get("code")
            sandbox_result = data.get("sandbox_result")

            # Валидация: если обязательных полей нет, логируем и идем дальше
            if user_id is None or sandbox_result is None:
                print(f"⚠️ Пропущено некорректное сообщение (отсутствуют поля): {data}")
                continue

            # Обработка попытки через оркестратор
            response = orchestrator.process_attempt(
                user_id, code, sandbox_result
            )

            # Если в sandbox_result есть ошибка (returncode != 0) — уведомляем ментора
            # Используем .get(), так как внутри sandbox_result тоже может чего-то не хватать
            if sandbox_result.get("returncode") != 0:
                await redis_client.publish(
                    CHANNEL_MENTOR_REQUEST,
                    json.dumps({
                        "user_id": user_id,
                        "code": code,
                        "methodology": response.get("methodology"),
                        "step": response.get("step")
                    })
                )
        
        except json.JSONDecodeError:
            print(f"❌ Ошибка: Получен невалидный JSON: {message['data']}")
        except Exception as e:
            # Ловим любые другие ошибки, чтобы Task не завершался
            print(f"❌ Ошибка при обработке сообщения: {type(e).__name__}: {e}")
