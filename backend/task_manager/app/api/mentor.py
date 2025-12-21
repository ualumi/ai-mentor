
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
import aiohttp
import json
import asyncio
import uuid
from app.core.redis_client import redis
from app.core.websocket_manager import manager, TASK_CONTEXT, SESSION_TO_TASK
from starlette.websockets import WebSocketDisconnect

router = APIRouter()

CHANNEL_MENTOR_IN = "mentor_in"
CHANNEL_SUBMIT = "submit_code"
CHANNEL_ANALYZE = "analyze"

USER_SERVICE_URL = "http://user_service:8002/auth/verify-token"


async def verify_token(token: str):
    if not token:
        return None

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{USER_SERVICE_URL}?token={token}") as resp:
                if resp.status == 200:
                    return await resp.json()
                return None
        except Exception as e:
            print(f"⚠️ Ошибка запроса к user_service: {e}")
            return None


async def wait_for_task_run_id(session_id: str, timeout=5.0):
        """Ждём task_run_id для session_id, создаётся автоматически при первом task_condition"""
        waited = 0.0
        interval = 0.1
        while waited < timeout:
            task_run_id = SESSION_TO_TASK.get(session_id)
            if task_run_id:
                return task_run_id
            await asyncio.sleep(interval)
            waited += interval
        return None


@router.websocket("/ws/tasks/{session_id}")
async def websocket_task(websocket: WebSocket, session_id: str):
    await websocket.accept()

    token = websocket.query_params.get("token")
    user = await verify_token(token)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = str(user["user_id"])

    # ✅ Ждём, пока Redis listener создаст task_run_id
    task_run_id = await wait_for_task_run_id(session_id)

    task_run_id = SESSION_TO_TASK.get(session_id)
    if not task_run_id:
        # редкий случай, если Scaffolding ещё не прислала событие
        task_run_id = str(uuid.uuid4())
        SESSION_TO_TASK[session_id] = task_run_id
        TASK_CONTEXT[task_run_id] = {
            "session_id": session_id,
            "current_step": 0,
            "condition": None,
            "answer": None
        }

    await manager.connect(websocket, task_run_id)

    # Сразу пушим текущее задание
    ctx = TASK_CONTEXT.get(task_run_id)
    try:
        if ctx and ctx.get("condition"):
            await websocket.send_text(json.dumps({
                "event": "task_condition",
                "condition": ctx["condition"],
                "step_id": ctx.get("current_step", 0)
            }))
    except WebSocketDisconnect:
        print(f"⚠️ WS closed before initial task_condition was sent")
        return

    try:
        while True:
            code = await websocket.receive_text()

            msg = {
                "task_run_id": task_run_id,
                "session_id": session_id,
                "user_id": user_id,
                "code": code,
                "step_id": ctx.get("current_step", 0) if ctx else 0,
                "condition": ctx.get("condition")
            }

            await redis.publish(CHANNEL_SUBMIT, json.dumps(msg))
            await redis.publish(CHANNEL_ANALYZE, json.dumps(msg))
            await redis.publish(CHANNEL_MENTOR_IN, json.dumps(msg))

            print(f"📤 Код отправлен в Redis для task_run_id={task_run_id}")

            await websocket.send_text("✅ Code received")

    except WebSocketDisconnect:
        print(f"🔌 WS disconnected: task_run_id={task_run_id}")
    finally:
        manager.disconnect(task_run_id)

@router.websocket("/ws/code/{user_id}")
async def websocket_code(websocket: WebSocket, user_id: str):
    """Отдельный канал для отправки кода"""
    await websocket.accept()
    await manager.connect(websocket, user_id)

    try:
        while True:
            code = await websocket.receive_text()
            msg = {"user_id": user_id, "code": code}
            await redis.publish(CHANNEL_SUBMIT, json.dumps(msg))
            await redis.publish(CHANNEL_ANALYZE, json.dumps(msg))
    except WebSocketDisconnect:
        print(f"🔌 Отключился пользователь {user_id} (/ws/code)")
    finally:
        manager.disconnect(user_id)

