import httpx

USER_SERVICE_URL = "http://user_service:8002"

async def verify_token(token: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{USER_SERVICE_URL}/auth/verify-token",
            params={"token": token},
            timeout=5
        )

    if r.status_code != 200:
        raise Exception("Invalid token")

    return r.json()
