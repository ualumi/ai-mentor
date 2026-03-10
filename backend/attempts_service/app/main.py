import asyncio
from fastapi import FastAPI, Depends
from sqlalchemy import select
from app.redis_listener import redis_listener
from app.database import get_session
from app.models import Attempt, Episode
from sqlalchemy.orm import aliased
from fastapi.middleware.cors import CORSMiddleware
AttemptAlias = aliased(Attempt, name="a")
app = FastAPI(title="Attempts Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

@app.on_event("startup")
async def startup():
    asyncio.create_task(redis_listener())
    print("✅ Attempts Service started")

from fastapi import HTTPException, Depends
import jwt

SECRET_KEY = "supersecret"
ALGORITHM = "HS256"


@app.get("/attempts/{token}/history")
async def get_attempts_history(token: str, db=Depends(get_session)):

    # Декодируем токен
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        #user_id = str(payload["user_id"])
        user_id = str(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Берем все попытки пользователя
    # Берем только попытки без learning_session_id
    res = await db.execute(
        select(AttemptAlias)
        .where(AttemptAlias.user_id == user_id)
        .where(AttemptAlias.learning_session_id.is_(None))  # <-- фильтр на NULL
    )
    attempts = res.scalars().all()

    # Формируем сокращенный результат: только первая строка кода
    history = []
    for att in attempts:
        first_line = att.code_hash.splitlines()[0] if att.code_hash else ""
        history.append({
            "attempt_id": str(att.attempt_id),
            "first_line": first_line,
            "timestamp": att.timestamp
        })

    return history

@app.get("/attempt/{attempt_id}")
async def get_attempt_detail(attempt_id: str, db=Depends(get_session)):
    res = await db.execute(
        select(AttemptAlias).where(AttemptAlias.attempt_id == attempt_id)
    )
    attempt = res.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return {
        "attempt_id": str(attempt.attempt_id),
        "user_id": str(attempt.user_id),
        "code": attempt.code_hash,
        "mentor_reply": attempt.mentor_reply,
        "analysis": attempt.analysis,
        "skill_scores": attempt.skill_scores,
        "total_score": attempt.total_score,
        "is_correct": attempt.is_correct,
        "timestamp": attempt.timestamp,
        "learning_session_id": attempt.learning_session_id,
        "mode": attempt.mode,
    }

@app.get("/attempts/{user_id}")
async def get_attempts(user_id: str, db=Depends(get_session)):
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