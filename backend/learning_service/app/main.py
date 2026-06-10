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
from app.api.sessions import router
from fastapi.middleware.cors import CORSMiddleware
#from app.infrastructure.subscriber import listen_scaffolding_events
from app.infrastructure.progress_subscriber import listen_progress_events
from app.infrastructure.task_stream_subscriber import listen_task_streams
from app.infrastructure.next_step_subscriber import (
    listen_next_step
)

app = FastAPI(title="Learning Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.on_event("startup")
async def startup():
    import asyncio
    
#    asyncio.create_task(listen_scaffolding_events())
    asyncio.create_task(listen_progress_events())
    asyncio.create_task(listen_task_streams()) 
    asyncio.create_task(listen_next_step())
