

'''from app.infrastructure.redis import redis_client
import json

CHANNEL_SESSION_CREATED = "learning.events"

async def submit_to_methodology(
    methodology: str,
    payload: dict
):
    """
    Публикует событие о создании сессии в Redis,
    чтобы методология (например scaffolding_service)
    могла его обработать.
    """

    event_payload = {
        "event": "session_created",
        "methodology": methodology,
        "learning_session_id": payload["learning_session_id"],
        # если user_id отдельный — можно передать отдельно
        "user_id": payload.get("user_id")
    }

    await redis_client.publish(
        CHANNEL_SESSION_CREATED,
        json.dumps(event_payload)
    )

    return {"status": "published"}'''


from app.infrastructure.redis import redis_client
import json

CHANNEL_METHODLOGY_EVENTS = "learning.events"


async def submit_to_methodology(methodology: str, payload: dict):
    event_payload = {
        "event": "session_created",
        "methodology": methodology,
        "learning_session_id": payload["learning_session_id"],
        "user_id": payload["user_id"],
        "competency": payload["competency"],
        "attempts": payload.get("attempts", [])
    }

    await redis_client.publish(
        CHANNEL_METHODLOGY_EVENTS,
        json.dumps(event_payload)
    )

    return {"status": "published"}

async def request_task_generation(
    methodology: str,
    payload: dict
):

    event_payload = {
        "event": "generate_task",
        "methodology": methodology,
        "learning_session_id": payload["learning_session_id"],
        "user_id": payload["user_id"],
        "competency": payload["competency"],
        "attempts": payload.get("attempts", [])
    }

    await redis_client.publish(
        CHANNEL_METHODLOGY_EVENTS,
        json.dumps(event_payload)
    )

    return {"status": "task_requested"}
