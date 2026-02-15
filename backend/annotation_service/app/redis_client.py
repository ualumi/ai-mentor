import redis.asyncio as redis
import os

# Берем параметры подключения из переменных окружения
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))

# Асинхронное подключение
redis = redis.from_url(
    f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}",
    encoding="utf-8",
    decode_responses=True
)