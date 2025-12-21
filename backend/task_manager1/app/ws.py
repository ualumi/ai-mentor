# app/ws.py
import json
from fastapi import WebSocket, WebSocketDisconnect
from app.redis_client import redis
from app.state import TASKS, TaskState

CHANNEL_MENTOR_IN = "mentor_in"
CHANNEL_SUBMIT = "submit_code"
CHANNEL_ANALYZE = "analyze"


async def task_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    print(f"🔌 WS connected: {session_id}")

    task = TASKS.setdefault(session_id, TaskState())

    try:
        # 1️⃣ Ждём condition из Redis
        await task.condition_event.wait()

        await websocket.send_text(json.dumps({
            "event": "task_condition",
            "condition": task.condition
        }))

        # 2️⃣ Ждём код от фронта
        code = await websocket.receive_text()
        task.code = code
        task.code_event.set()

        msg = json.dumps({
            "session_id": session_id,
            "code": code,
            "step_id": "0"
        })

        # 3️⃣ Публикуем код
        await redis.publish(CHANNEL_MENTOR_IN, msg)
        await redis.publish(CHANNEL_SUBMIT, msg)
        await redis.publish(CHANNEL_ANALYZE, msg)

        print(f"📤 Code published for {session_id}")

        # 4️⃣ Ждём ответы
        await task.reply_event.wait()

        await websocket.send_text(f"ИИ-ментор: {task.mentor_reply}")
        await websocket.send_text(f"Песочница: {task.sandbox_reply}")

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {session_id}")