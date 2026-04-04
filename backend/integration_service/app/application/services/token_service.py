import jwt
import time
import os

SECRET = os.getenv("SECRET_KEY", "secret")
ALGORITHM = "HS256"

def create_internal_token(payload: dict):

    data = payload.copy()
    data.update({
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600
    })

    return jwt.encode(data, SECRET, algorithm=ALGORITHM)