


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
    TRAINING_BUFFER,
    USER_PROGRESS,
    USER_RECOMMENDATIONS
)
from app.adapters.analysis_adapter import extract_evidence
from app.domain.progress_aggregator import apply_evidence
from app.domain.recommender import build_recommendations
from app.domain.graph_builder import update_graph
from app.domain.reward import compute_reward
from app.domain.bandit_policy import update_action_value
from app.domain.bandit_policy import choose_action
from app.domain.cluster_builder import update_clusters
#from app.domain.embedding_propagation import propagate_embeddings
from app.domain.embedding_updater import update_embeddings
from app.domain.trainer import train_step
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
        attempt_id = payload.get('attempt_id')
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

        '''# -----------------------------
        # 3️⃣ обновляем прогресс
        # -----------------------------
        user_progress = USER_PROGRESS.setdefault(user_id, {})

        for ev in evidence_list:
            apply_evidence(user_progress, ev)
            # 2.5 update graph
            update_graph(user_id, evidence_list)
        action = choose_action(user_id)
        # -----------------------------
        # 4️⃣ пересчитываем рекомендации
        # -----------------------------
        #USER_RECOMMENDATIONS[user_id] = build_recommendations(user_progress)
        USER_RECOMMENDATIONS[user_id] = build_recommendations(user_id, user_progress)'''
        # -----------------------------
        # 3️⃣ обновляем прогресс
        # -----------------------------
        #user_progress = USER_PROGRESS.setdefault(user_id, {})
        user_progress = USER_PROGRESS.setdefault(
            user_id,
            {
                "skills": {},
                "clusters": {}
            }
        )
        for ev in evidence_list:
            apply_evidence(
                user_progress["skills"],
                ev
            )
        # -----------------------------
        # 3.1️⃣ обновляем граф
        # -----------------------------
        update_graph(evidence_list)
        update_clusters(user_progress)
        #propagate_embeddings()  
        update_embeddings(user_id, user_progress)

        # -----------------------------
        # 4️⃣ выбираем действие (ε-greedy)
        # -----------------------------
        #actions = list(user_progress.keys())  # компетенции как actions
        #action = choose_action(actions)
        actions = list(user_progress["skills"].keys())
        if not actions:
            continue
        action = choose_action(user_id, actions)

        # baseline до воздействия
        prev_ema = user_progress["skills"][action]["ema"]

        # -----------------------------
        # 4.1️⃣ (симуляция "эффекта действия")
        # -----------------------------
        # ВАЖНО: в реальной системе тут будет результат задания/ответа
        new_ema = user_progress["skills"][action]["ema"]

        # -----------------------------
        # 5️⃣ reward
        # -----------------------------
        reward = compute_reward(
            prev_ema=prev_ema,
            new_ema=new_ema,
            is_correct=score["is_correct"] if isinstance(score, dict) else score > 0.7,
            time_spent=1.0,
            attempts=user_progress["skills"][action]["attempts"],
            deficit_before=1.0 - prev_ema
        )

        knowledge_gain = new_ema - prev_ema

        TRAINING_BUFFER.append({
            "user_id": user_id,
            "skill": action,
            "gain": knowledge_gain,
            "reward": reward,
            "state": user_progress
        })
        if len(TRAINING_BUFFER) % 5 == 0:
            for sample in TRAINING_BUFFER[-5:]:
                train_step(sample)

        # -----------------------------
        # 6️⃣ обновляем bandit
        # -----------------------------
        update_action_value(action, reward)

        # -----------------------------
        # 7️⃣ рекомендации
        # -----------------------------
        #USER_RECOMMENDATIONS[user_id] = build_recommendations(user_progress)
        USER_RECOMMENDATIONS[user_id] = build_recommendations(user_id, user_progress)

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
                "score": score,
                "attempt_id":attempt_id
            })
        )

        print(f"📈 Progress updated for user {user_id}")

