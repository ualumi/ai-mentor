import json
from app.infrastructure.redis import redis_client

CHANNEL_TASK_CONDITION = "task_condition"

async def publish_task_condition(user_id, learning_session_id: str, condition: dict):
    payload = {
        "user_id": user_id,
        "learning_session_id": learning_session_id,
        "condition": condition
    }
    print("publishing task")
    await redis_client.publish(CHANNEL_TASK_CONDITION, json.dumps(payload))


'''async def publish_task_condition(task_run_id: str, condition: dict):
    payload = {
        "task_run_id": task_run_id,
        "condition": condition,
    }
    await redis.publish(CHANNEL_TASK_CONDITION, json.dumps(payload))'''
