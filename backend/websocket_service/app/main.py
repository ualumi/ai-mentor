from fastapi import FastAPI
from app.api import mentor
from app.redis_listener import start_redis_listener_on_startup
from app.core.redis_client import redis

app = FastAPI(title="WebSocket Mentor Gateway")

# Подключаем роутер
app.include_router(mentor.router)
start_redis_listener_on_startup(app)

@app.on_event("startup")
async def startup_event():
    try:
        pong = await redis.ping()
        if pong:
            print("✅ Redis подключен (websocket-service)")
    except Exception as e:
        print(f"❌ Ошибка подключения к Redis: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    await redis.close()
    print("🧹 Redis соединение закрыто")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)