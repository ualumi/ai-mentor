"""import asyncio
import json
from app.redis_client import redis
from app.state import USER_PROGRESS

CHANNEL_ANALYSIS = "analysis_result"

async def redis_listener():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHANNEL_ANALYSIS)
    print("🔄 Progress Service listening to analysis_result...")

    async for msg in pubsub.listen():
        print("📩", msg)
        print("📩 RAW MESSAGE FROM REDIS:")
        if msg["type"] != "message":
            continue

        

        payload = json.loads(msg["data"])
        session_id = payload.get("session_id")
        analysis = payload.get("analysis", {})

        if not session_id or not analysis:
            continue

        user_progress = USER_PROGRESS.setdefault(session_id, {})

        '''for comp, value in analysis.get("competencies", {}).items():
            comp_state = user_progress.get(comp, {"evidence_count": 0, "avg_confidence": 0.0})
            n = comp_state["evidence_count"]
            avg = comp_state["avg_confidence"]
            comp_state["evidence_count"] = n + 1
            comp_state["avg_confidence"] = (avg * n + value) / (n + 1)
            comp_state["trend"] = value - avg
            user_progress[comp] = comp_state

        USER_PROGRESS[session_id] = user_progress'''

        # Публикуем прогресс в Redis для фронтенда
        await redis.publish(f"user_progress:{session_id}", json.dumps(user_progress))"""


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
        )

