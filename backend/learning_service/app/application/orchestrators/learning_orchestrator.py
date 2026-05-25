
import json

from app.application.queries.get_user_sessions import get_user_sessions
from app.infrastructure.methodology_client import request_task_generation
from app.infrastructure.attempt_client import get_attempts
from app.infrastructure.event_bus import EventBus
from app.infrastructure.redis import redis_client
from app.application.queries.get_session import get_session
from app.application.orchestrators.task_payload_builder import build_adaptive_task_payload

async def complete_session(session_id):

    key = f"learning:session:{session_id}"

    await redis_client.hset(
        key,
        mapping={
            "status": "completed"
        }
    )
    session = await redis_client.hgetall(key)
    user_id = session["user_id"]
    active_key = f"learning:active:{session['user_id']}:{session['competency']}"
    await redis_client.delete(active_key)

    await EventBus.publish(
        "scaffolding.next_step",
        {
            "event": "session_completed",
            "learning_session_id": session_id,
            "user_id": user_id,
        }
    )

async def generate_next_task(session, task):

    #attempts = await get_attempts(session["session_id"])
    print("next task_condition query sent")
    await request_task_generation(
        methodology=session["methodology"],
        payload={
            "learning_session_id": session["session_id"],
            "user_id": session["user_id"],
            "competency": session["competency"],
            "attempts": [],
            "task": task
        }
    )


async def handle_progress_event(event):

    user_id = event["user_id"]
    progress_raw = event["progress"]
    target_session_id = event.get("learning_session_id")  # 🔥
    print(target_session_id, "target_session_id in handle_progress_event")

    task_recommendations = event.get("task_recommendations", [])
    task_parameters = event.get("task_parameters")
    score = event.get("score", {})
    attempt_id = event.get("attempt_id")
    score = event.get("score", {})
    print(score, "score in handle_progress_event")

    if not target_session_id:
        return  # или fallback логика

    session = await get_session(target_session_id)
    print ('progress_sesson', session)
    if not session:
        return

    competency = session["competency"]
    task = await build_adaptive_task_payload(
        competency=competency,
        progress_raw=progress_raw if isinstance(progress_raw, dict) else {}
    )
    if progress_raw and isinstance(progress_raw, dict):
            print('PROGRESS_RAW', progress_raw)
            # Ищем ключ, соответствующий competency
            skills = progress_raw.get("skills", {})
            if competency in skills:
                progress = skills[competency]
                print('PROGRESS', progress)
                #ADAPTIVE TASK SELECTION
                '''module_recs = [
                    r for r in task_recommendations
                    if r["competency"] == competency
                ]
                if not module_recs:
                    return  # fallback
                rec = max(module_recs, key=lambda x: x["priority"])
                clusters = progress_raw.get("clusters", {}).get("membership", {})
                cluster_links = clusters.get(competency, [])
                topic_tags = {
                    competency: 0.5
                }

                total = sum(w for _, w in cluster_links) or 1.0

                for skill, w in cluster_links:
                    topic_tags[skill] = (w / total) * 0.5

                task = {
                    "difficulty": rec["difficulty"] if rec else "easy",
                    "topic_tags": topic_tags
                }'''
                progress_for_task = dict(progress_raw)
                progress_for_task["recommendations"] = (
                    [task_parameters]
                    if task_parameters
                    else task_recommendations
                )

                task = await build_adaptive_task_payload(
                    competency=competency,
                    progress_raw=progress_for_task
                )
                
                # 🔥 1. сохраняем (merge, а не перезапись)
                existing_raw = await redis_client.get(f"user_progress:{target_session_id}")
                existing = json.loads(existing_raw) if existing_raw else {}
                
                existing.update(progress)
                
                await redis_client.set(
                    f"user_progress:{target_session_id}",
                    json.dumps(existing)
                )
                
                skill = progress.get(
                    "mastery_reached",
                    progress.get("mastery", progress.get("bkt_mastery", False))
                )
            else:
                # Обработка случая, когда ключ не найден
                print(f"Ключ '{competency}' не найден в progress_raw")
                skill = False
    else:
        skill = False
    print(score.get('is_correct'), skill, "SCORE AND SKILL")
    if score.get('is_correct') ==True and skill == True:
        await complete_session(target_session_id)
        print("MODULE FINISHED")
    else:
        if score.get('is_correct') == False:
            await EventBus.publish(
                "tasks_correctness",
                {
                    "event": "task_not_completed",
                    "attempt_id": attempt_id,
                }
            )
            print("task not completed")
        else:
            print("task completed but skill not mastered", score.get('is_correct'))
            #обновляем подготовленное задание, чтобы методология могла сгенерировать следующее с учетом успешного выполнения
            existing_task = await redis_client.get(f"pending_next_task:{target_session_id}")
            current_task = json.loads(existing_task) if existing_task else {}
            current_task.update(task)
            print(target_session_id, current_task, "updated pending task in handle_progress_event")
            await redis_client.set(
                    f"pending_next_task:{target_session_id}",
                    json.dumps(current_task)
            )
            await EventBus.publish(
                "tasks_correctness",
                {
                    "event": "task_completed",
                    "attempt_id": attempt_id,
                }
            )
            
            #await generate_next_task(session, task)
            print("next step available")
