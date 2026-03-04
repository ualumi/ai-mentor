from jose import jwt, JWTError
from fastapi import HTTPException
import os

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


def verify_access_token(token: str) -> dict:
    print(token)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

'''async def verify_token(token: str) -> dict:
    return verify_access_token(token)'''