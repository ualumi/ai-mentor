from fastapi import FastAPI
from app.api import execute
import asyncio
from app.core.redis_worker import sandbox_worker  # создадим отдельный файл

app = FastAPI(title="Sandbox Service")

app.include_router(execute.router, prefix="/sandbox", tags=["sandbox"])

@app.get("/health")
async def health():
    return {"status": "ok"}

# 🔹 Запуск Redis worker при старте FastAPI
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(sandbox_worker())
    print("✅ Sandbox worker запущен")
