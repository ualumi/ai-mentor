from app.domain.debugging import ScaffoldingTask
from app.infrastructure.event_bus import EventBus

async def evaluate_step(
    session_id: str,
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
                "session_id": session_id,
                "step": step_id,
                "competency": competency
            }
        )
        return {"status": "ok"}

    await EventBus.publish(
        "scaffolding.events",
        {
            "event": "step_failed",
            "session_id": session_id,
            "step": step_id,
            "competency": competency
        }
    )

    return {"status": "fail"}
