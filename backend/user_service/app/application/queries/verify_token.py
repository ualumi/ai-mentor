from app.core.security import verify_access_token

async def verify_token_query(token: str):
    return verify_access_token(token)
