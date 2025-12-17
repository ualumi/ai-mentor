from fastapi import FastAPI
import asyncio
from app.worker import orchestrator_worker

app = FastAPI(title="Learning Orchestrator Service")

@app.on_event("startup")
async def startup():
    asyncio.create_task(orchestrator_worker())
    print("🚀 Learning Orchestrator запущен")

@app.get("/health")
async def health():
    return {"status": "ok"}
