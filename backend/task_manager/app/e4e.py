import asyncio
import json
import uuid
import requests
import websockets
from redis.asyncio import Redis

# -------------------------------
# Настройки сервисов
# -------------------------------
USER_SERVICE = "http://user_service:8002"
LEARNING_SERVICE = "http://learning_service:8001"
TASK_MANAGER_WS = "ws://task_manager:8004/ws/tasks/{task_run_id}"

REDIS_HOST = "redis"
REDIS_PORT = 6379
REDIS_DB = 0
CHANNEL_TASK_CONDITION = "task_condition"

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
# 3️⃣ Инициализация Redis
# -------------------------------
redis_client = Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)



# -------------------------------
# 4️⃣ Ждём первое задание от Scaffolding
# -------------------------------

async def wait_for_task_condition(timeout=5):
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(CHANNEL_TASK_CONDITION)
    start = asyncio.get_event_loop().time()

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue
        payload = json.loads(message["data"])
        if payload.get("session_id") == session_id:
            await pubsub.unsubscribe(CHANNEL_TASK_CONDITION)
            await pubsub.aclose()
            print("📥 Получен первый task_condition")
            return payload
        if asyncio.get_event_loop().time() - start > timeout:
            await pubsub.unsubscribe(CHANNEL_TASK_CONDITION)
            await pubsub.aclose()
            raise TimeoutError("Первый task_condition не пришёл")




# -------------------------------
# 5️⃣ Получаем task_run_id от Task Manager
# -------------------------------
task_run_id = None

async def wait_for_task_run_id_via_ws():
    """Подключаемся к Task Manager по session_id и ждём создания task_run_id"""
    global task_run_id
    for _ in range(5):  # пробуем несколько раз с паузой
        try:
            async with websockets.connect(
                TASK_MANAGER_WS.format(task_run_id=session_id) + f"?token={token}"
            ) as ws:
                print(f"🔌 WS connected — task_run_id will be created automatically")
                task_run_id = session_id  # временно используем session_id
                return
        except Exception:
            await asyncio.sleep(0.3)
    raise Exception("❌ task_run_id was not created via WS")

# -------------------------------
# 6️⃣ Подключение по WebSocket и отправка кода
# -------------------------------
async def send_code_and_receive_feedback(code, ws_url, timeout=5):
    mentor_reply = None
    sandbox_reply = None

    async with websockets.connect(ws_url) as ws:
        # 1️⃣ Игнорируем текущее состояние задачи (initial task_condition)
        while True:
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=timeout)
            except asyncio.TimeoutError:
                break  # если WS не прислал initial task_condition — ок
            try:
                data = json.loads(msg)
                if data.get("event") == "task_condition":
                    print("📘 Initial task_condition ignored")
                    break
            except json.JSONDecodeError:
                break

        # 2️⃣ Отправляем код на выполнение
        await ws.send(code)
        print(f"📤 Code sent: {code}")

        # 3️⃣ Ждём новые события от ментора и песочницы
        async def wait_feedback():
            nonlocal mentor_reply, sandbox_reply
            while not (mentor_reply and sandbox_reply):
                msg = await ws.recv()

                # Игнорируем системные task_condition
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

        try:
            await asyncio.wait_for(wait_feedback(), timeout=timeout)
        except asyncio.TimeoutError:
            raise TimeoutError("Не пришёл ответ от ментора или песочницы")

        print("🧠 Mentor:", mentor_reply)
        print("🧪 Sandbox:", sandbox_reply)

        return {
            "mentor": mentor_reply,
            "sandbox": sandbox_reply
        }




# -------------------------------
# 7️⃣ Полный сценарий e2e
# -------------------------------
async def run_e2e_test():
    # просто подключаемся по WS
    await wait_for_task_run_id_via_ws()
    ws_url1 = TASK_MANAGER_WS.format(task_run_id=session_id) + f"?token={token}"
    feedback = await send_code_and_receive_feedback(
        code="print(4/2)", ws_url=ws_url1
    )

    print("🧠 Mentor:", feedback["mentor"])
    print("🧪 Sandbox:", feedback["sandbox"])

    assert feedback["mentor"] is not None
    assert feedback["sandbox"] is not None

    print("✅ E2E test passed")



# -------------------------------
# 8️⃣ Запуск
# -------------------------------
if __name__ == "__main__":
    asyncio.run(run_e2e_test())
