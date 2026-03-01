import json
import uuid
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .websocket_manager import ConnectionManager
from .redis_client import redis_client
from .models import FrontendMessage

app = FastAPI()
manager = ConnectionManager()

# Храним состояние пользователя
USER_STATE = {}

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
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("task_condition")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue

        payload = json.loads(message["data"])

        if payload.get("user_id") != user_id:
            continue

        USER_STATE[user_id].update({
            "learning_session_id": payload["learning_session_id"],
            "condition": payload["condition"],
            "step_id": payload["step_id"],
            "module_ready": True
        })

        await manager.send_to_user(user_id, {
            "type": "task_condition",
            "condition": payload["condition"]
        })


# -----------------------------
# WebSocket endpoint
# -----------------------------

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
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

            # -----------------
            # Установка режима
            # -----------------
            if data.type == "set_mode":
                USER_STATE[user_id]["mode"] = data.mode

                if data.mode == "free":
                    USER_STATE[user_id]["module_ready"] = True

                continue

            state = USER_STATE[user_id]

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
                    base_payload.update({
                        "learning_session_id": state["learning_session_id"],
                        "condition": state["condition"],
                        "step_id": state["step_id"],
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