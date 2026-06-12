import json

from app.domain.learning_session import LearningSession
from app.infrastructure.redis import redis_client
from app.infrastructure.event_bus import EventBus
from app.infrastructure.attempt_client import get_attempts
from app.infrastructure.methodology_client import submit_to_methodology
from app.application.orchestrators.learning_orchestrator import generate_next_task
from app.application.orchestrators.task_payload_builder import build_adaptive_task_payload

SESSION_TTL = 60 * 60 * 24  # 24 часа

async def find_active_session(user_id: int, competency: str):
    # можно хранить индекс:
    key = _active_session_key(user_id, competency)
    session_id = await redis_client.get(key)
    if not session_id:
        return None

    session_key = f"learning:session:{session_id}"
    return await redis_client.hgetall(session_key)

    

async def start_session(
    user_id: int,
    competency: str,
    methodology="scaffolding",
):

    session = LearningSession(
        user_id=user_id,
        competency=competency,
        methodology=methodology,
    )

    existing = await find_active_session(user_id, competency)

    if existing:
        return {
            "session": existing,
            "is_existing": True
        }

    # сохранить сессию
    key = f"learning:session:{session.id}"
    await redis_client.hset(key, mapping=session.to_dict())

    # индекс пользователя
    user_sessions_key = f"learning:user_sessions:{user_id}"
    await redis_client.sadd(user_sessions_key, session.id)

    # получить попытки
    attempts = await get_attempts(session.id)

    failed_attempts = [
        a for a in attempts
        if a.get("is_correct") is False
    ]
    progress_raw = await redis_client.get(
        f"all_user_progress:{user_id}"
    )

    progress = (
        json.loads(progress_raw)
        if progress_raw
        else {}
    )
    progress_baseline = _progress_value(
        _find_skill_progress(progress, competency)
    )
    await redis_client.hset(
        key,
        "progress_baseline",
        progress_baseline,
    )
    print(progress, "in_start_session")
    task = await build_adaptive_task_payload(
        competency=competency,
        progress_raw=progress
    )
    print("task", task)

    # отправить событие методологии
    await submit_to_methodology(
        methodology=methodology,
        payload={
            "learning_session_id": session.id,
            "user_id": user_id,
            "attempts": failed_attempts,
            "competency": competency,
            "task": task  # можно передать последний таск, чтобы методология могла сгенерировать следующий с учетом неудачных попыток
        }
    )
    payload={
            "learning_session_id": session.id,
            "user_id": user_id,
            "attempts": failed_attempts,
            "task":task
        }
    print(payload)

    # 🔥 индекс активной сессии
    active_key = _active_session_key(user_id, competency)
    await redis_client.set(active_key, session.id)

    # сгенерировать первое задание
    #await generate_next_task(session.id)

    return  {
        "session": {
            **session.to_dict(),
            "progress_baseline": progress_baseline,
        },
        "is_existing": False
    }


def _active_session_key(user_id: int, competency: str) -> str:
    return f"learning:active:{user_id}:{_normalize_skill_name(competency)}"


def _normalize_skill_name(name) -> str:
    return str(name or "").strip().lower().replace("-", "_").replace("/", "_").replace(" ", "_")


def _find_skill_progress(progress: dict, competency: str | None) -> dict:
    skills = progress.get("skills", {}) if isinstance(progress, dict) else {}
    if not isinstance(skills, dict):
        return {}

    normalized_competency = _normalize_skill_name(competency)
    if normalized_competency and isinstance(skills.get(normalized_competency), dict):
        return skills[normalized_competency]

    for skill_name, skill_progress in skills.items():
        if (
            _normalize_skill_name(skill_name) == normalized_competency
            and isinstance(skill_progress, dict)
        ):
            return skill_progress

    return {}


def _progress_value(skill_progress: dict) -> float:
    for key in ("bkt_mastery", "mastery", "ema_mastery", "ema", "progress"):
        value = skill_progress.get(key)
        if isinstance(value, (int, float)):
            return _clamp_progress(value)
    return 0


def _clamp_progress(value: float) -> float:
    return max(0.0, min(float(value), 1.0))
