'''import redis.asyncio as redis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")

redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True
)'''

from redis.asyncio import Redis

redis_client = Redis(
    host="redis",
    port=6379,
    decode_responses=True
)
