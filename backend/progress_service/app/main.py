import asyncio
from fastapi import FastAPI, HTTPException
from app.redis_listener import redis_listener
from app.state import USER_PROGRESS, USER_RECOMMENDATIONS


app = FastAPI(title="Progress Service")

@app.on_event("startup")
async def startup():
    asyncio.create_task(redis_listener())
    print("✅ Progress Service started")

@app.get("/health")
async def health():
    return {"status": "ok"}

'''@app.get("/progress/{session_id}")
async def get_progress(session_id: str):
    """
    Возвращает текущий прогресс пользователя и рекомендации (если есть)
    """
    progress = USER_PROGRESS.get(session_id)
    if not progress:
        raise HTTPException(status_code=404, detail=progress)

    # Здесь можно расширять логику рекомендаций
    recommendations = progress.get("recommendations", [])

    return {
        "progress": progress,
        "recommendations": recommendations
    }'''

@app.get("/progress/{session_id}")
async def get_progress(session_id: str):
    print("USER_PROGRESS:", USER_PROGRESS)
    progress = USER_PROGRESS.get(session_id)

    if session_id not in USER_PROGRESS:
        raise HTTPException(
            status_code=404,
            detail=f"No progress found for session {session_id}"
        )

    return {
        "progress": progress,
        "recommendations": USER_RECOMMENDATIONS.get(session_id, [])
    }

'''import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.redis_listener import redis_listener

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(redis_listener())
    print("✅ Progress Service started")
    yield
    task.cancel()
    await asyncio.gather(task, return_exceptions=True)

app = FastAPI(
    title="Progress Service",
    lifespan=lifespan
)

@app.get("/health")
async def health():
    return {"status": "ok"}'''
