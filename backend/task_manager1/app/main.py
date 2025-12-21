# app/main.py
import asyncio
from fastapi import FastAPI, WebSocket
from app.redis_listener import redis_listener
from app.ws import task_ws

app = FastAPI()


@app.on_event("startup")
async def startup():
    asyncio.create_task(redis_listener())
    print("✅ Task Manager started")


@app.websocket("/ws/tasks/{session_id}")
async def ws_endpoint(websocket: WebSocket, session_id: str):
    await task_ws(websocket, session_id)