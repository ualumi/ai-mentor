import json
import redis


class EventPublisher:

    def __init__(self, redis_url: str):
        self.client = redis.Redis.from_url(redis_url)

    def publish(self, channel: str, payload: dict):
        self.client.publish(channel, json.dumps(payload))