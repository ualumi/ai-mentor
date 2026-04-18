
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

    active_key = f"learning:active:{session['user_id']}:{session['competency']}"
    await redis_client.delete(active_key)

    await EventBus.publish(
        "learning.events",
        {
            "event": "session_completed",
            "session_id": session_id
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
'''async def generate_next_task(learning_session_id: str):

    key = f"learning:session:{learning_session_id}"

    session_data = await redis_client.hgetall(key)

    if not session_data:
        raise Exception(
            f"Learning session {learning_session_id} not found"
        )

    user_id = int(session_data["user_id"])
    competency = session_data["competency"]
    methodology = session_data["methodology"]

    attempts = await get_attempts(learning_session_id)

    await request_task_generation(
        methodology=methodology,
        payload={
            "learning_session_id": learning_session_id,
            "user_id": user_id,
            "competency": competency,
            "attempts": attempts
        }
    )'''

'''async def handle_progress_event(event):

    user_id = event["data"]["user_id"]
    progress = event["data"]["progress"]

    sessions = await get_user_sessions(user_id, status="active")

    for session in sessions:
        competency = session["competency"]
        skill = progress.get(competency)

        if not skill:
            continue

        if skill["mastery"]:
            await complete_session(session["session_id"])
        else:
            await generate_next_task(session)'''

'''async def handle_progress_event(event):

    user_id = event["user_id"]
    progress = event["progress"]

    sessions = await get_user_sessions(user_id, status="active")

    for session in sessions:

        competency = session["competency"]
        skill = progress.get(competency)

        if not skill:
            continue

        if skill["mastery"]:
            await complete_session(session["session_id"])
        else:
            await generate_next_task(session)'''

async def handle_progress_event(event):

    user_id = event["user_id"]
    progress = event["progress"]
    target_session_id = event.get("learning_session_id")  # 🔥

    if not target_session_id:
        return  # или fallback логика

    session = await get_session(target_session_id)
    print ('progress_sesson', session)
    if not session:
        return

    competency = session["competency"]
    skill = progress.get(competency)

    '''if not skill:
        return'''

    '''if skill["mastery"]:
        await complete_session(target_session_id)'''
    if competency == "hola":
        await complete_session(target_session_id)
    else:
        await generate_next_task(session)
        print("query for generation sent")