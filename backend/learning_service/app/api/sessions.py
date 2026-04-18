from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.application.commands.start_session import start_session
from app.application.queries.get_session import get_session
from app.schemas.session import StartSessionRequest
from app.infrastructure.redis import redis_client
from app.application.queries.get_user_sessions import get_user_sessions
from app.infrastructure.attempt_client import get_session_attempts
import json
router = APIRouter(prefix="/learning", tags=["learning"])


@router.post("/start")
async def start_learning_session(
    data: StartSessionRequest,
    user=Depends(get_current_user)
):
    user_id = int(user["sub"])

    session = await start_session(
        user_id=user_id,
        competency=data.competency,
    )

    """return {
        "user_id": session.user_id,
        "session_id": session.id,
        "competency": session.competency,
        "methodology": session.methodology,
        "current_step": session.current_step
    }"""
    print(session)
    return session

@router.get("/session/{session_id}/state")
async def get_session_state(
    session_id: str,
    user=Depends(get_current_user)
):
    session = await get_session(session_id)

    if not session:
        raise HTTPException(404)

    # 🔹 попытки
    attempts = await get_session_attempts(session["user_id"], session_id)

    # 🔹 прогресс (можно хранить в redis или дергать progress_service)
    #progress = await redis_client.get(f"user_progress:{session['user_id']}")
    progress_raw = await redis_client.get(f"user_progress:{session['user_id']}")
    progress = json.loads(progress_raw) if progress_raw else {}

    print({
        "session": session,
        "attempts": attempts,
        "progress": progress.get('ema', {})
    })
    return {
        "session": session,
        "attempts": attempts,
        "progress": progress.get('ema', {}),
        "current_condition": json.loads(session.get("current_condition", "null")),
    }


@router.get("/session/{session_id}")
async def get_learning_session(
    session_id: str,
    user=Depends(get_current_user)  # защита эндпоинта
):
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/active")
async def get_active_session(
    user=Depends(get_current_user)
):
    user_id = int(user["sub"])

    key = f"learning:user_active:{user_id}"
    session_id = await redis_client.get(key)

    if not session_id:
        return None

    return await get_session(session_id)


'''@router.get("/my")
async def get_my_sessions(
    status: str | None = None,
    user=Depends(get_current_user)
):
    user_id = int(user["sub"])

    sessions = await get_user_sessions(user_id, status)

    return sessions'''

@router.get("/my")
async def get_my_sessions(
    status: str | None = None,
    user=Depends(get_current_user)
):
    user_id = int(user["sub"])

    sessions = await get_user_sessions(user_id, status)

    # 🔥 достаем progress
    progress_raw = await redis_client.get(f"user_progress:{user_id}")
    print("progress_raw", progress_raw)
    progress = json.loads(progress_raw) if progress_raw else {}
    print("progress", progress)
    enriched = []

    for s in sessions:
        competency = s.get("competency")

        enriched.append({
            **s,
            "progress": progress.get('ema', {})
        })

    return enriched