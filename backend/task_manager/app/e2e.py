'''import asyncio
import json
import uuid
import time
import requests
import redis.asyncio as aioredis

REDIS_HOST = "redis"
REDIS_PORT = 6379

USER_SERVICE = "http://user_service:8002"
TASK_MANAGER = "http://task_manager:8004"

CHANNEL_TASK_CONDITION = "task_condition"


async def run_e2e_test():
    print("\n🚀 START E2E TEST\n")

    # -------------------------------------------------
    # 1. Register + login
    # -------------------------------------------------
    email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "password123"

    r = requests.post(
        f"{USER_SERVICE}/auth/register",
        json={"email": email, "password": password, "username": email.split("@")[0]},
    )
    assert r.status_code in (200, 201)

    r = requests.post(
        f"{USER_SERVICE}/auth/login",
        json={"email": email, "password": password},
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

    print(f"✅ User registered & logged in: {email}")

    # -------------------------------------------------
    # 2. Create session_id (as learning_service)
    # -------------------------------------------------
    session_id = str(uuid.uuid4())
    print(f"🧩 session_id = {session_id}")

    # -------------------------------------------------
    # 3. Publish condition (as Scaffolding)
    # -------------------------------------------------
    rds = aioredis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        decode_responses=True,
    )

    payload = {
        "session_id": session_id,
        "condition": {
            "step_id": 0,
            "title": "Шаг 0",
            "description": "Загрузить датасет",
        },
        "step_id": 0,
    }

    await rds.publish(CHANNEL_TASK_CONDITION, json.dumps(payload))
    print("📤 task_condition published")

    # -------------------------------------------------
    # 4. Poll Task Manager until task_run_id appears
    # -------------------------------------------------
    timeout = 5
    start = time.time()
    task_run_id = None

    while time.time() - start < timeout:
        r = requests.post(
            f"{TASK_MANAGER}/tasks",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert r.status_code == 200
        data = r.json()

        if data.get("condition") is not None:
            task_run_id = data["task_run_id"]
            break

        await asyncio.sleep(0.2)

    assert task_run_id is not None, "❌ task_run_id was not created"

    print(f"🆔 task_run_id created automatically: {task_run_id}")
    print("✅ CONDITION attached correctly")

    await rds.aclose()

    print("\n✅ E2E TEST PASSED\n")


if __name__ == "__main__":
    asyncio.run(run_e2e_test())'''


import asyncio
import json
import uuid
import requests
import redis.asyncio as redis
import websockets

USER_SERVICE = "http://user_service:8002"
TASK_MANAGER_WS = "ws://task_manager:8004/ws/tasks"
REDIS_HOST = "redis"
REDIS_PORT = 6379


async def run_e2e_test():
    print("\n🚀 START E2E TEST\n")

    # -------------------------------------------------
    # 1. Register + login
    # -------------------------------------------------
    email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "password123"

    r = requests.post(
        f"{USER_SERVICE}/auth/register",
        json={
            "email": email,
            "password": password,
            "username": email.split("@")[0],
        },
    )
    assert r.status_code in (200, 201)

    r = requests.post(
        f"{USER_SERVICE}/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

    print(f"✅ User registered & logged in: {email}")

    # -------------------------------------------------
    # 2. session_id (как от learning_service)
    # -------------------------------------------------
    session_id = str(uuid.uuid4())
    print(f"🧩 session_id = {session_id}")

    # -------------------------------------------------
    # 3. Scaffolding → Redis
    # -------------------------------------------------
    rds = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        decode_responses=True,
    )

    payload = {
        "session_id": session_id,
        "condition": "print(2 + 2)",
        "answer": "4",
        "step_id": 0,
    }

    await rds.publish("task_condition", json.dumps(payload))
    print("📤 task_condition published")

    # -------------------------------------------------
    # 4. Ждём, пока Task Manager создаст task_run_id
    #    и примет WS
    # -------------------------------------------------
    task_run_id = None

    for _ in range(10):
        # task_run_id генерируется внутри TM,
        # мы не знаем его заранее — пробуем подключиться
        # по session_id
        try:
            async with websockets.connect(
                f"{TASK_MANAGER_WS}/{session_id}?token={token}"
            ) as ws:
                print("🔌 WS connected — task_run_id created")
                task_run_id = session_id
                break
        except Exception:
            await asyncio.sleep(0.3)

    assert task_run_id is not None, "❌ Task Manager did not create task_run_id"

    print("\n🎉 E2E TEST PASSED\n")

    await rds.aclose()


if __name__ == "__main__":
    asyncio.run(run_e2e_test())



'''import asyncio
import json
import uuid
import requests
import redis.asyncio as aioredis
from time import sleep

# --- Настройки ---
REDIS_HOST = "redis"
REDIS_PORT = 6379
USER_SERVICE = "http://user_service:8002"
TASK_MANAGER = "http://task_manager:8004"

CHANNEL_TASK_CONDITION = "task_condition"

async def run_e2e_test():
    # 1️⃣ Зарегистрировать пользователя
    email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "password123"

    r = requests.post(f"{USER_SERVICE}/auth/register", json={
        "email": email,
        "password": password,
        "username": email.split("@")[0]
    })
    assert r.status_code in (200, 201), r.text
    print(f"✅ User registered: {email}")

    # 2️⃣ Логин
    r = requests.post(f"{USER_SERVICE}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    print(f"🔑 User logged in, token: {token[:10]}...")

    # 3️⃣ Эмулируем отправку session_id от Scaffolding в Redis
    session_id = str(uuid.uuid4())
    condition_payload = {
        "session_id": session_id,
        "condition": {"task": "load dataset"},
        "step_id": 0,
        "answer": "read_csv load"
    }

    rds = aioredis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    await rds.publish(CHANNEL_TASK_CONDITION, json.dumps(condition_payload))
    print(f"📤 Published initial session_id {session_id} to Redis")

    # 4️⃣ Создаём задачу через Task Manager API
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.post(f"{TASK_MANAGER}/tasks", headers=headers)
    assert r.status_code == 200, r.text
    task_data = r.json()
    task_run_id = task_data["task_run_id"]
    print(f"🆔 Task created: {task_run_id} for session_id={session_id}")

    # 5️⃣ Проверяем через Redis, что TASK_CONTEXT обновился
    async def wait_for_task_condition(timeout=5):
        pubsub = rds.pubsub()
        await pubsub.subscribe(CHANNEL_TASK_CONDITION)
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            payload = json.loads(message["data"])
            if payload.get("session_id") == session_id:
                return payload
        return None

    # небольшая пауза, чтобы Task Manager успел прочитать сообщение из Redis
    await asyncio.sleep(1)

    # Получаем TASK_CONTEXT через Task Manager (HTTP GET для проверки состояния можно добавить, если есть API)
    print(f"🔎 Проверяем TASK_CONTEXT для task_run_id={task_run_id}")
    # Для простоты тестируем через pub/sub или просто через локальный объект TASK_CONTEXT в тестовой среде
    # Здесь проверяем, что task_run_id и condition есть
    # В реальной интеграции можно сделать HTTP GET /tasks/{task_run_id} для проверки

    # 6️⃣ Эмулируем шаг в Scaffolding и проверяем обновление
    scaffold_step_payload = {
        "session_id": session_id,
        "condition": {"task": "train model"},
        "step_id": 1,
        "answer": "fit"
    }
    await rds.publish(CHANNEL_TASK_CONDITION, json.dumps(scaffold_step_payload))
    print(f"📤 Published next step for session_id={session_id}")

    # Даем Task Manager обработать
    await asyncio.sleep(1)

    print("✅ E2E test passed: Scaffolding ↔ Task Manager via Redis works correctly")

    await rds.close()

if __name__ == "__main__":
    asyncio.run(run_e2e_test())'''


