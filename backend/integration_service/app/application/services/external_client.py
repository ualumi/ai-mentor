import httpx
import os

BASE_URL = os.getenv("EXTERNAL_API_URL", "http://194.67.66.35")
TOKEN = os.getenv("INTEGRATION_TOKEN", "integration-token-diplom")

class ExternalClient:
    
    async def get_user_progress(self, email: str):

        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{BASE_URL}/api/kontest/integration/users/progress",
                params={"email": email},
                headers={
                    "Authorization": f"Bearer {TOKEN}"
                },
                timeout=100
            )
        print(r)
        if r.status_code != 200:
            return []
        print(f"Received progress for user {email}: {r.text[:200]}")  # логируем первые 200 символов ответа
        return r.json()