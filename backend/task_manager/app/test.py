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


import asyncio
import websockets
import json

'''async def test_free_mode():
    async with websockets.connect(
        f"ws://localhost:8004/ws/{user_id}"
    ) as websocket:'''

async def test_free_mode():
    async with websockets.connect(
        f"ws://localhost:8004/ws?token={token}"
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
            "code": "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nresult = factorial(5)\nprint(result)"
        }))

        while True:
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=500.0)
                print("⬅️", response)
            except asyncio.TimeoutError:
                break

asyncio.run(test_free_mode())