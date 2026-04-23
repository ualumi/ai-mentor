'''from fastapi import FastAPI
from app.api.scaffolding import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Scaffolding Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok"}


import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8003)'''

import asyncio
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
            backupCount=3,
        ),
        logging.StreamHandler(),
    ],
)

from fastapi import FastAPI
from app.application.redis_listener import redis_listener

logger = logging.getLogger(__name__)

app = FastAPI(title="Scaffolding Service")
#app.include_router(router)


@app.on_event("startup")
async def startup():
    logger.info("Starting Scaffolding Service")
    asyncio.create_task(redis_listener())



@app.get("/health")
async def health():
    return {"status": "ok"}

