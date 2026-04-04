import logging
from logging.handlers import RotatingFileHandler
import os

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        RotatingFileHandler(
            "logs/app.log",
            maxBytes=5_000_000,
            backupCount=3
        ),
        logging.StreamHandler()
    ],
)
import asyncio
from fastapi import FastAPI, HTTPException
from app.redis_listener import redis_listener
from app.state import USER_PROGRESS, USER_RECOMMENDATIONS
from app.redis_client import redis
CHANNEL_ANALYSIS_PATTERN = "analytics_response:*"
from contextlib import asynccontextmanager
from fastapi import FastAPI
import asyncio
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):

    pubsub = redis.pubsub()
    await pubsub.psubscribe(CHANNEL_ANALYSIS_PATTERN)

    asyncio.create_task(redis_listener(pubsub))

    print("✅ Progress Service started and subscribed")

    yield

    await pubsub.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

@app.get("/health")
async def health():
    return {"status": "ok"}

'''@app.get("/progress/{user_id}")
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
    }'''

from jose import jwt, JWTError

SECRET_KEY = "supersecret"
ALGORITHM = "HS256"


@app.get("/progress/{token}")
async def get_progress(token: str):
    # 🔐 Декодируем токен
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    print("USER_PROGRESS:", USER_PROGRESS)

    progress = USER_PROGRESS.get(user_id)

    if not progress:
        raise HTTPException(
            status_code=404,
            detail=f"No progress found for user {user_id}"
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
