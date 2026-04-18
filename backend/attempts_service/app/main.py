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
    allow_origins=["*"],
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
        "mentor_reply": attempt.mentor_action,
        "analysis": attempt.analysis,
        "skill_scores": attempt.skill_scores,
        "total_score": attempt.total_score,
        "is_correct": attempt.is_correct,
        "timestamp": attempt.timestamp,
        "learning_session_id": attempt.learning_session_id,
        "mode": attempt.mode,
        "condition": attempt.condition,
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


@app.get("/attempts/code/{user_id}/{learning_session_id}")

async def get_session_attempts(user_id: str, learning_session_id: str, db=Depends(get_session)):
    
    learning_session_id_str = str(learning_session_id)
    print("learning_session_id_str", learning_session_id_str)

    result = await db.execute(
        select(
            Attempt.timestamp,
            Attempt.skill_scores,
            Attempt.total_score,
            Attempt.is_correct,
            Attempt.code_hash,
            Attempt.learning_session_id,
            Attempt.condition,
            Attempt.attempt_id
            
        )
        .where(Attempt.user_id == user_id)
        .where(Attempt.learning_session_id == learning_session_id_str)
        .order_by(Attempt.timestamp.asc())
    )

    rows = result.all()

    return [
        {
            "timestamp": r.timestamp,
            "skill_scores": r.skill_scores,
            "total_score": r.total_score,
            "is_correct": r.is_correct,
            "first_line": r.code_hash.splitlines()[0] if r.code_hash else "",
            
            "learning_session_id": str(r.learning_session_id) if r.learning_session_id else None,
            "condition": str(r.condition) if r.condition else None,
            "attempt_id": str(r.attempt_id)
        }
        for r in rows
    ]





from fastapi import Query
from datetime import datetime, timedelta
from sqlalchemy import func

@app.get("/attempts/activity")
async def get_user_activity(
    token: str = Query(...),
    days: int = 30,
    db=Depends(get_session)
):
    """
    Возвращает активность пользователя по дням (для heatmap)
    """

    # 🔐 Декодируем токен
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = str(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # 📅 дата начала
    since_date = datetime.utcnow() - timedelta(days=days)

    result = await db.execute(
        select(
            func.date(Attempt.timestamp).label("date"),
            func.count().label("count")
        )
        .where(Attempt.user_id == user_id)
        .where(Attempt.timestamp >= since_date)
        .group_by(func.date(Attempt.timestamp))
        .order_by(func.date(Attempt.timestamp))
    )

    rows = result.all()
    print(rows)
    # 📊 map: дата → количество
    activity_map = {
        str(r.date): r.count
        for r in rows
    }

    # 🔥 заполняем пропущенные дни
    full_data = []
    for i in range(days):
        day = (since_date + timedelta(days=i)).date()
        full_data.append({
            "date": str(day),
            "count": activity_map.get(str(day), 0)
        })
    print(full_data)
    return full_data

from sqlalchemy import func, distinct

'''@app.get("/attempts/total")
async def get_attempts_total(token: str, db=Depends(get_session)):

    # 🔐 Декодируем токен
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = str(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # 📊 1. Общее количество попыток
    #total_attempts_result = await db.execute(
    #    select(func.count()).where(Attempt.user_id == user_id)
    #)

    res = await db.execute(
    select(AttemptAlias).where(AttemptAlias.user_id == user_id)
    )
    total_attempts =  len(res.scalars().all())
    #total_attempts = total_attempts_result.scalar() or 0

    # 📊 2. Количество уникальных learning_session_id (исключаем NULL)
    total_sessions_result = await db.execute(
        select(func.count(distinct(Attempt.learning_session_id)))
        .where(Attempt.user_id == user_id)
        .where(Attempt.learning_session_id.isnot(None))
    )
    total_sessions = total_sessions_result.scalar() or 0
    print("total_attempts", total_attempts, "total_learning_sessions", total_sessions)
    return {
        "total_attempts": total_attempts,
        "total_learning_sessions": total_sessions
    }'''

from fastapi import Depends, HTTPException
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession
import jwt

@app.get("/attempts/total")
async def get_attempts_total(token: str, db: AsyncSession = Depends(get_session)):

    # 🔐 Декодируем токен
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = str(payload.get("sub")).strip()
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid user_id in token")

    # 🐞 DEBUG (можешь потом убрать)
    print("USER_ID FROM TOKEN:", user_id)

    # 📊 1. Общее количество попыток (БЫСТРО и правильно)
    total_attempts_result = await db.execute(
        select(func.count()).where(Attempt.user_id == user_id)
    )
    total_attempts = total_attempts_result.scalar() or 0

    # 📊 2. Количество уникальных learning_session_id
    total_sessions_result = await db.execute(
        select(func.count(distinct(Attempt.learning_session_id)))
        .where(Attempt.user_id == user_id)
        .where(Attempt.learning_session_id.isnot(None))
    )
    total_sessions = total_sessions_result.scalar() or 0

    # 🐞 ДОП. DEBUG (если вдруг снова будет 0)
    if total_attempts == 0:
        all_attempts_result = await db.execute(select(Attempt))
        all_attempts = all_attempts_result.scalars().all()

        print("ВСЕ ATTEMPTS В БД:", len(all_attempts))
        print("ПЕРВЫЕ USER_ID В БД:", [a.user_id for a in all_attempts[:5]])

    return {
        "total_attempts": total_attempts,
        "total_learning_sessions": total_sessions
    }