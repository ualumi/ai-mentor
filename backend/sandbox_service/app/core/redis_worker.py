import json
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
        )

'''        # Отправляем результат обратно в WebSocket-сервис
        await redis.publish(CHANNEL_RESULTS, json.dumps({"user_id": user_id, "result": result_text}))
'''
        
