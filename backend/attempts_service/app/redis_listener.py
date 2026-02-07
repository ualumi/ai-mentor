import json
from datetime import datetime
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import Attempt, Episode
from app.episode_logic import get_open_episode
from app.redis_client import redis

CHANNEL_ANALYSIS = "analysis_result"

async def redis_listener():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_ANALYSIS)
    print("🔄 Attempts Service listening to analysis_result")

    async for msg in pubsub.listen():
        if msg["type"] != "message":
            continue

        payload = json.loads(msg["data"])
        session_id = payload.get("session_id")
        analysis = payload.get("analysis")
        if not session_id or not analysis:
            continue

        attempt_time = datetime.utcnow()

        async with AsyncSessionLocal() as db:
            # ищем текущий открытый эпизод
            episode = await get_open_episode(db, session_id, attempt_time)

            # если нет открытого эпизода, создаём новый
            if not episode:
                episode = Episode(session_id=session_id, start_time=attempt_time)
                db.add(episode)
                await db.flush()

            # сохраняем попытку в эпизод
            attempt = Attempt(
                session_id=session_id,
                timestamp=attempt_time,
                mode=payload.get("mode", "free"),
                code_hash=payload.get("code_hash"),
                analysis=analysis,
                mentor_action=payload.get("mentor_action", {}),
                episode_id=episode.episode_id
            )

            db.add(attempt)
            await db.commit()
            print(f"📝 Attempt saved ({attempt.attempt_id}) in episode {episode.episode_id}")
