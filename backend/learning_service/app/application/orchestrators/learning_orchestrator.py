
import json

from app.application.queries.get_user_sessions import get_user_sessions
from app.infrastructure.methodology_client import request_task_generation
from app.infrastructure.attempt_client import get_attempts
from app.infrastructure.event_bus import EventBus
from app.infrastructure.redis import redis_client
from app.application.queries.get_session import get_session
from app.application.orchestrators.task_payload_builder import build_adaptive_task_payload

MIN_MODULE_SUCCESSFUL_TASKS = 3
SESSION_TTL = 60 * 60 * 24


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
    active_key = _active_session_key(session["user_id"], session["competency"])
    await redis_client.delete(active_key)
    await redis_client.delete(_module_success_key(session_id))
    await redis_client.delete(_module_anonymous_success_key(session_id))

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
            progress = _find_skill_progress(skills, competency)
            if progress:
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
                
                skill = _explicit_mastery_reached(progress)
            else:
                # Обработка случая, когда ключ не найден
                print(f"Ключ '{competency}' не найден в progress_raw")
                skill = False
    else:
        skill = False
    is_correct = _is_correct_score(score)
    module_success_count = (
        await _record_module_success(target_session_id, attempt_id)
        if is_correct
        else await _module_success_count(target_session_id)
    )
    module_ready = (
        is_correct
        and skill is True
        and module_success_count >= MIN_MODULE_SUCCESSFUL_TASKS
    )

    print(is_correct, skill, module_success_count, "SCORE SKILL AND MODULE SUCCESS COUNT")
    if module_ready:
        await complete_session(target_session_id)
        print("MODULE FINISHED")
    else:
        if is_correct is False:
            await EventBus.publish(
                "tasks_correctness",
                {
                    "event": "task_not_completed",
                    "user_id": user_id,
                    "learning_session_id": target_session_id,
                    "attempt_id": attempt_id,
                }
            )
            print("task not completed")
        else:
            print("task completed but module is not ready", is_correct)
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
                    "user_id": user_id,
                    "learning_session_id": target_session_id,
                    "attempt_id": attempt_id,
                }
            )
            
            #await generate_next_task(session, task)
            print("next step available")


def _find_skill_progress(skills: dict, competency: str) -> dict | None:
    if not isinstance(skills, dict):
        return None

    canonical_competency = _normalize_skill_name(competency)
    if canonical_competency in skills:
        return skills[canonical_competency]

    for skill, progress in skills.items():
        if _normalize_skill_name(skill) == canonical_competency:
            return progress

    return None


def _explicit_mastery_reached(progress: dict) -> bool:
    return progress.get("mastery_reached") is True


def _is_correct_score(score) -> bool:
    if isinstance(score, dict):
        return score.get("is_correct") is True

    return score is True


async def _record_module_success(session_id: str, attempt_id) -> int:
    key = _module_success_key(session_id)
    member = str(attempt_id) if attempt_id else await _next_anonymous_success_id(session_id)
    await redis_client.sadd(key, member)
    await redis_client.expire(key, SESSION_TTL)
    return await redis_client.scard(key)


async def _module_success_count(session_id: str) -> int:
    return await redis_client.scard(_module_success_key(session_id))


async def _next_anonymous_success_id(session_id: str) -> str:
    key = _module_anonymous_success_key(session_id)
    count = await redis_client.incr(key)
    await redis_client.expire(key, SESSION_TTL)
    return f"anonymous:{count}"


def _module_success_key(session_id: str) -> str:
    return f"learning:module_successes:{session_id}"


def _module_anonymous_success_key(session_id: str) -> str:
    return f"learning:module_successes:{session_id}:anonymous"


def _normalize_skill_name(name) -> str:
    return str(name or "").strip().lower().replace("-", "_").replace("/", "_").replace(" ", "_")


def _active_session_key(user_id, competency: str) -> str:
    return f"learning:active:{user_id}:{_normalize_skill_name(competency)}"
