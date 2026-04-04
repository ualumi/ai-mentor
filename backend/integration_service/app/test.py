import requests
import jwt
import time
import uuid
import asyncio
import redis
import json

# -------------------------------
# CONFIG
# -------------------------------
INTEGRATION_SERVICE = "http://localhost:8012/api/integration"
REDIS_URL = "redis://localhost:6379"

SSO_SECRET = "secret"
INTEGRATION_TOKEN = "secret"

TEST_EMAIL = f"test_{uuid.uuid4().hex[:6]}@example.com"


# -------------------------------
# 1️⃣ Генерация SSO токена
# -------------------------------
def generate_sso_token():
    payload = {
        "iss": "theory_platform",
        "aud": "practice_platform",
        "sub": "42",
        "email": TEST_EMAIL,
        "username": "test_user",
        "iat": int(time.time()),
        "exp": int(time.time()) + 300
    }

    token = jwt.encode(payload, SSO_SECRET, algorithm="HS256")
    return token


# -------------------------------
# 2️⃣ SSO LOGIN
# -------------------------------
def test_sso_login():
    token = generate_sso_token()

    r = requests.get(
        f"{INTEGRATION_SERVICE}/sso",
        params={"token": token}
    )

    assert r.status_code == 200, f"SSO failed: {r.text}"

    data = r.json()

    print("✅ SSO response:", data)

    assert "access_token" in data, "❌ No access_token returned"

    return data["access_token"], data["user"]


# -------------------------------
# 3️⃣ MOCK external progress API
# -------------------------------
'''def mock_external_progress():
    """
    ⚠️ ВАЖНО:
    Этот шаг нужен, если у тебя нет реального внешнего API.
    Ты должен либо:
    1. Поднять mock сервис
    2. Или временно в external_client захардкодить ответ
    """
    print("⚠️ Убедись, что внешний API замокан!")'''

def mock_external_progress():
    return [
        {
            "user": {
                "id": 42,
                "email": "user@example.com",
                "username": "student42"
            },
            "cases": [
                {
                    "case_id": 7,
                    "title": "Сумма двух чисел",
                    "description": "Даны два числа, выведите их сумму.",
                    "attempts_count": 2,
                    "submissions": [
                        {
                            "submission_id": 101,
                            "language": "python",
                            "code": "print(1+2)",
                            "verdict": "wrong_answer",
                        },
                        {
                            "submission_id": 102,
                            "language": "python",
                            "code": "print(2+2)",
                            "verdict": "accepted",
                        }
                    ]
                }
            ],
            "lectures": [],
            "quizzes": [],
            "exams": []
        }
    ]


# -------------------------------
# 4️⃣ Подписка на Redis события
# -------------------------------
async def listen_redis_event(expected_event="progress_imported", timeout=5):
    r = redis.Redis.from_url(REDIS_URL, decode_responses=True)
    pubsub = r.pubsub()
    pubsub.psubscribe("integration.events")

    start = time.time()

    while time.time() - start < timeout:
        message = pubsub.get_message()
        if message and message["type"] == "pmessage":
            data = json.loads(message["data"])
            print("📡 Redis event:", data)

            if data.get("event") == expected_event:
                return data

        await asyncio.sleep(0.1)

    raise AssertionError("❌ No integration event received")


# -------------------------------
# 5️⃣ IMPORT PROGRESS
# -------------------------------
def test_import_progress(access_token):
    r = requests.post(
        f"{INTEGRATION_SERVICE}/import-progress",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "email": TEST_EMAIL
        }
    )

    assert r.status_code == 200, f"Import failed: {r.text}"

    print("✅ Import response:", r.json())


# -------------------------------
# 🚀 MAIN E2E TEST
# -------------------------------
async def run_e2e_test():

    print("\n===== 🚀 START E2E TEST =====\n")

    # 1️⃣ SSO
    access_token, user = test_sso_login()

    # 2️⃣ mock
    mock_external_progress()

    # 3️⃣ import progress
    test_import_progress(access_token)

    # 4️⃣ проверка Redis
    event = await listen_redis_event()

    print("\n🎉 SUCCESS! Integration works correctly")
    print("Event:", event)


# -------------------------------
# RUN
# -------------------------------
if __name__ == "__main__":
    asyncio.run(run_e2e_test())