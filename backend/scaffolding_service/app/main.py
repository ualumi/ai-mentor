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
from fastapi import FastAPI
#from app.api.scaffolding import router
from app.application.redis_listener import redis_listener, CHANNEL_TASK_CONDITION
import json
from app.infrastructure.redis import redis_client

app = FastAPI(title="Scaffolding Service")
#app.include_router(router)


@app.on_event("startup")
async def startup():
    asyncio.create_task(redis_listener())



@app.get("/health")
async def health():
    return {"status": "ok"}

