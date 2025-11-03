from fastapi import FastAPI
from app.api import mentor
import asyncio
from app.core.redis_client import redis

app = FastAPI(title="WebSocket Mentor Service")

# Подключаем роутер
app.include_router(mentor.router)
mentor.start_redis_listener_on_startup(app)

# Стартап: проверка Redis
@app.on_event("startup")
async def startup_event():
    try:
        pong = await redis.ping()
        if pong:
            print("✅ Redis подключен")
    except Exception as e:
        print(f"❌ Ошибка подключения к Redis: {e}")

# Шатдаун: закрытие Redis
@app.on_event("shutdown")
async def shutdown_event():
    await redis.close()
    print("🧹 Redis соединение закрыто")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)