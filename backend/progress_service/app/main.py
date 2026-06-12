import asyncio
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

#import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt

from app.domain.offline_evaluator import evaluate_recent_events
from app.model_versions import MODEL_VERSIONS
from app.redis_client import redis
from app.redis_listener import redis_listener
from app.state import (
    SKILL_ALIASES,
    SKILL_HIERARCHY,
    SKILL_REGISTRY,
    SKILL_RELATION_STATS,
    TYPED_COMPETENCY_GRAPH,
    USER_COMPETENCY_GRAPHS,
    USER_PROGRESS,
    USER_RECOMMENDATIONS,
    USER_SKILL_RELATION_STATS,
    USER_TYPED_COMPETENCY_GRAPHS,
)
from app.storage import DEFAULT_EVENT_LOG_PATH, load_runtime_state


CHANNEL_ANALYSIS_PATTERN = "analytics_response:*"
SECRET_KEY = "supersecret"
ALGORITHM = "HS256"
LOG_PATH = Path(os.getenv("PROGRESS_LOG_PATH", "data/progress_service.log"))


def setup_logging() -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.touch(exist_ok=True)
    DEFAULT_EVENT_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    DEFAULT_EVENT_LOG_PATH.touch(exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
        handlers=[
            logging.FileHandler(LOG_PATH, encoding="utf-8"),
            logging.StreamHandler(),
        ],
        force=True,
    )

#torch.set_num_threads(1)
#torch.set_num_interop_threads(1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger = logging.getLogger("progress_service")

    try:
        load_runtime_state()
        logger.info("Progress Service restored persisted ML state")
    except Exception as exc:
        logger.exception("Progress Service could not restore persisted ML state: %s", exc)

    pubsub = redis.pubsub()
    await pubsub.psubscribe(CHANNEL_ANALYSIS_PATTERN)
    asyncio.create_task(redis_listener(pubsub))
    logger.info("Progress Service started and subscribed to %s", CHANNEL_ANALYSIS_PATTERN)

    yield

    await pubsub.close()
    logger.info("Progress Service stopped")


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


@app.get("/ml/skill-ontology")
async def skill_ontology():
    return {
        "aliases": SKILL_ALIASES,
        "hierarchy": SKILL_HIERARCHY,
        "registry": SKILL_REGISTRY,
        "relation_stats": _plain_dict(SKILL_RELATION_STATS),
        "typed_graph": _plain_dict(TYPED_COMPETENCY_GRAPH),
        "model_versions": MODEL_VERSIONS,
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
        "personal_deficit_model": {
            "competency_graph": _plain_dict(USER_COMPETENCY_GRAPHS[user_id]),
            "typed_competency_graph": _plain_dict(USER_TYPED_COMPETENCY_GRAPHS[user_id]),
            "relation_stats": _plain_dict(USER_SKILL_RELATION_STATS[user_id]),
        },
        "recommendations": USER_RECOMMENDATIONS.get(user_id, []),
        "model_versions": MODEL_VERSIONS,
    }


def _plain_dict(value):
    if isinstance(value, dict):
        return {
            key: _plain_dict(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [_plain_dict(item) for item in value]

    return value


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8008, reload=True)
