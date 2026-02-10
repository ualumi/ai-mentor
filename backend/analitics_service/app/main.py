from fastapi import FastAPI
import asyncio
from app.analitics_worker import mentor_worker
from app.core.redis_client import redis
from app.core.model_client import load_model

app = FastAPI(title="Analitics AI Service")

@app.on_event("startup")
async def startup_event():
    load_model()
    print("🔥 STARTUP WORKS")
    await redis.ping()
    asyncio.create_task(mentor_worker())


@app.on_event("shutdown")
async def shutdown_event():
    await redis.close()
    print("🧹 Redis соединение закрыто")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
