import asyncio
from fastapi import FastAPI, Depends
from sqlalchemy import select
from app.redis_listener import redis_listener
from app.database import get_session
from app.models import Attempt, Episode

app = FastAPI(title="Attempts Service")

@app.on_event("startup")
async def startup():
    asyncio.create_task(redis_listener())
    print("✅ Attempts Service started")

@app.get("/attempts/{session_id}")
async def get_attempts(session_id: str, db=Depends(get_session)):
    res = await db.execute(
        select(Attempt).where(Attempt.session_id == session_id)
    )
    return res.scalars().all()

@app.get("/episodes/{session_id}")
async def get_episodes(session_id: str, db=Depends(get_session)):
    res = await db.execute(
        select(Episode).where(Episode.session_id == session_id)
    )
    return res.scalars().all()
