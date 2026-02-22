# app/redis_client.py
'''import redis.asyncio as redis

redis = redis.Redis(
    host="redis",
    port=6379,
    decode_responses=True
)'''

from redis.asyncio import Redis

redis = Redis(
    host="redis",
    port=6379,
    decode_responses=True
)

# отдельный клиент для pub/sub
redis_sub = Redis(
    host="redis",
    port=6379,
    decode_responses=True
)