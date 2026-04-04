from app.domain.learning_session import LearningSession
from app.infrastructure.redis import redis_client
from app.infrastructure.event_bus import EventBus
from app.infrastructure.attempt_client import get_attempts
from app.infrastructure.methodology_client import submit_to_methodology
from app.application.orchestrators.learning_orchestrator import generate_next_task

SESSION_TTL = 60 * 60 * 24  # 24 часа

async def find_active_session(user_id: int, competency: str):
    # можно хранить индекс:
    key = f"learning:active:{user_id}:{competency}"
    session_id = await redis_client.get(key)
    if not session_id:
        return None

    session_key = f"learning:session:{session_id}"
    return await redis_client.hgetall(session_key)

    

async def start_session(
    user_id: int,
    competency: str,
    methodology="scaffolding"
):
    session = LearningSession(
        user_id=user_id,
        competency=competency,
        methodology=methodology
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

    # отправить событие методологии
    await submit_to_methodology(
        methodology=methodology,
        payload={
            "learning_session_id": session.id,
            "user_id": user_id,
            "attempts": failed_attempts,
            "competency": competency
        }
    )
    payload={
            "learning_session_id": session.id,
            "user_id": user_id,
            "attempts": failed_attempts
        }
    print(payload)

    # 🔥 индекс активной сессии
    active_key = f"learning:active:{user_id}:{competency}"
    await redis_client.set(active_key, session.id)

    # сгенерировать первое задание
    #await generate_next_task(session.id)

    return  {
        "session": session.to_dict(),
        "is_existing": False
    }