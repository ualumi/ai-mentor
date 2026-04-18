


'''import json
from app.redis_client import redis
from app.state import (
    RAW_ANALYSIS,
    EVIDENCE_STORE,
    USER_PROGRESS,
    USER_RECOMMENDATIONS
)
from app.adapters.analysis_adapter import extract_evidence
from app.domain.progress_aggregator import apply_evidence
from app.domain.recommender import build_recommendations

CHANNEL_ANALYSIS = "analysis_result"

async def redis_listener():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_ANALYSIS)
    print("🔄 Progress Service listening to analysis_result...")

    async for msg in pubsub.listen():
        if msg["type"] != "message":
            print(msg)
            continue

        payload = json.loads(msg["data"])
        user_id = payload.get("user_id")
        raw_analysis = payload.get("analysis")

        if not user_id or not raw_analysis:
            continue

        # 1️⃣ сохраняем raw
        RAW_ANALYSIS.setdefault(user_id, []).append(raw_analysis)

        # 2️⃣ извлекаем evidence
        evidence_list = extract_evidence(raw_analysis)
        EVIDENCE_STORE.setdefault(user_id, []).extend(evidence_list)

        # 3️⃣ обновляем прогресс
        user_progress = USER_PROGRESS.setdefault(user_id, {})
        for ev in evidence_list:
            apply_evidence(user_progress, ev)

        # 4️⃣ пересчитываем рекомендации
        USER_RECOMMENDATIONS[user_id] = build_recommendations(user_progress)

        # 5️⃣ публикуем наружу
        await redis.publish(
            f"user_progress:{user_id}",
            json.dumps({
                "progress": user_progress,
                "recommendations": USER_RECOMMENDATIONS[user_id]
            })
        )'''

import json
from app.redis_client import redis
from app.state import (
    RAW_ANALYSIS,
    EVIDENCE_STORE,
    USER_PROGRESS,
    USER_RECOMMENDATIONS
)
from app.adapters.analysis_adapter import extract_evidence
from app.domain.progress_aggregator import apply_evidence
from app.domain.recommender import build_recommendations

CHANNEL_ANALYSIS_PATTERN = "analytics_response:*"


async def redis_listener(pubsub):
    '''pubsub = redis.pubsub()

    # 👇 подписка по паттерну
    await pubsub.psubscribe(CHANNEL_ANALYSIS_PATTERN)

    print("🔄 Progress Service listening to analytics_response:* ...")'''

    async for msg in pubsub.listen():

        # ⚠️ при psubscribe тип будет "pmessage"
        if msg["type"] != "pmessage":
            continue

        try:
            payload = json.loads(msg["data"])
            print(payload)
        except Exception:
            print("EXCEPTION WORKED")
            continue
        learning_session_id = payload.get("learning_session_id")
        user_id = payload.get("user_id")
        raw_analysis = payload.get("analysis")
        score = payload.get('analysis', {}).get('correctness')
        if not user_id or not raw_analysis:
            print("не то")
            continue



        # -----------------------------
        # 1️⃣ сохраняем raw
        # -----------------------------
        RAW_ANALYSIS.setdefault(user_id, []).append(raw_analysis)
        print("DONE")
        # -----------------------------
        # 2️⃣ извлекаем evidence
        # -----------------------------

        evidence_list = extract_evidence(raw_analysis)
        print("evidence_list", evidence_list)
        EVIDENCE_STORE.setdefault(user_id, []).extend(evidence_list)

        # -----------------------------
        # 3️⃣ обновляем прогресс
        # -----------------------------
        user_progress = USER_PROGRESS.setdefault(user_id, {})

        for ev in evidence_list:
            apply_evidence(user_progress, ev)

        # -----------------------------
        # 4️⃣ пересчитываем рекомендации
        # -----------------------------
        USER_RECOMMENDATIONS[user_id] = build_recommendations(user_progress)

        # -----------------------------
        # 5️⃣ публикуем наружу
        # -----------------------------
        await redis.publish(
            f"user_progress:{user_id}",
            json.dumps({
                "user_id": user_id,
                "learning_session_id": learning_session_id,
                "progress": user_progress,
                "recommendations": USER_RECOMMENDATIONS[user_id],
                "score": score
            })
        )

        print(f"📈 Progress updated for user {user_id}")

