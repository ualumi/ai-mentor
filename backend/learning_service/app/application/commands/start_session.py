from app.domain.learning_session import LearningSession
from app.infrastructure.redis import redis_client
from app.infrastructure.event_bus import EventBus
from app.infrastructure.attempt_client import get_attempts
from app.infrastructure.methodology_client import submit_to_methodology

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
    methodology = "scaffolding"
):
    session = LearningSession(
        user_id=user_id,
        competency=competency,
        methodology=methodology
    )

    # 🔹 получаем все попытки
    attempts = await get_attempts(session.id)

    # 🔹 фильтруем неуспешные
    failed_attempts = [
        a for a in attempts
        if a.get("is_correct") is False
    ]

    '''await submit_to_methodology(
        methodology,
        {
            "learning_session_id": session.id,
            "user_id": user_id,
            "competency": competency,
            "failed_attempts": failed_attempts
        }
    )'''

    await submit_to_methodology(
        methodology="scaffolding",
        payload={
            "learning_session_id": session.id,
            "user_id": user_id,
        }
    )

    return session