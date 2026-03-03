import asyncio
from fastapi import FastAPI, HTTPException
from app.redis_listener import redis_listener
from app.state import USER_PROGRESS, USER_RECOMMENDATIONS
from app.redis_client import redis
CHANNEL_ANALYSIS_PATTERN = "analytics_response:*"
from contextlib import asynccontextmanager
from fastapi import FastAPI
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):

    pubsub = redis.pubsub()
    await pubsub.psubscribe(CHANNEL_ANALYSIS_PATTERN)

    asyncio.create_task(redis_listener(pubsub))

    print("✅ Progress Service started and subscribed")

    yield

    await pubsub.close()


app = FastAPI(lifespan=lifespan)

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

@app.get("/progress/{user_id}")
async def get_progress(user_id: str):
    print("USER_PROGRESS:", USER_PROGRESS)
    progress = USER_PROGRESS.get(user_id)

    if user_id not in USER_PROGRESS:
        raise HTTPException(
            status_code=404,
            detail=f"No progress found for {user_id}"
        )

    return {
        "progress": progress,
        "recommendations": USER_RECOMMENDATIONS.get(user_id, [])
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8008, reload=True)

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
