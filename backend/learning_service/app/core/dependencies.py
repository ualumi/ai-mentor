from fastapi import Header, HTTPException
from app.core.security import verify_access_token

def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = authorization.replace("Bearer ", "")
    payload = verify_access_token(token)
    print(f"access token {token}")
    return payload