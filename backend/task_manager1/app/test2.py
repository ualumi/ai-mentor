'''import asyncio
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

r = requests.get(
    f"{USER_SERVICE}/auth/verify-token",
    params={"token": token},
)

answer = r.json()["status"]

print(f"✅ {answer}")'''


'''import asyncio
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

        # 2️⃣ send code
        ws.send(json.dumps({"mode": "free"}))
        await ws.send("print(4/2)")

        mentor = await ws.recv()
        sandbox = await ws.recv()

        print("🧠", mentor)
        print("🧪", sandbox)

asyncio.run(test())'''

'''import websockets
import json

ws = websockets.connect("ws://localhost:8004/ws/tasks/test1")

ws.send(json.dumps({"mode": "free"}))
ws.send("model.fit(X, y)")

while True:
    print(ws.recv())'''

import asyncio
import websockets
import json

async def connect_to_websocket():
    async with websockets.connect("ws://localhost:8004/ws/tasks/test1") as websocket:
        # Отправляем данные
        await websocket.send(json.dumps({"mode": "free"}))
        await websocket.send("model.fit(X, y)")
        
        # Получаем ответы
        while True:
            response = await websocket.recv()
            print(response)

# Запуск асинхронной функции
asyncio.run(connect_to_websocket())