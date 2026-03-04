import logging
from logging.handlers import RotatingFileHandler
import os

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        RotatingFileHandler(
            "logs/app.log",
            maxBytes=5_000_000,
            backupCount=3
        ),
        logging.StreamHandler()
    ],
)
from fastapi import FastAPI
import asyncio
from app.listener import AnalysisListener
from app.redis_client import redis

app = FastAPI()

listener = AnalysisListener()


@app.on_event("startup")
async def startup_event():
    print("🔥 STARTUP WORKS")
    await redis.ping()
    print("🔥 ping WORKS")
    asyncio.create_task(listener.start())


@app.get("/health")
def health():
    return {"status": "ok"}