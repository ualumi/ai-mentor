'''import json
from app.core.redis_client import redis
from app.core.sandbox_runner import run_code

CHANNEL_SUBMIT = "submit_code"
CHANNEL_RESULTS = "code_results"

async def sandbox_worker():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_SUBMIT)
    print("🔹 Sandbox worker подписан на канал submit_code")
    
    async for message in pubsub.listen():
        if message["type"] != "message":
            print("Плучено сообщение")
            continue

        data = json.loads(message["data"])
        code = data["code"]
        user_id = data["user_id"]
        step_id = data["step_id"]
        learning_session_id = data["learning_session_id"]
        # 🔹 Выполнение кода через уже существующий run_code
        result_dict = await run_code(code)

        # Формируем удобный текст для отправки WebSocket-сервису
        result_text = ""
        if result_dict["stdout"]:
            result_text += f"Output:\n{result_dict['stdout']}\n"
        if result_dict["stderr"]:
            result_text += f"Error:\n{result_dict['stderr']}\n"
        result_text += f"Return code: {result_dict['returncode']}"

        #new
        await redis.publish(
            "code_results",
            json.dumps({
                "user_id": user_id,
                "code": code,
                "sandbox_result": result_dict,
                "step_id": step_id,
                "learning_session_id": learning_session_id
            })
        )'''

import json
from app.core.redis_client import redis
from app.core.sandbox_runner import run_code

REQUEST_PATTERN = "sandbox_request:*"

async def sandbox_worker():
    pubsub = redis.pubsub()
    await pubsub.psubscribe(REQUEST_PATTERN)

    print("🔹 Sandbox worker подписан на sandbox_request:*")

    async for message in pubsub.listen():
        if message["type"] != "pmessage":
            continue

        channel = message["channel"]  # sandbox_request:{user_id}
        data = json.loads(message["data"])

        user_id = data["user_id"]
        code = data["code"]
        attempt_id = data.get("attempt_id")
        step_id = data.get("step_id")
        learning_session_id = data.get("learning_session_id")

        # 🔹 Выполнение кода
        result_dict = await run_code(code)

        # 🔹 Публикация ответа ТОЛЬКО в канал пользователя
        await redis.publish(
            f"sandbox_response:{user_id}",
            json.dumps({
                "user_id": user_id,
                "attempt_id": attempt_id,
                "sandbox_result": result_dict,
                "step_id": step_id,
                "learning_session_id": learning_session_id
            })
        )
        
