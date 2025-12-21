from fastapi import FastAPI
from app.api import mentor, tasks
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from app.redis_listener import start_redis_listener_on_startup, redis_listener
from app.core.redis_client import redis

app = FastAPI(title="WebSocket Mentor Gateway")

# Подключаем роутер
app.include_router(mentor.router)
app.include_router(tasks.router)

# Запуск Redis listener при старте приложения
start_redis_listener_on_startup(app)
print("🟢 redis_listener subscribed")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    while True:
        try:
            await redis.ping()
            print("✅ Redis подключен (task_manager)")
            break
        except Exception:
            print("⏳ Ждём Redis...")
            await asyncio.sleep(1)

    asyncio.create_task(redis_listener())


@app.on_event("shutdown")
async def shutdown_event():
    await redis.close()
    print("🧹 Redis соединение закрыто")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8004,
        reload=True,
    )
