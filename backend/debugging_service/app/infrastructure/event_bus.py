import json
from app.infrastructure.redis import redis_client

class EventBus:
    @staticmethod
    async def publish(channel: str, payload: dict):
        await redis_client.publish(channel, json.dumps(payload))
