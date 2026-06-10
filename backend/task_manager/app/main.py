import json
import uuid
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .websocket_manager import ConnectionManager
from .redis_client import redis_client
from .models import FrontendMessage
from jose import jwt, JWTError
import os
import httpx

app = FastAPI()
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

manager = ConnectionManager()

# Храним состояние пользователя
USER_STATE = {}
PENDING_TASKS = {}
TASK_STATE = {}
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
                TASK_STATE[user_id] = {
                    "learning_session_id": learning_session_id,
                    "next_step_available": False,
                    "status": "pending",
                }
                print("condition for user", user_id, ":", condition)
                # отправляем через websocket
                await manager.send_to_user(user_id, {
                    "type": "task_condition",
                    "condition": condition,
                    "learning_session_id": learning_session_id,
                    "next_step_available": False,
                })
                print(f"Sent task condition to user {user_id} for session {learning_session_id}")
                # отмечаем последнее сообщение
                last_id = message_id
#получает одно тупое сообщение и валится

async def listen_task_correctness(user_id: str):
    pubsub = redis_client.pubsub()

    await pubsub.subscribe(f"tasks_correctness")

    async for message in pubsub.listen():
        print("tasks_correctness", message)
        if message["type"] != "message":
            continue

        data = json.loads(message["data"])
        event = data["event"]
        print(event, "event task_correctness")
        if str(data.get("user_id")) != str(user_id):
            continue

        current_session_id = USER_STATE.get(user_id, {}).get("learning_session_id")
        event_session_id = data.get("learning_session_id")
        if event_session_id and current_session_id and str(event_session_id) != str(current_session_id):
            continue

        task_state = TASK_STATE.get(user_id, {})

        if event == "task_completed":
            task_state.update({
                "learning_session_id": event_session_id or current_session_id,
                "next_step_available": True,
                "status": "completed",
            })
            TASK_STATE[user_id] = task_state

            await manager.send_to_user(user_id, {
                "type": "task_completed",
                "attempt_id": data["attempt_id"],
                "learning_session_id": event_session_id,
                "next_step_available": True
            })

        elif event == "task_not_completed":
            task_state.update({
                "learning_session_id": event_session_id or current_session_id,
                "next_step_available": False,
                "status": "failed",
            })
            TASK_STATE[user_id] = task_state

            await manager.send_to_user(user_id, {
                "type": "task_failed",
                "attempt_id": data["attempt_id"],
                "learning_session_id": event_session_id,
                "next_step_available": False
            })


# -----------------------------
# WebSocket endpoint
# -----------------------------

'''@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):'''

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    #await websocket.accept()

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
    asyncio.create_task(listen_task_correctness(user_id))

    try:
        while True:
            raw = await websocket.receive_text()
            data = FrontendMessage(**json.loads(raw))
            if data.type == "next_step":
                task_state = TASK_STATE.get(user_id, {})

                if not task_state.get("next_step_available"):
                    await manager.send_to_user(user_id, {
                        "type": "error",
                        "error": "Next step is not available yet",
                        "next_step_available": False,
                    })
                    continue

                state = USER_STATE[user_id]
                task_state["next_step_available"] = False
                task_state["status"] = "requested"
                TASK_STATE[user_id] = task_state

                await redis_client.publish(
                    "learning.next_step",
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

            '''if data.type == "set_session":
                USER_STATE[user_id]["learning_session_id"] = data.learning_session_id
                USER_STATE[user_id]["module_ready"] = True
                TASK_STATE[user_id] = {
                    "learning_session_id": data.learning_session_id,
                    "next_step_available": False,
                    "status": "pending",
                }
                # ❗ сбрасываем condition
                state["condition"] = None
                #state["module_ready"] = False
                print("🔥 Session switched:", data.learning_session_id)
                continue'''
            
            if data.type == "set_session":
                USER_STATE[user_id]["learning_session_id"] = data.learning_session_id
                USER_STATE[user_id]["module_ready"] = True
                TASK_STATE[user_id] = {
                    "learning_session_id": data.learning_session_id,
                    "next_step_available": False,
                    "status": "pending",
                }

                # ❗ сбрасываем condition
                state["condition"] = None

                print("🔥 Session switched:", data.learning_session_id)

                # -----------------------------
                # 🔥 НОВОЕ: получаем состояние с learning_service
                # -----------------------------
                try:
                    async with httpx.AsyncClient() as client:
                        res = await client.get(
                            f"http://learning_service:8001/learning/session/{data.learning_session_id}/state",
                            headers={
                                "Authorization": f"Bearer {token}"
                            }
                        )

                        res.raise_for_status()

                        payload = res.json()

                        raw_condition = payload.get("session", {}).get("current_condition")

                        condition = None

                        if raw_condition:
                            # 🔥 важно: current_condition — это строка JSON
                            if isinstance(raw_condition, str):
                                try:
                                    condition = json.loads(raw_condition)
                                except Exception:
                                    condition = {"description": raw_condition}
                            else:
                                condition = raw_condition

                        # -----------------------------
                        # 🔥 сохраняем в state
                        # -----------------------------
                        state["condition"] = condition

                        # -----------------------------
                        # 🔥 отправляем на фронт
                        # -----------------------------
                        await manager.send_to_user(user_id, {
                            "type": "task_condition",
                            "condition": condition
                        })
                        print(condition)

                except Exception as e:
                    print("❌ Failed to fetch session state:", e)

                continue
                        
            
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
                    "code": data.code,
                    "mode": state["mode"]
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
