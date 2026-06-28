import asyncio
import os

from fastapi import FastAPI

from app.core.model_client import load_model
from app.core.redis_client import redis
from app.mentor_worker import mentor_worker

app = FastAPI(title="Mentor AI Service")

EAGER_LOAD_MODEL = os.getenv("MENTOR_EAGER_LOAD", "false").lower() == "true"


@app.on_event("startup")
async def startup_event():
    try:
        pong = await redis.ping()
        if pong:
            print("Redis connected (mentor-service)")
    except Exception as exc:
        print(f"Redis startup error in mentor_service: {exc}")

    if EAGER_LOAD_MODEL:
        try:
            await load_model()
        except Exception as exc:
            print(f"Mentor model eager load failed, fallback answers enabled: {exc}")

    try:
        asyncio.create_task(mentor_worker())
    except Exception as exc:
        print(f"Mentor worker startup error: {exc}")


@app.on_event("shutdown")
async def shutdown_event():
    await redis.close()
    print("Redis connection closed")


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
