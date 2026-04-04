import httpx
import os

ATTEMPT_SERVICE_URL = os.getenv(
    "ATTEMPT_SERVICE_URL",
    "http://attempts_service:8009"
)

async def get_attempts(user_id: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{ATTEMPT_SERVICE_URL}/attempts/code/{user_id}",
            timeout=5
        )

    if r.status_code != 200:
        return []

    return r.json()

async def get_session_attempts(user_id: str, learning_session_id: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{ATTEMPT_SERVICE_URL}/attempts/code/{user_id}/{learning_session_id}",
            timeout=5
        )

    if r.status_code != 200:
        return []

    return r.json()