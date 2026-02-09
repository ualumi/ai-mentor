import asyncio
from fastapi import FastAPI, Depends
from sqlalchemy import select
from app.redis_listener import redis_listener
from app.database import get_session
from app.models import Attempt, Episode
from sqlalchemy.orm import aliased
AttemptAlias = aliased(Attempt, name="a")
app = FastAPI(title="Attempts Service")

@app.on_event("startup")
async def startup():
    asyncio.create_task(redis_listener())
    print("✅ Attempts Service started")

@app.get("/attempts/{session_id}")
async def get_attempts(session_id: str, db=Depends(get_session)):
    '''res = await db.execute(
        select(Attempt).where(Attempt.session_id == session_id)
    )
    return res.scalars().all()'''
    res = await db.execute(
    select(AttemptAlias).where(AttemptAlias.session_id == session_id)
    )
    return res.scalars().all()

'''@app.get("/episodes/{session_id}")
async def get_episodes(session_id: str, db=Depends(get_session)):
    res = await db.execute(
        select(Episode).where(Episode.session_id == session_id)
    )
    return res.scalars().all()
    

@app.get("/attempt/{attempt_id}")
async def get_attempt(attempt_id: str, db=Depends(get_session)):
    res = await db.execute(
        select(Attempt).where(Attempt.attempt_id == attempt_id)
    )
    return res.scalars().first()
'''