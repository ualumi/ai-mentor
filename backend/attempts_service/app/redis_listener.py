"""import json
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import Attempt
from app.redis_client import redis
from sqlalchemy.orm import aliased

CHANNEL_ANALYSIS = "analysis_result"
CHANNEL_MENTOR = "mentor_out"


async def redis_listener():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_ANALYSIS, CHANNEL_MENTOR)

    print("🔄 Attempts Service listening to analysis_result & mentor_out")

    async for msg in pubsub.listen():
        if msg["type"] != "message":
            continue

        try:
            payload = json.loads(msg["data"])
        except Exception:
            continue

        attempt_id = payload.get("attempt_id")
        if not attempt_id:
            continue  # ⬅️ ключевая защита

        '''async with AsyncSessionLocal() as db:
            res = await db.execute(
                select(Attempt).where(Attempt.attempt_id == attempt_id)
            )
            attempt = res.scalars().first()'''
        async with AsyncSessionLocal() as db:
            AttemptAlias = aliased(Attempt, name="a")
            res = await db.execute(
                select(AttemptAlias).where(AttemptAlias.attempt_id == attempt_id)
            )
            attempt = res.scalars().first()

            if not attempt:
                # attempt ещё не создан (race condition) — просто пропускаем
                continue

            # 🧠 Ответ ментора
            if msg["channel"] == CHANNEL_MENTOR:
                attempt.mentor_reply = payload.get("hint")
                attempt.user_id = payload.get("user_id")
            # 📊 Результат аналитики
            elif msg["channel"] == CHANNEL_ANALYSIS:
                analysis = payload.get("analysis", {})
                attempt.user_id = payload.get("user_id")
                # 1️⃣ сохраняем raw
                attempt.analysis = analysis

                # 2️⃣ извлекаем skill_scores
                skill_scores = {}

                tag_alignment = (
                    analysis
                    .get("task_compliance", {})
                    .get("tag_alignment", {})
                )

                for skill, data in tag_alignment.items():
                    skill_scores[skill] = data.get("score")

                attempt.skill_scores = skill_scores

                # 3️⃣ total_score
                attempt.total_score = analysis.get("code_quality_score")

                # 4️⃣ is_correct
                attempt.is_correct = (
                    analysis
                    .get("correctness", {})
                    .get("is_correct")
                )
                # при желании можно сохранить агрегированную компетенцию
                # attempt.dominant_competency = payload.get("dominant_competency")

            await db.commit()
            print(f"✏️ Attempt {attempt_id} updated from {msg['channel']}")"""

import json
from sqlalchemy import select
from sqlalchemy.orm import aliased
from app.database import AsyncSessionLocal
from app.models import Attempt
from app.redis_client import redis

CHANNEL_ANALYSIS_PATTERN = "analytics_response:*"
CHANNEL_MENTOR_PATTERN = "mentor_response:*"


async def redis_listener():
    pubsub = redis.pubsub()

    # 👇 подписка по паттерну
    await pubsub.psubscribe(
        CHANNEL_ANALYSIS_PATTERN,
        CHANNEL_MENTOR_PATTERN
    )

    print("🔄 Attempts Service listening to analytics_response:* & mentor_response:*")

    async for msg in pubsub.listen():

        # ⚠️ ВАЖНО: при psubscribe тип будет "pmessage"
        if msg["type"] != "pmessage":
            continue

        try:
            payload = json.loads(msg["data"])
        except Exception:
            continue

        attempt_id = payload.get("attempt_id")
        user_id = payload.get("user_id")

        if not attempt_id or not user_id:
            continue

        async with AsyncSessionLocal() as db:
            AttemptAlias = aliased(Attempt, name="a")

            res = await db.execute(
                select(AttemptAlias).where(
                    AttemptAlias.attempt_id == attempt_id
                )
            )
            attempt = res.scalars().first()

            if not attempt:
                continue  # race condition

            channel = msg["channel"].decode() if isinstance(msg["channel"], bytes) else msg["channel"]

            # ----------------------------
            # 🧠 Ответ ментора
            # ----------------------------
            if channel.startswith("mentor_out:"):

                attempt.mentor_reply = payload.get("hint")
                attempt.user_id = user_id

            # ----------------------------
            # 📊 Результат аналитики
            # ----------------------------
            elif channel.startswith("analysis_result:"):

                analysis = payload.get("analysis", {})
                attempt.user_id = user_id

                # 1️⃣ сохраняем raw JSON
                attempt.analysis = analysis

                # 2️⃣ skill_scores
                skill_scores = {}

                tag_alignment = (
                    analysis
                    .get("task_compliance", {})
                    .get("tag_alignment", {})
                )

                for skill, data in tag_alignment.items():
                    skill_scores[skill] = data.get("score")

                attempt.skill_scores = skill_scores

                # 3️⃣ total_score
                attempt.total_score = analysis.get("code_quality_score")

                # 4️⃣ is_correct
                attempt.is_correct = (
                    analysis
                    .get("correctness", {})
                    .get("is_correct")
                )

            await db.commit()

            print(f"✏️ Attempt {attempt_id} updated from {channel}")
