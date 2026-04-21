
import json

from app.application.queries.get_user_sessions import get_user_sessions
from app.infrastructure.methodology_client import request_task_generation
from app.infrastructure.attempt_client import get_attempts
from app.infrastructure.event_bus import EventBus
from app.infrastructure.redis import redis_client
from app.application.queries.get_session import get_session

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

async def generate_next_task(session):

    #attempts = await get_attempts(session["session_id"])
    print("next task_condition query sent")
    await request_task_generation(
        methodology=session["methodology"],
        payload={
            "learning_session_id": session["session_id"],
            "user_id": session["user_id"],
            "competency": session["competency"],
            "attempts": []
        }
    )

async def handle_progress_event(event):

    user_id = event["user_id"]
    progress_raw = event["progress"]
    target_session_id = event.get("learning_session_id")  # 🔥

    if not target_session_id:
        return  # или fallback логика

    session = await get_session(target_session_id)
    print ('progress_sesson', session)
    if not session:
        return

    competency = session["competency"]
    if progress_raw and isinstance(progress_raw, dict):

            # Ищем ключ, соответствующий competency
            if competency in progress_raw:
                progress = progress_raw[competency]
                print('PROGRESS', progress)
                
                # 🔥 1. сохраняем (merge, а не перезапись)
                existing_raw = await redis_client.get(f"user_progress:{target_session_id}")
                existing = json.loads(existing_raw) if existing_raw else {}
                
                existing.update(progress)
                
                await redis_client.set(
                    f"user_progress:{target_session_id}",
                    json.dumps(existing)
                )
                
                skill = progress.get('mastery')  # True или False
            else:
                # Обработка случая, когда ключ не найден
                print(f"Ключ '{competency}' не найден в progress_raw")
                skill = False
    else:
        skill = False

    if skill == True:
        await complete_session(target_session_id)
        print("MODULE FINISHED")
    else:
        await generate_next_task(session)
        print("query for generation sent")
