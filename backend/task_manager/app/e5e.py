import asyncio
import json
import uuid
import requests
import websockets

# -------------------------------
# Настройки сервисов
# -------------------------------
USER_SERVICE = "http://user_service:8002"
LEARNING_SERVICE = "http://learning_service:8001"
TASK_MANAGER_WS = "ws://task_manager:8004/ws/tasks/{task_run_id}"
TASK_MANAGER_API = "http://task_manager:8004/tasks/get_task_run_id"


# -------------------------------
# 1️⃣ Регистрация и логин пользователя
# -------------------------------
email = f"test_{uuid.uuid4().hex[:6]}@example.com"
password = "password123"

r = requests.post(
    f"{USER_SERVICE}/auth/register",
    json={"email": email, "password": password, "username": email.split('@')[0]},
)
assert r.status_code in (200, 201)

r = requests.post(
    f"{USER_SERVICE}/auth/login",
    json={"email": email, "password": password},
)
assert r.status_code == 200
token = r.json()["access_token"]

print(f"✅ User registered & logged in: {email}")

# ------------------------------- 
# 2️⃣ Создание учебной сессии
# -------------------------------
r = requests.post(
    f"{LEARNING_SERVICE}/learning/start",
    headers={"Authorization": f"Bearer {token}"},
    json={"competency": "ml_basic", "methodology": "scaffolding"},
)
assert r.status_code == 200, f"Failed to start session: {r.status_code}, {r.text}"
print("Response from Learning Service:", r.status_code, r.text)

session_id = r.json()["session_id"]
print(f"🧩 session_id = {session_id}")

# -------------------------------
# 3️⃣ Получаем task_run_id через API
# -------------------------------
def get_task_run_id(session_id: str):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{TASK_MANAGER_API}?session_id={session_id}", headers=headers)
    resp.raise_for_status()
    data = resp.json()
    return data["task_run_id"]

task_run_id = get_task_run_id(session_id)
print(f"🎯 task_run_id = {task_run_id}")

# -------------------------------
# 4️⃣ Подключение по WS и отправка кода
# -------------------------------
async def send_code_and_receive_feedback(code, task_run_id, timeout=15):
    mentor_reply = None
    sandbox_reply = None
    ws_url = TASK_MANAGER_WS.format(task_run_id=task_run_id) + f"?token={token}"

    async with websockets.connect(ws_url) as ws:
        print("🔌 WS connected for task_run_id:", task_run_id)

        # -------------------------
        # 1️⃣ Ждём initial task_condition
        # -------------------------
        try:
            while True:
                msg = await asyncio.wait_for(ws.recv(), timeout=timeout)
                try:
                    data = json.loads(msg)
                    if data.get("event") == "task_condition":
                        print("📘 Initial task_condition received")
                        break
                except json.JSONDecodeError:
                    pass
        except asyncio.TimeoutError:
            print("⚠️ Timeout waiting for initial task_condition")

        # -------------------------
        # 2️⃣ Отправляем код
        # -------------------------
        await ws.send(code)
        print(f"📤 Code sent: {code}")

        # -------------------------
        # 3️⃣ Ждём ответы от ментора и песочницы
        # -------------------------
        async def wait_feedback():
            nonlocal mentor_reply, sandbox_reply
            while not (mentor_reply and sandbox_reply):
                try:
                    msg = await ws.recv()
                except websockets.ConnectionClosed:
                    print("⚠️ WS closed before feedback received")
                    break

                try:
                    if msg.startswith("{"):
                        data = json.loads(msg)
                        if data.get("event") == "task_condition":
                            continue
                except Exception:
                    pass

                if msg.startswith("ИИ-ментор"):
                    mentor_reply = msg
                elif msg.startswith("Песочница"):
                    sandbox_reply = msg

        await asyncio.wait_for(wait_feedback(), timeout=timeout)

    print("🧠 Mentor:", mentor_reply)
    print("🧪 Sandbox:", sandbox_reply)
    return {"mentor": mentor_reply, "sandbox": sandbox_reply}


# -------------------------------
# 5️⃣ Полный сценарий e2e
# -------------------------------
async def run_e2e_test():
    feedback = await send_code_and_receive_feedback(
        code="print(4/2)",
        task_run_id=task_run_id
    )

    assert feedback["mentor"] is not None
    assert feedback["sandbox"] is not None

    print("✅ E2E test passed")

# -------------------------------
# 6️⃣ Запуск
# -------------------------------
if __name__ == "__main__":
    asyncio.run(run_e2e_test())


'''async def send_code_and_receive_feedback(code, task_run_id, timeout=5):
    mentor_reply = None
    sandbox_reply = None
    ws_url = TASK_MANAGER_WS.format(task_run_id=task_run_id) + f"?token={token}"

    async with websockets.connect(ws_url) as ws:
        # Игнорируем initial task_condition
        while True:
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=timeout)
            except asyncio.TimeoutError:
                break
            try:
                data = json.loads(msg)
                if data.get("event") == "task_condition":
                    print("📘 Initial task_condition ignored")
                    break
            except json.JSONDecodeError:
                break

        # Отправляем код
        await ws.send(code)
        print(f"📤 Code sent: {code}")

        # Ждём ответы
        async def wait_feedback():
            nonlocal mentor_reply, sandbox_reply
            while not (mentor_reply and sandbox_reply):
                msg = await ws.recv()
                try:
                    if msg.startswith("{"):
                        data = json.loads(msg)
                        if data.get("event") == "task_condition":
                            continue
                except Exception:
                    pass
                if msg.startswith("ИИ-ментор"):
                    mentor_reply = msg
                elif msg.startswith("Песочница"):
                    sandbox_reply = msg

        await asyncio.wait_for(wait_feedback(), timeout=timeout)

    print("🧠 Mentor:", mentor_reply)
    print("🧪 Sandbox:", sandbox_reply)
    return {"mentor": mentor_reply, "sandbox": sandbox_reply}'''