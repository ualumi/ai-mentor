import asyncio
import json
import uuid
import requests

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
user_id = r.json()["user_id"]
r = requests.post(
    f"{USER_SERVICE}/auth/login",
    json={"email": email, "password": password},
)
assert r.status_code == 200
token = r.json()["access_token"]

print(f"✅ User registered & logged in: {email}")

r = requests.post(
    f"{LEARNING_SERVICE}/learning/start",
    headers={"Authorization": f"Bearer {token}"},
    json={"competency": "Clustering"},
)
assert r.status_code == 200, f"Failed to start session: {r.status_code}, {r.text}"
print("Response from Learning Service:", r.status_code, r.text)

session_id = r.json()["session_id"]
print(f"🧩 session_id = {session_id}")

# -------------------------------
# 2️⃣ Проверка /learning/my
# -------------------------------
r_my = requests.get(
    f"{LEARNING_SERVICE}/learning/my?status=active",
    headers={"Authorization": f"Bearer {token}"},
)

assert r_my.status_code == 200, f"/my failed: {r_my.status_code}, {r_my.text}"

sessions = r_my.json()

print("📚 Active sessions:", sessions)

# 1. Должна быть хотя бы одна активная сессия
assert len(sessions) >= 1, "❌ No active sessions returned!"

# 2. Наша session_id должна быть в списке
assert any(s.get("session_id") == session_id for s in sessions), \
    "❌ Created session not found in /my response!"

# 3. Убедимся, что статус действительно active
assert all(s.get("status") == "active" for s in sessions), \
    "❌ Non-active session returned when filtering by status=active!"

print("✅ /learning/my returned correct active sessions!")

import asyncio
import websockets
import json

async def test_free_mode():
    async with websockets.connect(
        f"ws://localhost:8004/ws/{user_id}"
    ) as websocket:

        # 1️⃣ Устанавливаем режим
        await websocket.send(json.dumps({
            "type": "set_mode",
            "mode": "free"
        }))

        # 2️⃣ run_code
        await websocket.send(json.dumps({
            "type": "code_event",
            "event": "run_code",
            "code": "print(9/3)"
        }))

        # 3️⃣ submit_code
        await websocket.send(json.dumps({
            "type": "code_event",
            "event": "submit_code",
            "code": "print(4/3)"
        }))

        while True:
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print("⬅️", response)
            except asyncio.TimeoutError:
                break

asyncio.run(test_free_mode())