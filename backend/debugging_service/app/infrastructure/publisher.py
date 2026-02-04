import json
from app.infrastructure.redis import redis

CHANNEL_TASK_CONDITION = "task_condition"

async def publish_task_condition(session_id: str, condition: dict):
    payload = {
        "session_id": session_id,
        "condition": condition
    }
    print("publishing task")
    await redis.publish(CHANNEL_TASK_CONDITION, json.dumps(payload))


'''async def publish_task_condition(task_run_id: str, condition: dict):
    payload = {
        "task_run_id": task_run_id,
        "condition": condition,
    }
    await redis.publish(CHANNEL_TASK_CONDITION, json.dumps(payload))'''
