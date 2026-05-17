import json

from app.infrastructure.redis import redis_client
from app.application.queries.get_session import get_session
from app.application.orchestrators.learning_orchestrator import (
    generate_next_task
)

async def listen_next_step():

    pubsub = redis_client.pubsub()

    await pubsub.subscribe("learning.next_step")

    async for msg in pubsub.listen():

        if msg["type"] != "message":
            continue

        try:
            data = json.loads(msg["data"])
        except:
            continue

        session_id = data.get("learning_session_id")

        if not session_id:
            continue

        # -----------------------------
        # session
        # -----------------------------

        session = await get_session(session_id)

        if not session:
            continue

        # -----------------------------
        # pending task
        # -----------------------------

        raw_task = await redis_client.get(
            f"pending_next_task:{session_id}"
        )

        if not raw_task:
            print("No pending task")
            continue

        task = json.loads(raw_task)

        # -----------------------------
        # generate
        # -----------------------------

        await generate_next_task(
            session,
            task
        )

        print(
            f"Generated next task for {session_id}"
        )
        

        # -----------------------------
        # cleanup
        # -----------------------------

        await redis_client.delete(
            f"pending_next_task:{session_id}"
        )