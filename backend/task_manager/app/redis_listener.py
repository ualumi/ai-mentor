


import asyncio
import json
from app.core.redis_client import redis
from app.core.websocket_manager import manager
import uuid
from app.core.websocket_manager import TASK_CONTEXT, SESSION_TO_TASK


# Выходные каналы
CHANNEL_MENTOR_OUT = "mentor_out"
CHANNEL_RESULTS = "code_results"
CHANNEL_TASK_CONDITION = "task_condition"
listener_ready = asyncio.Event()
async def redis_listener():

    pubsub = redis.pubsub()
    await pubsub.subscribe(
        CHANNEL_MENTOR_OUT,
        CHANNEL_RESULTS,
        CHANNEL_TASK_CONDITION
    )
    listener_ready.set()
    print("🔄 Redis listener запущен (Task Manager слушает mentor_out, code_results, task_condition)")
 
    async for message in pubsub.listen():
        print("🔔 Received Redis message:", message)
        channel = message["channel"]
        if isinstance(channel, bytes):
            channel = channel.decode()
        if message is None or message.get("type") != "message":
            continue

        try:
            payload = json.loads(message["data"])
            #channel = message["channel"]

            # -------------------------------
            # 🔹 mentor_out — требует user_id
            # -------------------------------
            '''if channel == CHANNEL_MENTOR_OUT:
                user_id = payload.get("user_id")
                task_run_id = payload.get("task_run_id")

                if not user_id or not task_run_id:
                    continue

                hint = payload.get("hint")
                if hint:
                    await manager.send_personal_message(
                        f"ИИ-ментор: {hint}",
                        task_run_id
                    )'''
            
            if channel == CHANNEL_MENTOR_OUT:
                session_id = payload.get("session_id")
                task_run_id = SESSION_TO_TASK.get(session_id)
                hint = payload.get("hint")
                if not session_id or not hint:
                    continue

                # ищем task_run_id по user_id
                #task_run_id = None
                for tid, ctx in TASK_CONTEXT.items():
                    if ctx.get("session_id") == session_id:
                        task_run_id = tid
                        break

                if not task_run_id:
                    print(f"❌ task_run_id not found for session_id={session_id}")
                    continue

                '''await manager.send_personal_message(
                    f"ИИ-ментор: {hint}",
                    task_run_id
                )'''

                await manager.send_personal_message(json.dumps({
                    "event": "mentor",
                    "hint": hint
                }), task_run_id)

            # -------------------------------
            # 🔹 code_results — требует user_id
            # -------------------------------
            elif channel == CHANNEL_RESULTS:
                session_id = payload.get("session_id")
                result = payload.get("result")

                if not session_id or not result:
                    continue

                task_run_id = SESSION_TO_TASK.get(session_id)
                if not task_run_id:
                    print(f"❌ task_run_id not found for session_id={session_id}")
                    continue

                '''await manager.send_personal_message(
                    f"Песочница:\n{result}",
                    task_run_id
                )'''

                await manager.send_personal_message(json.dumps({
                    "event": "sandbox",
                    "result": result
                }), task_run_id)

            # -------------------------------
            # 🔹 task_condition — ТОЛЬКО session_id
            # -------------------------------
            elif channel == CHANNEL_TASK_CONDITION:
                session_id = payload.get("session_id")
                condition = payload.get("condition")
                step_id = payload.get("step_id")

                if not session_id or step_id is None or not condition:
                    print("❌ Invalid task_condition event:", payload)
                    continue

                # 1️⃣ Создаём task_run_id, если ещё нет
                task_run_id = SESSION_TO_TASK.get(session_id)
                if not task_run_id:
                    task_run_id = str(uuid.uuid4())
                    SESSION_TO_TASK[session_id] = task_run_id
                    TASK_CONTEXT[task_run_id] = {}  # создаём пустой контекст
                    print(f"🆕 Создан task_run_id={task_run_id} для session_id={session_id}")

                # 2️⃣ Обновляем контекст (буферизация)
                TASK_CONTEXT[task_run_id].update({
                    "session_id": session_id,
                    "current_step": step_id,
                    "condition": condition,
                    "answer": payload.get("answer")
                })

                # 3️⃣ Если WS подключён — пушим сразу
                await manager.send_personal_message(
                    json.dumps({
                        "event": "task_condition",
                        "step_id": step_id,
                        "condition": condition
                    }),
                    task_run_id
                )

                print(f"📘 Condition обновлён для task_run_id={task_run_id}")


        except Exception as e:
            print(f"Redis listener error: {e}")



def start_redis_listener_on_startup(app):
    @app.on_event("startup")
    async def startup_event():
        asyncio.create_task(redis_listener())
        await listener_ready.wait()
        print("✅ Task Manager ready to receive events")
        

