import asyncio
from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt

from app.domain.offline_evaluator import evaluate_recent_events
from app.model_versions import MODEL_VERSIONS
from app.redis_client import redis
from app.redis_listener import redis_listener
from app.state import USER_PROGRESS, USER_RECOMMENDATIONS
from app.storage import load_runtime_state


CHANNEL_ANALYSIS_PATTERN = "analytics_response:*"
SECRET_KEY = "supersecret"
ALGORITHM = "HS256"

torch.set_num_threads(1)
torch.set_num_interop_threads(1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_runtime_state()
        print("Progress Service restored persisted ML state")
    except Exception as exc:
        print(f"Progress Service could not restore persisted ML state: {exc}")

    pubsub = redis.pubsub()
    await pubsub.psubscribe(CHANNEL_ANALYSIS_PATTERN)
    asyncio.create_task(redis_listener(pubsub))
    print("Progress Service started and subscribed")

    yield

    await pubsub.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/health")
async def health():
    return {"status": "ok", "model_versions": MODEL_VERSIONS}


@app.get("/ml/evaluation")
async def ml_evaluation(limit: int = 1000):
    return {
        "model_versions": MODEL_VERSIONS,
        "metrics": evaluate_recent_events(limit=limit),
    }


@app.get("/progress/{token}")
async def get_progress(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = str(payload["sub"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    progress = USER_PROGRESS.get(user_id)

    if not progress:
        raise HTTPException(
            status_code=404,
            detail=f"No progress found for user {user_id}",
        )

    return {
        "progress": progress,
        "recommendations": USER_RECOMMENDATIONS.get(user_id, []),
        "model_versions": MODEL_VERSIONS,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8008, reload=True)
