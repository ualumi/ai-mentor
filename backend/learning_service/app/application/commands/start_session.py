from app.domain.learning_session import LearningSession
from app.infrastructure.redis import redis_client
from app.infrastructure.event_bus import EventBus

SESSION_TTL = 60 * 60 * 24  # 24 часа

async def start_session(
    user_id: int,
    competency: str,
    methodology: str
):
    session = LearningSession(
        user_id=user_id,
        competency=competency,
        methodology=methodology
    )

    key = f"learning:session:{session.id}"

    await redis_client.hset(key, mapping=session.to_dict())
    await redis_client.expire(key, SESSION_TTL)

    await EventBus.publish(
        "learning.events",
        {
            "event": "session_created",
            "session_id": session.id,
            "user_id": user_id,
            "competency": competency,
            "methodology": methodology,
        }
    )

    return session
