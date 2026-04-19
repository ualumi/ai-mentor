import logging
from logging.handlers import RotatingFileHandler
import os

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        RotatingFileHandler(
            "logs/app.log",
            maxBytes=5_000_000,
            backupCount=3
        ),
        logging.StreamHandler()
    ],
)
import json
import uuid
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .websocket_manager import ConnectionManager
from .redis_client import redis_client
from .models import FrontendMessage
from jose import jwt, JWTError
import os

import logging

logger = logging.getLogger(__name__)

app = FastAPI()
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

manager = ConnectionManager()

# Храним состояние пользователя
USER_STATE = {}
PENDING_TASKS = {}
# -----------------------------
# Redis listeners
# -----------------------------

async def listen_user_channels(user_id: str):
    pubsub = redis_client.pubsub()
    await pubsub.psubscribe(
        f"sandbox_response:{user_id}",
        f"mentor_response:{user_id}",
        f"analytics_response:{user_id}",
        f"user_progress:{user_id}",
    )

    async for message in pubsub.listen():
        if message["type"] not in ("message", "pmessage"):
            continue

        channel = message["channel"]
        data = json.loads(message["data"])

        # игнорируем пустой user_progress
        if "user_progress" in channel and data == []:
            continue

        await manager.send_to_user(user_id, {
            "source": channel,
            "data": data
        })
        logger.info(f"source: {channel}, value: {data}")



async def listen_task_condition(user_id: str):
    stream_key = f"task_condition:{user_id}"

    # Сохраняем последнее прочитанное сообщение
    last_id = "0"  # можно "0" для прочтения всех или ">" для новых

    while True:
        resp = await redis_client.xread(
            streams={stream_key: last_id},
            count=10,
            block=1000  # блокируем до 1 секунды, ждём новые
        )
        if not resp:
            continue

        # resp = [(stream_key, [(message_id, {field: value})])]
        for _, messages in resp:
            for message_id, fields in messages:
                learning_session_id = fields["learning_session_id"]
                condition = json.loads(fields["condition"])

                # обновляем USER_STATE
                if user_id not in USER_STATE:
                    PENDING_TASKS.setdefault(user_id, []).append({
                        "learning_session_id": learning_session_id,
                        "condition": condition
                    })
                    continue

                USER_STATE[user_id].update({
                    "learning_session_id": learning_session_id,
                    "condition": condition,
                    "module_ready": True
                })

                # отправляем через websocket
                await manager.send_to_user(user_id, {
                    "type": "task_condition",
                    "condition": condition
                })
                print(f"Sent task condition to user {user_id} for session {learning_session_id}")
                # отмечаем последнее сообщение
                last_id = message_id
#получает одно тупое сообщение и валится



# -----------------------------
# WebSocket endpoint
# -----------------------------

'''@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):'''

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # 1️⃣ Получаем токен из query параметров
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    # 2️⃣ Декодируем JWT
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        #user_id = str(payload["user_id"])
        user_id = int(payload["sub"])
    except JWTError:
        await websocket.close(code=1008)
        return
    
    
    # Основная логика
    await manager.connect(user_id, websocket)

    USER_STATE[user_id] = {
        "mode": None,
        "module_ready": False
    }

    asyncio.create_task(listen_user_channels(user_id))
    asyncio.create_task(listen_task_condition(user_id))

    try:
        while True:
            raw = await websocket.receive_text()
            data = FrontendMessage(**json.loads(raw))
            if data.type == "next_step":

                state = USER_STATE[user_id]

                await redis_client.publish(
                    "scaffolding.next_step",
                    json.dumps({
                        "user_id": user_id,
                        "learning_session_id": state["learning_session_id"]
                    })
                )

                continue

            # -----------------
            # Установка режима
            # -----------------
            if data.type == "set_mode":
                USER_STATE[user_id]["mode"] = data.mode
                print("Для данной попытки mode", data.mode)

                if data.mode == "free":
                    USER_STATE[user_id]["module_ready"] = True

                continue

            state = USER_STATE[user_id]
            print("Для данной попытки mode", state["mode"])

            if data.type == "set_session":
                USER_STATE[user_id]["learning_session_id"] = data.learning_session_id
                USER_STATE[user_id]["module_ready"] = True
                # ❗ сбрасываем condition
                state["condition"] = None
                #state["module_ready"] = False
                print("🔥 Session switched:", data.learning_session_id)
                continue
            
            '''if data.type == "set_session":
                USER_STATE[user_id]["learning_session_id"] = data.learning_session_id
                USER_STATE[user_id]["module_ready"] = True

                print("🔥 Session switched:", data.learning_session_id)

                # -----------------------------
                # 🔥 FIX: сразу отправляем condition если он уже есть
                # -----------------------------

                state = USER_STATE[user_id]

                # 1. если condition уже в state
                if state.get("condition"):
                    await manager.send_to_user(user_id, {
                        "type": "task_condition",
                        "condition": state["condition"]
                    })
                    continue

                # 2. если есть отложенные задачи (очень важно для SSO)
                pending = PENDING_TASKS.get(user_id, [])

                for task in pending:
                    if task["learning_session_id"] == data.learning_session_id:
                        state["condition"] = task["condition"]
                        state["module_ready"] = True

                        await manager.send_to_user(user_id, {
                            "type": "task_condition",
                            "condition": task["condition"]
                        })

                        # очищаем очередь
                        PENDING_TASKS[user_id] = [
                            t for t in pending
                            if t["learning_session_id"] != data.learning_session_id
                        ]

                        break

                continue'''
            # -----------------
            # Проверка module режима
            # -----------------
            if state["mode"] == "module" and not state["module_ready"]:
                
                await manager.send_to_user(user_id, {
                    "error": "Waiting for task condition"
                })
                continue
            
            
            # -----------------
            # Получение кода
            # -----------------
            if data.event in ("run_code", "submit_code"):
                attempt_id = str(uuid.uuid4())

                base_payload = {
                    "user_id": user_id,
                    "attempt_id": attempt_id,
                    "code": data.code
                }

                if state["mode"] == "module":
                    print("🔥 USING SESSION:", state["learning_session_id"])
                    base_payload.update({
                        "learning_session_id": state["learning_session_id"],
                        "condition": state["condition"],
                    })

                # -----------------
                # run_code
                # -----------------
                if data.event == "run_code":
                    await redis_client.publish(
                        f"sandbox_request:{user_id}",
                        json.dumps(base_payload)
                    )

                # -----------------
                # submit_code
                # -----------------
                if data.event == "submit_code":
                    await redis_client.publish(
                        f"mentor_request:{user_id}",
                        json.dumps(base_payload)
                    )
                    await redis_client.publish(
                        f"analytics_request:{user_id}",
                        json.dumps(base_payload)
                    )

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        USER_STATE.pop(user_id, None)