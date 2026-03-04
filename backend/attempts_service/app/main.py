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

@app.get("/attempts/{user_id}")
async def get_attempts(user_id: str, db=Depends(get_session)):
    '''res = await db.execute(
        select(Attempt).where(Attempt.session_id == session_id)
    )
    return res.scalars().all()'''
    res = await db.execute(
    select(AttemptAlias).where(AttemptAlias.user_id == user_id)
    )
    return res.scalars().all()

@app.get("/attempts/code/{user_id}")
async def get_attempts(user_id: str, db=Depends(get_session)):
    result = await db.execute(
        select(
            Attempt.timestamp,
            Attempt.skill_scores,
            Attempt.total_score,
            Attempt.is_correct
        )
        .where(Attempt.user_id == user_id)
        .order_by(Attempt.timestamp.asc())
    )

    rows = result.all()

    return [
        {
            "timestamp": r.timestamp,
            "skill_scores": r.skill_scores,
            "total_score": r.total_score,
            "is_correct": r.is_correct
        }
        for r in rows
    ]
