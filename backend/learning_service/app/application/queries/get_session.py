from app.infrastructure.redis import redis_client

async def get_session(session_id: str):
    key = f"learning:session:{session_id}"
    data = await redis_client.hgetall(key)
    return data if data else None
