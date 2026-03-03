from app.infrastructure.redis import redis_client

async def get_user_sessions(user_id: int, status: str | None = None):
    user_sessions_key = f"learning:user_sessions:{user_id}"
    session_ids = await redis_client.smembers(user_sessions_key)

    sessions = []

    for session_id in session_ids:
        key = f"learning:session:{session_id}"
        data = await redis_client.hgetall(key)

        if not data:
            continue

        if status and data.get("status") != status:
            continue

        sessions.append(data)

    return sessions