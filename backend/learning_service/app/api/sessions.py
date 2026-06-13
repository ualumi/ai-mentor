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


def _normalize_skill_name(name: str | None) -> str:
    return str(name or "").strip().lower().replace("-", "_").replace("/", "_").replace(" ", "_")


def _find_skill_progress(progress: dict, competency: str | None) -> dict:
    skills = progress.get("skills", {}) if isinstance(progress, dict) else {}
    if not isinstance(skills, dict):
        return {}

    normalized_competency = _normalize_skill_name(competency)
    if normalized_competency and isinstance(skills.get(normalized_competency), dict):
        return skills[normalized_competency]

    for skill_name, skill_progress in skills.items():
        if _normalize_skill_name(skill_name) == normalized_competency and isinstance(skill_progress, dict):
            return skill_progress

    return {}


def _progress_value(skill_progress: dict) -> float:
    for key in ("bkt_mastery", "mastery", "ema_mastery", "ema", "progress"):
        value = skill_progress.get(key)
        if isinstance(value, (int, float)):
            return _clamp_progress(value)
    return 0


FALLBACK_PROGRESS_PER_ATTEMPT = 0.03
FALLBACK_PROGRESS_LIMIT = 0.15


def _module_progress_value(
    current_progress: float,
    baseline_progress,
    attempts_count: int = 0,
    skill_found: bool = True,
) -> float:
    baseline = _coerce_progress(baseline_progress)
    current = _clamp_progress(current_progress)
    fallback_progress = _attempt_fallback_progress(attempts_count)

    if not skill_found or current <= baseline:
        return fallback_progress

    remaining = 1 - baseline
    if remaining <= 0:
        return fallback_progress

    return _clamp_progress((current - baseline) / remaining)


def _attempt_fallback_progress(attempts_count: int) -> float:
    try:
        attempts_count = int(attempts_count)
    except (TypeError, ValueError):
        attempts_count = 0

    if attempts_count <= 0:
        return 0

    return _clamp_progress(
        min(attempts_count * FALLBACK_PROGRESS_PER_ATTEMPT, FALLBACK_PROGRESS_LIMIT)
    )


def _coerce_progress(value) -> float:
    try:
        return _clamp_progress(float(value))
    except (TypeError, ValueError):
        return 0


def _clamp_progress(value: float) -> float:
    return max(0.0, min(float(value), 1.0))


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
    progress_raw = await redis_client.get(f"all_user_progress:{session['user_id']}")
    progress = json.loads(progress_raw) if progress_raw else {}
    skill_progress = _find_skill_progress(progress, session.get("competency"))
    current_progress = _progress_value(skill_progress)
    progress_baseline = session.get("progress_baseline", 0)

    print({
        #"session": session,
        #"attempts": attempts,
        "progress": skill_progress
    })
    return {
        "session": session,
        "attempts": attempts,
        "progress": _module_progress_value(
            current_progress,
            progress_baseline,
            attempts_count=len(attempts),
            skill_found=bool(skill_progress),
        ),
        "progress_baseline": _coerce_progress(progress_baseline),
        "competency_progress": current_progress,
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
    #progress_raw = await redis_client.get(f"user_progress:{user_id}")
    #print("progress_raw", progress_raw)
    #progress = json.loads(progress_raw) if progress_raw else {}
    #print("progress", progress)
    enriched = []

    for s in sessions:
        competency = s.get("competency")
        attempts = await get_session_attempts(s["user_id"], s["session_id"])
        progress_raw = await redis_client.get(f"all_user_progress:{s['user_id']}")
        print('progress_raw', progress_raw)
        progress = json.loads(progress_raw) if progress_raw else {}
        skill_progress = _find_skill_progress(progress, competency)
        current_progress = _progress_value(skill_progress)
        progress_baseline = s.get("progress_baseline", 0)
        print(skill_progress)
        enriched.append({
            **s,
            #"progress": progress_raw.get('ema', {})
            "progress": _module_progress_value(
                current_progress,
                progress_baseline,
                attempts_count=len(attempts),
                skill_found=bool(skill_progress),
            ),
            "progress_baseline": _coerce_progress(progress_baseline),
            "competency_progress": current_progress,
            "attempts_count": len(attempts),
        })

    return enriched
