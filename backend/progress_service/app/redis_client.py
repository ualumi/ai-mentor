import redis.asyncio as redis

redis = redis.Redis(
    host="redis",
    port=6379,
    decode_responses=True
)