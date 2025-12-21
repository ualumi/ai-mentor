'''from fastapi import APIRouter, Depends
import uuid
import json
from app.core.redis_client import redis

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/submit")
async def submit_task(data: dict):
    task_run_id = str(uuid.uuid4())

    event = {
        "event": "task_submitted",
        "task_run_id": task_run_id,
        "session_id": data["session_id"],
        "user_id": data["user_id"],
        "task": data["task"],
        "code": data["code"]
    }

    # 1️⃣ сохранить состояние (опционально)
    await redis.hset(
        f"task:{task_run_id}",
        mapping={"status": "submitted"}
    )

    # 2️⃣ опубликовать событие
    await redis.publish("tasks.submitted", json.dumps(event))

    return {"task_run_id": task_run_id}'''



'''from fastapi import APIRouter, Depends, Header, HTTPException
import uuid
import aiohttp

router = APIRouter(prefix="/tasks", tags=["tasks"])

USER_SERVICE_URL = "http://user_service:8002/auth/verify-token"


from fastapi import Header, HTTPException
import aiohttp

async def verify_token(
    authorization: str = Header(..., alias="Authorization")
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = authorization.replace("Bearer ", "")

    async with aiohttp.ClientSession() as session:
        async with session.get(
            USER_SERVICE_URL,
            params={"token": token},  # 🔥 ВАЖНО
            timeout=5
        ) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=401, detail="Invalid token")

            return await resp.json()




@router.post("")
async def create_task(user=Depends(verify_token)):
    task_run_id = str(uuid.uuid4())

    return {
        "task_run_id": task_run_id,
        "user_id": user["user_id"],
        "status": "created",
    }'''


'''from fastapi import APIRouter, Depends, Header, HTTPException
import uuid
import aiohttp
from app.core.redis_client import redis
import json
import asyncio

CHANNEL_TASK_REQUEST = "task_requested"


router = APIRouter(prefix="/tasks", tags=["tasks"])

USER_SERVICE_URL = "http://user_service:8002/auth/verify-token"

async def verify_token(
    authorization: str = Header(..., alias="Authorization")
):
    """Проверка токена через User Service"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = authorization.replace("Bearer ", "")

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{USER_SERVICE_URL}?token={token}") as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=401, detail="Invalid token")
                return await resp.json()
        except Exception as e:
            print(f"⚠️ Ошибка запроса к user_service: {e}")
            raise HTTPException(status_code=500, detail="User service error")


"""@router.post("")
async def create_task(user=Depends(verify_token)):
    task_run_id = str(uuid.uuid4())
    return {
        "task_run_id": task_run_id,
        "user_id": user["user_id"],
        "status": "created",
    }"""
from app.core.websocket_manager import TASK_CONTEXT

task = TASK_CONTEXT.get(task_run_id)
@router.post("")
async def create_task(user=Depends(verify_token)):
    task_run_id = str(uuid.uuid4())
    return {
        "task_run_id": task_run_id,
        "user_id": user["user_id"],
        "status": "created",
        "condition": task["condition"] if task else None
    }'''

from fastapi import APIRouter, Depends, Header, HTTPException
import uuid
import aiohttp

from app.core.websocket_manager import TASK_CONTEXT, SESSION_TO_TASK

router = APIRouter(prefix="/tasks", tags=["tasks"])

USER_SERVICE_URL = "http://user_service:8002/auth/verify-token"


# ---------------- TOKEN VERIFY ----------------
async def verify_token(
    authorization: str = Header(..., alias="Authorization")
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = authorization.replace("Bearer ", "")

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{USER_SERVICE_URL}?token={token}") as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=401, detail="Invalid token")
                return await resp.json()
        except Exception as e:
            print(f"⚠️ User service error: {e}")
            raise HTTPException(status_code=500, detail="User service error")


# ---------------- CREATE TASK ----------------
@router.post("")
async def get_task(user=Depends(verify_token)):
    user_id = str(user["user_id"])

    # 🔍 ищем существующий task_run_id для пользователя
    for task_run_id, ctx in TASK_CONTEXT.items():
        if ctx.get("user_id") == user_id:
            return {
                "task_run_id": task_run_id,
                "user_id": user_id,
                "status": "existing",
                "condition": ctx.get("condition"),
            }

    # ❗ если задачи ещё нет — это нормально
    return {
        "status": "pending",
        "message": "Task not created yet"
    }

@router.post("/register_session")
async def register_session(session_id: str):
    # если уже есть, возвращаем существующий
    task_run_id = SESSION_TO_TASK.get(session_id)
    if not task_run_id:
        task_run_id = str(uuid.uuid4())
        SESSION_TO_TASK[session_id] = task_run_id
        TASK_CONTEXT[task_run_id] = {
            "session_id": session_id,
            "current_step": 0,
            "condition": None,
            "answer": None
        }
        print(f"🆕 Зарегистрирован session_id={session_id} -> task_run_id={task_run_id}")
    return {"task_run_id": task_run_id}


# ---------------- GET TASK_RUN_ID ----------------
@router.get("/get_task_run_id")
async def get_task_run_id(session_id: str, user=Depends(verify_token)):
    """
    Фронтенд передаёт session_id и получает соответствующий task_run_id.
    Если задача ещё не создана — создаём новую запись.
    """
    user_id = str(user["user_id"])

    # проверяем, есть ли уже task_run_id для session_id
    task_run_id = SESSION_TO_TASK.get(session_id)
    if not task_run_id:
        task_run_id = str(uuid.uuid4())
        SESSION_TO_TASK[session_id] = task_run_id
        TASK_CONTEXT[task_run_id] = {
            "session_id": session_id,
            "user_id": user_id,
            "current_step": 0,
            "condition": None,
            "answer": None
        }
        print(f"🆕 Зарегистрирован session_id={session_id} -> task_run_id={task_run_id}")
        status_msg = "created"
    else:
        status_msg = "existing"

    return {
        "task_run_id": task_run_id,
        "user_id": user_id,
        "status": status_msg,
        "condition": TASK_CONTEXT[task_run_id].get("condition"),
    }


'''@router.post("")
async def create_task(user=Depends(verify_token)):
    session_id = user.get("session_id")

    if not session_id:
        raise HTTPException(400, "session_id required")

    task_run_id = SESSION_TO_TASK.get(session_id)

    if not task_run_id:
        raise HTTPException(
            status_code=404,
            detail="Task not initialized yet"
        )

    return {
        "task_run_id": task_run_id,
        "user_id": user["user_id"],
        "condition": TASK_CONTEXT[task_run_id]["condition"]
    }'''




'''@router.post("")
async def create_task(user=Depends(verify_token)):
    session_id = user.get("session_id")  # если есть, иначе можно генерировать
    task_run_id = None

    for tr_id, ctx in TASK_CONTEXT.items():
        if ctx.get("session_id") == session_id:
            task_run_id = tr_id
            break

    if not task_run_id:
        import uuid
        task_run_id = str(uuid.uuid4())
        TASK_CONTEXT[task_run_id] = {
            "user_id": user["user_id"],
            "session_id": session_id,
            "condition": None,
            "answer": None,
            "current_step": 0
        }

    return {
        "task_run_id": task_run_id,
        "user_id": user["user_id"],
        "status": "created",
        "condition": TASK_CONTEXT[task_run_id]["condition"]
    }'''

