import httpx
import os

BASE_URL = os.getenv("EXTERNAL_API_URL", "http://external_platform:8000")
TOKEN = os.getenv("INTEGRATION_TOKEN", "supersecret")

class ExternalClient:

    async def get_user_progress(self, user_id: str):

        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{BASE_URL}/api/kontest/integration/users/progress",
                params={"user_id": user_id},
                headers={
                    "Authorization": f"Bearer {TOKEN}"
                },
                timeout=10
            )

        if r.status_code != 200:
            return []

        return r.json()