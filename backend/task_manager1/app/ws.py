

'''import json
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from app.redis_client import redis
from app.state import TASKS, TaskState
import uuid

CHANNEL_SUBMIT = "submit_code"
CHANNEL_MENTOR_IN = "mentor_in"
CHANNEL_ANALYZE = "analyze"


async def task_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    print(f"🔌 WS connected: {session_id}")

    task = TASKS.setdefault(session_id, TaskState())

    try:
        # 🔹 если condition пришло ДО WS — отправляем сразу
        if task.condition is not None:
            await websocket.send_text(json.dumps({
                "event": "task_condition",
                "condition": task.condition
            }))

        while True:
            print("Event is_set BEFORE wait:", task.recommendation_event.is_set())
            print("Event object id:", id(task.recommendation_event))
            recommendation_task = asyncio.create_task(task.recommendation_event.wait())
            recv_task = asyncio.create_task(websocket.receive_text())
            condition_task = asyncio.create_task(task.condition_event.wait())

            done, pending = await asyncio.wait(
                {recv_task, condition_task, recommendation_task},
                return_when=asyncio.FIRST_COMPLETED
            )

            if recommendation_task in done:
                await websocket.send_text(json.dumps({
                    "event": "module_recommendation",
                    "data": task.recommendation
                }))

                task.recommendation = None
                task.recommendation_event.clear()

                recv_task.cancel()
                condition_task.cancel()
                continue

            # 🟡 1. пришло condition из Redis
            if condition_task in done:
                await websocket.send_text(json.dumps({
                    "event": "task_condition",
                    "condition": task.condition
                }))
                task.condition_event.clear()

                recv_task.cancel()
                continue

            # 🟢 2. пришло сообщение от клиента
            raw = recv_task.result()
            condition_task.cancel()

            event = None
            code = None

            try:
                data = json.loads(raw)
                event = data.get("event")
                code = data.get("code")
            except json.JSONDecodeError:
                code = raw

            if code:
                task.code = code.strip()

            if not event:
                continue

            # ▶️ RUN_CODE — sandbox
            if event == "run_code":
                payload = {
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                }
                await redis.publish(CHANNEL_SUBMIT, json.dumps(payload))

                try:
                    await asyncio.wait_for(task.reply_event.wait(), timeout=5)
                except asyncio.TimeoutError:
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Execution timeout"
                    }))
                    continue

                await websocket.send_text(json.dumps({
                    "event": "sandbox_reply",
                    "result": task.sandbox_reply
                }))

                task.sandbox_reply = None
                task.reply_event.clear()

            # 📤 SUBMIT_CODE — mentor + analyze
            elif event == "submit_code":
                attempt_id = str(uuid.uuid4())
                task.current_attempt_id = attempt_id
                payload = {
                    "session_id": session_id,
                    "attempt_id": attempt_id,
                    "code": task.code,
                    "step_id": task.step_id,
                    "condition": task.condition,
                }

                await redis.publish(CHANNEL_MENTOR_IN, json.dumps(payload))
                await redis.publish(CHANNEL_ANALYZE, json.dumps(payload))

                try:
                    await asyncio.wait_for(task.reply_event.wait(), timeout=5)
                except asyncio.TimeoutError:
                    pass

                if task.mentor_reply:
                    await websocket.send_text(json.dumps({
                        "event": "mentor_reply",
                        "text": task.mentor_reply
                    }))

                task.step_id += 1
                task.mentor_reply = None
                task.reply_event.clear()

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {session_id}")'''

import json
import asyncio
import uuid
from fastapi import WebSocket, WebSocketDisconnect
from app.redis_client import redis
from app.state import TASKS, TaskState

CHANNEL_SUBMIT = "submit_code"
CHANNEL_MENTOR_IN = "mentor_in"
CHANNEL_ANALYZE = "analyze"


async def task_ws(websocket: WebSocket, user_id: str):
    await websocket.accept()
    print(f"🔌 WS connected: {user_id}")

    # создаём TaskState если нет
    task = TASKS.setdefault(user_id, TaskState())

    try:
        # -----------------------------
        # Отправляем накопленные события (если пришли ДО WS)
        # -----------------------------
        #condition = await task.condition_queue.get()
        if task.condition is not None:
            await websocket.send_text(json.dumps({
                "event": "task_condition",
                "condition": task.condition
            }))

        if task.recommendation:
            await websocket.send_text(json.dumps({
                "event": "module_recommendation",
                "data": task.recommendation
            }))
            task.recommendation = None
            task.recommendation_event.clear()

        if task.sandbox_reply is not None:
            await websocket.send_text(json.dumps({
                "event": "sandbox_reply",
                "result": task.sandbox_reply
            }))
            task.sandbox_reply = None

        if task.mentor_reply is not None:
            await websocket.send_text(json.dumps({
                "event": "mentor_reply",
                "text": task.mentor_reply
            }))
            task.mentor_reply = None

        if task.analysis_result is not None:
            await websocket.send_text(json.dumps({
                "event": "analysis_result",
                "data": task.analysis_result
            }))
            task.analysis_result = None
            task.analysis_event.clear()

        if task.analysis_context.get("progress"):
            await websocket.send_text(json.dumps({
                "event": "user_progress",
                "data": task.analysis_context["progress"]
            }))
            task.progress_event.clear()

        task.reply_event.clear()

        # -----------------------------
        # Главный event loop
        # -----------------------------
        while True:

            recv_task = asyncio.create_task(websocket.receive_text())
            condition_task = asyncio.create_task(task.condition_event.wait())
            recommendation_task = asyncio.create_task(task.recommendation_event.wait())
            reply_task = asyncio.create_task(task.reply_event.wait())
            analysis_task = asyncio.create_task(task.analysis_event.wait())
            progress_task = asyncio.create_task(task.progress_event.wait())

            done, pending = await asyncio.wait(
                {recv_task, condition_task, recommendation_task,
                 reply_task, analysis_task, progress_task},
                return_when=asyncio.FIRST_COMPLETED
            )

            for p in pending:
                p.cancel()

            # -----------------------------
            # RECOMMENDATION
            # -----------------------------
            if recommendation_task in done:
                if task.recommendation:
                    await websocket.send_text(json.dumps({
                        "event": "module_recommendation",
                        "data": task.recommendation
                    }))
                    task.recommendation = None
                task.recommendation_event.clear()
                continue

            # -----------------------------
            # CONDITION
            # -----------------------------
            if condition_task in done:
                await websocket.send_text(json.dumps({
                    "event": "task_condition",
                    "condition": task.condition
                }))
                task.condition_event.clear()
                continue

            # -----------------------------
            # REPLY (mentor/sandbox)
            # -----------------------------
            if reply_task in done:
                if task.sandbox_reply is not None:
                    await websocket.send_text(json.dumps({
                        "event": "sandbox_reply",
                        "result": task.sandbox_reply
                    }))
                    task.sandbox_reply = None

                if task.mentor_reply is not None:
                    await websocket.send_text(json.dumps({
                        "event": "mentor_reply",
                        "text": task.mentor_reply
                    }))
                    task.mentor_reply = None

                task.reply_event.clear()
                continue

            # -----------------------------
            # ANALYSIS_RESULT
            # -----------------------------
            if analysis_task in done:
                if task.analysis_result:
                    await websocket.send_text(json.dumps({
                        "event": "analysis_result",
                        "data": task.analysis_result
                    }))
                    task.analysis_result = None
                task.analysis_event.clear()
                continue

            # -----------------------------
            # USER_PROGRESS
            # -----------------------------
            if progress_task in done:
                if task.analysis_context.get("progress"):
                    await websocket.send_text(json.dumps({
                        "event": "user_progress",
                        "data": task.analysis_context["progress"]
                    }))
                task.progress_event.clear()
                continue

            # -----------------------------
            # CLIENT MESSAGE
            # -----------------------------
            if recv_task in done:
                raw = recv_task.result()
                try:
                    data = json.loads(raw)
                except json.JSONDecodeError:
                    continue

                event = data.get("event")
                code = data.get("code")
                if code:
                    task.code = code.strip()
                if not event:
                    continue

                # ▶ RUN_CODE
                if event == "run_code":
                    payload = {
                        "user_id": user_id,
                        "learning_session_id": task.learning_session_id,
                        "code": task.code,
                        "step_id": task.step_id
                    }
                    await redis.publish(CHANNEL_SUBMIT, json.dumps(payload))

                # ▶ SUBMIT_CODE
                elif event == "submit_code":
                    attempt_id = str(uuid.uuid4())
                    task.current_attempt_id = attempt_id
                    payload = {
                        "user_id": user_id,
                        "learning_session_id": task.learning_session_id,
                        "attempt_id": attempt_id,
                        "code": task.code,
                        "step_id": task.step_id,
                        "condition": task.condition,
                    }
                    await redis.publish(CHANNEL_MENTOR_IN, json.dumps(payload))
                    await redis.publish(CHANNEL_ANALYZE, json.dumps(payload))
                    task.step_id += 1

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {user_id}")