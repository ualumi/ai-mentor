

# app/ws.py
'''import json
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
        while True:

            # 1️⃣ CONDITION ТОЛЬКО ЕСЛИ НЕ FREE
            if task.mode != "free":
                await task.condition_event.wait()
                await websocket.send_text(json.dumps({
                    "event": "task_condition",
                    "condition": task.condition
                }))
                task.condition_event.clear()

            # 2️⃣ КОД ОТ ПОЛЬЗОВАТЕЛЯ
            code = await websocket.receive_text()
            task.code = code

            msg = json.dumps({
                "session_id": session_id,
                "code": code,
                "step_id": task.step_id
            })

            # 3️⃣ ROUTING ПО MODE
            await redis.publish(CHANNEL_MENTOR_IN, msg)
            await redis.publish(CHANNEL_ANALYZE, msg)

            if task.mode in ("task", "module"):
                await redis.publish(CHANNEL_SUBMIT, msg)

            print(f"📤 Code routed ({task.mode}) for {session_id}")

            # 4️⃣ ЖДЁМ ОТВЕТЫ
            await task.reply_event.wait()

            if task.mentor_reply:
                await websocket.send_text(
                    json.dumps({
                        "event": "mentor_reply",
                        "text": task.mentor_reply
                    })
                )

            if task.sandbox_reply:
                await websocket.send_text(
                    json.dumps({
                        "event": "sandbox_reply",
                        "result": task.sandbox_reply
                    })
                )

            # 5️⃣ RESET
            task.mentor_reply = None
            task.sandbox_reply = None
            task.reply_event.clear()

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {session_id}")'''

# app/ws.py
'''import json
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
        while True:

            # 1️⃣ CONDITION ТОЛЬКО ЕСЛИ НЕ FREE
            if task.mode != "free":
                await task.condition_event.wait()
                await websocket.send_text(json.dumps({
                    "event": "task_condition",
                    "condition": task.condition
                }))
                task.condition_event.clear()

            # 2️⃣ СООБЩЕНИЕ ОТ КЛИЕНТА (НЕ ПРОСТО КОД!)


            raw = await websocket.receive_text()

            try:
                data = json.loads(raw)
                code = data.get("code")
            except json.JSONDecodeError:
                # пришёл обычный текст — считаем, что это код
                code = raw

            task.code = code

            event = data.get("event")

            # ✏️ пользователь просто редактирует код
            if event == "code_update":
                task.code = data.get("code", "")
                continue  # ❗ ничего не выполняем

            # ▶️ пользователь нажал "Выполнить код"
            if event == "run_code":
                if not task.code.strip():
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Нет кода для выполнения"
                    }))
                    continue

                msg = json.dumps({
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                })

                # 3️⃣ ROUTING ПО MODE
                await redis.publish(CHANNEL_MENTOR_IN, msg)
                await redis.publish(CHANNEL_ANALYZE, msg)

                if task.mode in ("task", "module"):
                    await redis.publish(CHANNEL_SUBMIT, msg)

                print(f"📤 Code EXECUTED ({task.mode}) for {session_id}")

                # 4️⃣ ЖДЁМ ОТВЕТЫ
                await task.reply_event.wait()

                if task.mentor_reply:
                    await websocket.send_text(json.dumps({
                        "event": "mentor_reply",
                        "text": task.mentor_reply
                    }))

                if task.sandbox_reply:
                    await websocket.send_text(json.dumps({
                        "event": "sandbox_reply",
                        "result": task.sandbox_reply
                    }))

                # 5️⃣ RESET
                task.mentor_reply = None
                task.sandbox_reply = None
                task.reply_event.clear()

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {session_id}")'''


'''
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
        while True:

            # 1️⃣ CONDITION ТОЛЬКО ЕСЛИ НЕ FREE
            if task.mode != "free":
                await task.condition_event.wait()
                await websocket.send_text(json.dumps({
                    "event": "task_condition",
                    "condition": task.condition
                }))
                task.condition_event.clear()

            # 2️⃣ СООБЩЕНИЕ ОТ КЛИЕНТА
            raw = await websocket.receive_text()

            data = None
            event = None
            code = None

            # пробуем разобрать как JSON
            try:
                data = json.loads(raw)
                event = data.get("event")
                code = data.get("code")
            except json.JSONDecodeError:
                # пришла обычная строка — это код
                code = raw

            # если код пришёл — сохраняем
            if code is not None:
                task.code = code

            # ✏️ пользователь просто печатает код
            if event == "code_update":
                continue  # ничего не запускаем

            # ▶️ пользователь нажал "Выполнить код"
            if event == "run_code":

                if not task.code or not task.code.strip():
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Нет кода для выполнения"
                    }))
                    continue

                msg = json.dumps({
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                })

                # 3️⃣ ROUTING
                await redis.publish(CHANNEL_MENTOR_IN, msg)
                await redis.publish(CHANNEL_ANALYZE, msg)

                if task.mode in ("task", "module"):
                    await redis.publish(CHANNEL_SUBMIT, msg)

                print(f"📤 Code EXECUTED ({task.mode}) for {session_id}")

                # 4️⃣ ЖДЁМ ОТВЕТЫ
                await task.reply_event.wait()

                if task.mentor_reply:
                    await websocket.send_text(json.dumps({
                        "event": "mentor_reply",
                        "text": task.mentor_reply
                    }))

                if task.sandbox_reply:
                    await websocket.send_text(json.dumps({
                        "event": "sandbox_reply",
                        "result": task.sandbox_reply
                    }))

                # 5️⃣ RESET
                task.mentor_reply = None
                task.sandbox_reply = None
                task.reply_event.clear()

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {session_id}")'''


'''# app/ws.py
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
        while True:

            # 1️⃣ Отправляем условие (если не free)
            if task.mode != "free":
                await task.condition_event.wait()
                await websocket.send_text(json.dumps({
                    "event": "task_condition",
                    "condition": task.condition
                }))
                task.condition_event.clear()

            # 2️⃣ Получаем сообщение от клиента
            raw = await websocket.receive_text()

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                # пришёл просто текст — считаем, что это обновление кода
                task.code = raw
                continue

            event = data.get("event")
            code = data.get("code")

            # если пришёл код — сохраняем
            if code is not None:
                task.code = code

            # ❗ если event нет — игнорируем
            if not event:
                continue

            # ✏️ пользователь просто редактирует код
            if event == "code_update":
                continue

            # ▶️ пользователь нажал "Выполнить код"
            if event == "run_code":

                if not task.code or not task.code.strip():
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Нет кода для выполнения"
                    }))
                    continue

                payload = {
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                }

                msg = json.dumps(payload)
                print("📨 REDIS PAYLOAD:", payload)

                # 3️⃣ ROUTING
                await redis.publish(CHANNEL_MENTOR_IN, msg)
                await redis.publish(CHANNEL_ANALYZE, msg)

                if task.mode in ("task", "module"):
                    await redis.publish(CHANNEL_SUBMIT, msg)

                print(f"📤 Code EXECUTED ({task.mode}) step={task.step_id}")

                # 4️⃣ Ждём ответы
                await task.reply_event.wait()

                if task.mentor_reply:
                    await websocket.send_text(json.dumps({
                        "event": "mentor_reply",
                        "text": task.mentor_reply
                    }))

                if task.sandbox_reply:
                    await websocket.send_text(json.dumps({
                        "event": "sandbox_reply",
                        "result": task.sandbox_reply
                    }))

                # 5️⃣ УСПЕШНО ЗАВЕРШИЛИ ШАГ → увеличиваем step_id
                task.step_id += 1

                # reset
                task.mentor_reply = None
                task.sandbox_reply = None
                task.reply_event.clear()

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {session_id}")'''


'''# app/ws.py
import json
from fastapi import WebSocket, WebSocketDisconnect
from app.redis_client import redis
from app.state import TASKS, TaskState

CHANNEL_MENTOR_IN = "mentor_in"
CHANNEL_SUBMIT = "submit_code"     # sandbox / execution
CHANNEL_ANALYZE = "analyze"


async def task_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    print(f"🔌 WS connected: {session_id}")

    task = TASKS.setdefault(session_id, TaskState())

    # гарантируем значения по умолчанию
    task.mode = task.mode or "free"
    task.step_id = task.step_id or 1

    try:
        while True:

            # 1️⃣ отправляем условие ТОЛЬКО для module
            if task.mode == "module":
                await task.condition_event.wait()
                await websocket.send_text(json.dumps({
                    "event": "task_condition",
                    "condition": task.condition
                }))
                task.condition_event.clear()

            # 2️⃣ получаем сообщение от клиента
            raw = await websocket.receive_text()

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                # обычный текст — считаем обновлением кода
                task.code = raw
                continue

            event = data.get("event")
            code = data.get("code")

            if code is not None:
                task.code = code

            if not event:
                continue

            # ✏️ просто обновление кода
            if event == "code_update":
                continue

            # ▶️ 1. ПРОСТО ВЫПОЛНИТЬ КОД (sandbox)
            if event == "run_code":

                if not task.code or not task.code.strip():
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Нет кода для выполнения"
                    }))
                    continue

                payload = {
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                }

                await redis.publish(CHANNEL_SUBMIT, json.dumps(payload))
                print(f"▶️ run_code → submit_code | step={task.step_id}")

                # ждём ТОЛЬКО sandbox
                await task.reply_event.wait()

                if task.sandbox_reply:
                    await websocket.send_text(json.dumps({
                        "event": "sandbox_reply",
                        "result": task.sandbox_reply
                    }))

                task.sandbox_reply = None
                task.reply_event.clear()
                continue

            # 🧠 2. ОТПРАВИТЬ НА ПРОВЕРКУ (mentor + analyze)
            if event == "submit_code":

                if not task.code or not task.code.strip():
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Нет кода для отправки"
                    }))
                    continue

                payload = {
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                }

                msg = json.dumps(payload)

                await redis.publish(CHANNEL_MENTOR_IN, msg)
                await redis.publish(CHANNEL_ANALYZE, msg)

                print(f"🧠 submit_code → mentor + analyze | step={task.step_id}")

                # ждём ответы
                await task.reply_event.wait()

                if task.mentor_reply:
                    await websocket.send_text(json.dumps({
                        "event": "mentor_reply",
                        "text": task.mentor_reply
                    }))

                if task.sandbox_reply:
                    await websocket.send_text(json.dumps({
                        "event": "sandbox_reply",
                        "result": task.sandbox_reply
                    }))

                # ⬆️ шаг увеличиваем ТОЛЬКО здесь
                task.step_id += 1

                task.mentor_reply = None
                task.sandbox_reply = None
                task.reply_event.clear()

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {session_id}")'''


# app/ws.py работает как надо но не отправляет ответ запросу
'''import json
from fastapi import WebSocket, WebSocketDisconnect
from app.redis_client import redis
from app.state import TASKS, TaskState

CHANNEL_SUBMIT = "submit_code"
CHANNEL_MENTOR_IN = "mentor_in"
CHANNEL_ANALYZE = "analyze"


async def task_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    print(f"🔌 WS connected: {session_id}")

    task = TASKS.setdefault(session_id, TaskState())

    try:
        while True:
            raw = await websocket.receive_text()

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                task.code = raw
                continue

            event = data.get("event")
            code = data.get("code")

            if code:
                task.code = code

            if not event:
                continue

            # ▶️ RUN CODE
            if event == "run_code":
                if not task.code.strip():
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Empty code"
                    }))
                    continue

                payload = {
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                }

                msg = json.dumps(payload)

                print("▶️ RUN_CODE → submit_code")
                await redis.publish(CHANNEL_SUBMIT, msg)

            # 📤 SUBMIT CODE (mentor + analyze)
            elif event == "submit_code":
                payload = {
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                }

                msg = json.dumps(payload)

                print("📤 SUBMIT_CODE → mentor + analyze")
                await redis.publish(CHANNEL_MENTOR_IN, msg)
                await redis.publish(CHANNEL_ANALYZE, msg)

                task.step_id += 1

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {session_id}")'''

# app/ws.py
import json
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from app.redis_client import redis
from app.state import TASKS, TaskState

CHANNEL_SUBMIT = "submit_code"
CHANNEL_MENTOR_IN = "mentor_in"
CHANNEL_ANALYZE = "analyze"


async def task_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    print(f"🔌 WS connected: {session_id}")

    task = TASKS.setdefault(session_id, TaskState())

    try:
        while True:
            # Если режим не free — отправляем условие задачи
            if task.mode != "free":
                await task.condition_event.wait()
                await websocket.send_text(json.dumps({
                    "event": "task_condition",
                    "condition": task.condition
                }))
                task.condition_event.clear()

            # Получаем сообщение от клиента
            raw = await websocket.receive_text()
            event = None
            code = None

            try:
                data = json.loads(raw)
                event = data.get("event")
                code = data.get("code")
            except json.JSONDecodeError:
                # Если пришёл просто текст — считаем это код
                code = raw

            if code:
                task.code = code.strip()

            if not event:
                continue

            # ▶️ RUN_CODE — просто запустить код (канал submit_code)
            """if event == "run_code":
                if not task.code:
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Empty code"
                    }))
                    continue

                payload = {
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                }
                msg = json.dumps(payload)
                print("▶️ RUN_CODE → submit_code", payload)
                await redis.publish(CHANNEL_SUBMIT, msg)"""
            
            if event == "run_code":
                if not task.code or not task.code.strip():
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Empty code"
                    }))
                    continue

                payload = {
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                }
                msg = json.dumps(payload)

                print("▶️ RUN_CODE → submit_code", payload)

                # отправляем код в sandbox
                await redis.publish(CHANNEL_SUBMIT, msg)

                # ждём результат выполнения (ТОЛЬКО sandbox)
                try:
                    await asyncio.wait_for(task.reply_event.wait(), timeout=5)
                except asyncio.TimeoutError:
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Execution timeout"
                    }))
                    continue

                # отправляем результат клиенту
                if task.sandbox_reply is not None:
                    await websocket.send_text(json.dumps({
                        "event": "sandbox_reply",
                        "result": task.sandbox_reply
                    }))

                # сбрасываем состояние
                task.sandbox_reply = None
                task.reply_event.clear()

            # 📤 SUBMIT_CODE — отправить на проверку ментору + анализ
            elif event == "submit_code":
                if not task.code:
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Empty code"
                    }))
                    continue

                payload = {
                    "session_id": session_id,
                    "code": task.code,
                    "step_id": task.step_id
                }
                msg = json.dumps(payload)
                print("📤 SUBMIT_CODE → mentor_in + analyze", payload)

                await redis.publish(CHANNEL_MENTOR_IN, msg)
                await redis.publish(CHANNEL_ANALYZE, msg)

                # Ждём ответы с таймаутом 5 секунд, чтобы WS не зависал
                try:
                    await asyncio.wait_for(task.reply_event.wait(), timeout=5)
                except asyncio.TimeoutError:
                    print(f"⚠️ Timeout waiting for replies for {session_id}")

                # Отправляем ответы клиенту
                if task.mentor_reply is not None:
                    await websocket.send_text(json.dumps({
                        "event": "mentor_reply",
                        "text": task.mentor_reply
                    }))

                if task.sandbox_reply is not None:
                    await websocket.send_text(json.dumps({
                        "event": "sandbox_reply",
                        "result": task.sandbox_reply
                    }))

                # Считаем шаг выполненным
                task.step_id += 1

                # Сбрасываем ответы и событие
                task.mentor_reply = None
                task.sandbox_reply = None
                task.reply_event.clear()

    except WebSocketDisconnect:
        print(f"❌ WS disconnected: {session_id}")
