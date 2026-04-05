from fastapi import Header, HTTPException
import jwt
import os

SECRET = os.getenv("SECRET_KEY", "supersecret")

def get_current_user(authorization: str = Header(...)):
    print(authorization)
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401)

    token = authorization.replace("Bearer ", "")

    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        print(f"{payload}")
        return payload
    except:
        raise HTTPException(status_code=401)