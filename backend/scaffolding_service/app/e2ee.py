'''import asyncio
import json
import uuid
import requests
import redis
import websockets
import time

# ---------------- CONFIG ----------------
BASE = {
    "user": "http://user_service:8002",
    "task": "http://task_manager:8004",
}

REDIS_HOST = "redis"
REDIS_PORT = 6379

CHANNEL_CODE_RESULTS = "code_results"

# ---------------- HELPERS ----------------
def random_email():
    return f"e2e_{uuid.uuid4().hex[:6]}@test.com"


# ---------------- E2E TEST ----------------
async def run_e2e():
    print("\n🚀 START TASK ↔ SCAFFOLDING E2E\n")

    # ---------- 1. REGISTER ----------
    email = random_email()
    password = "StrongPassword123"

    print("👤 REGISTER:", email)
    r = requests.post(
        f"{BASE['user']}/auth/register",
        json={
            "email": email,
            "password": password,
            "username": email.split("@")[0],
        },
    )
    assert r.status_code in (200, 201), r.text

    # ---------- 2. LOGIN ----------
    r = requests.post(
        f"{BASE['user']}/auth/login",
        json={"email": email, "password": password},
    )
    assert r.status_code == 200, r.text

    token = r.json()["access_token"]
    print("🔐 TOKEN OK")

    # ---------- 3. CREATE TASK ----------
    r = requests.post(
        f"{BASE['task']}/tasks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text

    task_run_id = r.json()["task_run_id"]
    print("🆔 TASK CREATED:", task_run_id)

    # ---------- 4. WS CONNECT ----------
    ws_url = f"ws://task_manager:8004/ws/tasks/{task_run_id}?token={token}"

    async with websockets.connect(ws_url) as ws:
        print("🔌 WS CONNECTED")

        # ---------- 5. WAIT INITIAL CONDITION ----------
        initial = await ws.recv()
        print("📥 INITIAL TASK:", initial)

        initial_msg = json.loads(initial)
        assert "condition" in initial_msg

        step_id = initial_msg["condition"]["step_id"]

        # ---------- 6. SEND CODE ----------
        await ws.send("df = pd.read_csv('data.csv')")
        print("📤 CODE SENT")

        # ---------- 7. EMULATE SANDBOX ----------
        rds = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            decode_responses=True
        )

        time.sleep(0.2)

        rds.publish(
            CHANNEL_CODE_RESULTS,
            json.dumps({
                "task_run_id": task_run_id,
                "code": "df = pd.read_csv('data.csv')",
                "step_id": step_id
            })
        )
        print("🧪 SANDBOX RESULT PUBLISHED")

        # ---------- 8. EXPECT NEXT CONDITION ----------
        next_msg = await ws.recv()
        print("📥 NEXT TASK:", next_msg)

        next_task = json.loads(next_msg)
        assert next_task["condition"]["step_id"] == step_id + 1

    print("\n✅ TASK ↔ SCAFFOLDING E2E PASSED\n")


if __name__ == "__main__":
    asyncio.run(run_e2e())'''


'''import asyncio
import json
import uuid
import redis.asyncio as aioredis
import websockets
import requests

REDIS_HOST = "redis"
REDIS_PORT = 6379

TASK_MANAGER_WS = "ws://task_manager:8004/ws/tasks"
USER_SERVICE = "http://user_service:8002"

async def run_test():
    # 1. Зарегистрировать пользователя
    email = f"test_{uuid.uuid4().hex[:6]}@test.com"
    password = "password123"

    r = requests.post(f"{USER_SERVICE}/auth/register", json={
        "email": email,
        "password": password,
        "username": email.split("@")[0]
    })
    assert r.status_code in (200, 201)

    # 2. Логин
    r = requests.post(f"{USER_SERVICE}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    token = r.json()["access_token"]

    # 3. Создать задачу в Task Manager
    r = requests.post(f"http://task_manager:8004/tasks", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    task_run_id = r.json()["task_run_id"]
    print("🆔 Task created:", task_run_id)
    condition = r.json()["condition"]
    answer = r.json()["answer"]

    # 4. Подключение по WS
    async with websockets.connect(f"{TASK_MANAGER_WS}/{task_run_id}?token={token}") as ws:
        print("🔌 WS connected")

        # 5. Отправка кода (правильного и неправильного)
        correct_code = answer or "read_csv load"  # если answer есть, используем его
        await ws.send(correct_code)
        print("📤 Sent correct code")

        # 6. Подключение к Redis для эмуляции сообщений Scaffolding
        rds = aioredis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

        # Ждём, пока Scaffolding отправит следующий шаг
        async def listen_task_condition():
            pubsub = rds.pubsub()
            await pubsub.subscribe("task_condition")
            async for message in pubsub.listen():
                if message["type"] != "message":
                    continue
                payload = json.loads(message["data"])
                if payload["task_run_id"] == task_run_id:
                    print("✅ New step received:", payload)
                    break

        await asyncio.wait_for(listen_task_condition(), timeout=5)

asyncio.run(run_test())'''

'''import asyncio
import json
import uuid
import redis.asyncio as aioredis
import websockets
import requests

REDIS_HOST = "redis"
REDIS_PORT = 6379

TASK_MANAGER_WS = "ws://task_manager:8004/ws/tasks"
USER_SERVICE = "http://user_service:8002"

async def run_test():
    # 1. Зарегистрировать пользователя
    email = f"test_{uuid.uuid4().hex[:6]}@test.com"
    password = "password123"

    r = requests.post(f"{USER_SERVICE}/auth/register", json={
        "email": email,
        "password": password,
        "username": email.split("@")[0]
    })
    assert r.status_code in (200, 201)

    # 2. Логин
    r = requests.post(f"{USER_SERVICE}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    token = r.json()["access_token"]

    # 3. Создать задачу в Task Manager
    r = requests.post(f"http://task_manager:8004/tasks", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    task_run_id = r.json()["task_run_id"]
    print("🆔 Task created:", task_run_id)
    condition = r.json().get("condition")

    # Определяем "правильный код" на основе step_id (если condition пришло)
    if condition:
        step_id = condition.get("step_id", 0)
        rules = {
            0: "read_csv load",
            1: "fit",
            2: "score accuracy"
        }
        correct_code = rules.get(step_id, "read_csv load")
    else:
        correct_code = "read_csv load"

    # 4. Подключение по WS
    async with websockets.connect(f"{TASK_MANAGER_WS}/{task_run_id}?token={token}") as ws:
        print("🔌 WS connected")

        # 5. Отправка правильного кода
        await ws.send(correct_code)
        print("📤 Sent correct code")

        # 6. Подключение к Redis для отслеживания нового шага
        rds = aioredis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

        async def listen_task_condition():
            pubsub = rds.pubsub()
            await pubsub.subscribe("task_condition")
            async for message in pubsub.listen():
                if message["type"] != "message":
                    continue
                payload = json.loads(message["data"])
                if payload["task_run_id"] == task_run_id:
                    print("✅ New step received:", payload)
                    break

        # Ждём новый шаг от Scaffolding
        await asyncio.wait_for(listen_task_condition(), timeout=5)

    await rds.close()

if __name__ == "__main__":
    asyncio.run(run_test())'''
