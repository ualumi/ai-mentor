'''import requests
import uuid

BASE = {
    "user": "http://user_service:8002",
    "learning": "http://learning_service:8001",
    "scaffolding": "http://scaffolding_service:8003",
}

# ---------- test data ----------
email = f"e2e_{uuid.uuid4().hex[:8]}@test.com"
password = "StrongPassword123"

print("TEST USER:", email)

# ---------- 1. REGISTER ----------
r = requests.post(
    f"{BASE['user']}/auth/register",
    json={
        "email": email,
        "password": password
    }
)

assert r.status_code in (200, 201), r.text
print("REGISTER OK")

# ---------- 2. LOGIN ----------
r = requests.post(
    f"{BASE['user']}/auth/login",
    json={
        "email": email,
        "password": password
    }
)

assert r.status_code == 200, r.text

token = r.json()["access_token"]
print("TOKEN RECEIVED")

headers = {
    "Authorization": f"Bearer {token}"
}

# ---------- 3. START LEARNING SESSION ----------
r = requests.post(
    f"{BASE['learning']}/learning/start",
    headers=headers,
    json={
        "competency": "ml_basic",
        "methodology": "scaffolding"
    }
)

assert r.status_code == 200, r.text

session = r.json()
session_id = session["session_id"]

print("SESSION STARTED:", session_id)

# ---------- 4. SUBMIT STEP ----------
r = requests.post(
    f"{BASE['scaffolding']}/methodology/submit",
    json={
        "session_id": session_id,
        "step_id": 1,
        "code": "model.fit(X, y)",
        "competency": "ml_basic"
    }
)

assert r.status_code == 200, r.text
print("STEP SUBMITTED:", r.json())

print("\nE2E TEST PASSED ✅")'''

import requests
import uuid
import time

# -----------------------
# Docker Compose service URLs
# -----------------------
BASE = {
    "user": "http://user_service:8002",
    "learning": "http://learning_service:8001",
    "scaffolding": "http://scaffolding_service:8000",
}

# ---------- test data ----------
username = f"e2e_{uuid.uuid4().hex[:6]}"
email = f"{username}@test.com"
password = "StrongPassword123"

print("TEST USER:", email, username)

# ---------- 0. WAIT FOR SERVICES ----------
'''def wait_for_service(url, timeout=15):
    for i in range(timeout):
        try:
            r = requests.get(f"{url}/health")
            if r.status_code == 200:
                print(f"{url} is up")
                return
        except requests.exceptions.RequestException:
            pass
        print(f"Waiting for {url}...")
        time.sleep(1)
    raise RuntimeError(f"Service {url} did not start in time")

for url in [BASE["user"], BASE["learning"], BASE["scaffolding"]]:
    wait_for_service(url)'''

# ---------- 1. REGISTER ----------
r = requests.post(
    f"{BASE['user']}/auth/register",
    json={
        "username": username,
        "email": email,
        "password": password
    }
)
assert r.status_code in (200, 201), r.text
print("REGISTER OK")

# ---------- 2. LOGIN ----------
r = requests.post(
    f"{BASE['user']}/auth/login",
    json={
        "email": email,
        "password": password
    }
)
assert r.status_code == 200, r.text

token = r.json()["access_token"]
print("TOKEN RECEIVED")

headers = {
    "Authorization": f"Bearer {token}"
}

# ---------- 3. START LEARNING SESSION ----------
r = requests.post(
    f"{BASE['learning']}/learning/start",
    headers=headers,
    json={
        "competency": "ml_basic",
        "methodology": "scaffolding"
    }
)
assert r.status_code == 200, r.text

session = r.json()
session_id = session["session_id"]
print("SESSION STARTED:", session_id)

# ---------- 4. SUBMIT STEP ----------
r = requests.post(
    f"{BASE['scaffolding']}/methodology/submit",
    json={
        "session_id": session_id,
        "step_id": 1,
        "code": "print(1/0)",
        "competency": "ml_basic"
    }
)
assert r.status_code == 200, r.text
print("STEP SUBMITTED:", r.json())

print("\nE2E TEST PASSED ✅")

