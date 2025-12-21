import httpx
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

    return r.json()
