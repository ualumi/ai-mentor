import asyncio
import websockets
import redis.asyncio as redis
import json
REDIS_HOST = "redis"
REDIS_PORT = 6379
REDIS_DB = 0
REDIS = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
#redis_client = Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
SESSION_ID = "test-e2e"

async def publish_condition():
    await REDIS.publish("task_condition", json.dumps({
        "session_id": SESSION_ID,
        "condition": {"task": "divide numbers"},
        "step_id": "1"
    }))

async def fake_backend():
    await asyncio.sleep(0.5)

    await REDIS.publish("mentor_out", json.dumps({
        "session_id": SESSION_ID,
        "hint": "Use / operator"
    }))

    await REDIS.publish("code_results", json.dumps({
        "session_id": SESSION_ID,
        "result": "2.0"
    }))

async def test():
    await publish_condition()

    uri = f"ws://localhost:8004/ws/tasks/{SESSION_ID}"
    async with websockets.connect(uri) as ws:
        # 1️⃣ condition
        condition = await ws.recv()
        print("📘", condition)

        # 2️⃣ send code
        await ws.send("print(4/2)")

        # 3️⃣ emulate mentor + sandbox
        asyncio.create_task(fake_backend())

        mentor = await ws.recv()
        sandbox = await ws.recv()

        print("🧠", mentor)
        print("🧪", sandbox)

asyncio.run(test())
