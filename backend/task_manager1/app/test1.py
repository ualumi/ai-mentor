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

async def test():

    uri = f"ws://localhost:8004/ws/tasks/{session_id}"
    async with websockets.connect(uri) as ws:
        # 1️⃣ condition
        condition = await ws.recv()
        print("📘", condition)

        # -----------------------------
        # 2️⃣ run_code → песочница
        # -----------------------------
        await ws.send(json.dumps({
            "event": "run_code",
            "code": "print(2 + 2)"
        }))

        sandbox_reply = await ws.recv()
        print("🧪 Sandbox:", sandbox_reply)

        # -----------------------------
        # 3️⃣ submit_code → ментор + аналитик
        # -----------------------------
        await ws.send(json.dumps({
            "event": "submit_code",
            "code": "print(9 / 3)"
        }))

        mentor_reply = await ws.recv()
        print("🧠 Mentor:", mentor_reply)

asyncio.run(test())

resp = requests.get(f"http://progress_service:8008/progress/{session_id}")
print(resp.json())


resp = requests.get(f"http://attempts_service:8009/attempts/{session_id}")
print(resp.json())
