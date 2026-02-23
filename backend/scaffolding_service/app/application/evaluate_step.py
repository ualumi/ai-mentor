from app.domain.scaffold import ScaffoldingTask
from app.infrastructure.event_bus import EventBus

async def evaluate_step(
    user_id: str,
    learning_session_id: str,
    step_id: int,
    code: str,
    competency: str
):
    scaffold = ScaffoldingTask()

    is_correct = scaffold.validate(step_id, code)

    if is_correct:
        await EventBus.publish(
            "scaffolding.events",
            {
                "event": "step_completed",
                "user_id": user_id,
                "learning_session_id": learning_session_id,
                "step_id": step_id,
                "competency": competency,
                "mode": "module"
            }
        )
        return {"status": "ok"}

    await EventBus.publish(
        "scaffolding.events",
        {
            "event": "step_failed",
            "user_id": user_id,
            "learning_session_id": learning_session_id,
            "step_id": step_id,
            "competency": competency,
            "mode": "module"
        }
    )

    return {"status": "fail"}