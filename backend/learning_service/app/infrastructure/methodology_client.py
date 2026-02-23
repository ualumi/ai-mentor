'''import httpx
from app.infrastructure.methodology_registry import METHODOLOGIES

async def submit_to_methodology(
    methodology: str,
    payload: dict
):
    config = METHODOLOGIES.get(methodology)
    if not config:
        raise ValueError("Unknown methodology")

    async with httpx.AsyncClient() as client:
        r = await client.post(
            config["submit_url"],
            json=payload,
            timeout=10
        )

    return r.json()'''

from app.infrastructure.redis import redis_client
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

    return {"status": "published"}
