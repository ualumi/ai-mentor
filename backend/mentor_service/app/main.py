# import os

from fastapi import FastAPI
import asyncio
from app.mentor_worker import mentor_worker
from app.core.redis_client import redis
# from app.core.model_client import load_model

app = FastAPI(title="Mentor AI Service")

# EAGER_LOAD_MODEL = os.getenv("MENTOR_EAGER_LOAD", "false").lower() == "true"

@app.on_event("startup")
async def startup_event():
    try:
        pong = await redis.ping()
        if pong:
            print("Redis подключен (mentor-service)")
        # if EAGER_LOAD_MODEL:
        #     await load_model()
        asyncio.create_task(mentor_worker())
    except Exception as e:
        print(f"Ошибка при запуске Mentor Worker: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    await redis.close()
    print("Redis соединение закрыто")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
