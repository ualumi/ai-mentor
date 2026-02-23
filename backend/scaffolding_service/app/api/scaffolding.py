from fastapi import APIRouter
from app.schemas.scaffold import StepRequest, StepResponse
from app.application.evaluate_step import evaluate_step

router = APIRouter(prefix="/methodology", tags=["methodology"])



@router.post("/submit", response_model=StepResponse)
async def submit_step(data: StepRequest):
    result = await evaluate_step(
        user_id = data.user_id,
        learning_session_id=data.learning_session_id,
        step_id=data.step_id,
        code=data.code,
        competency=data.competency
    )

    if result["status"] == "ok":
        return StepResponse(status="ok")

    '''hint = await generate_hint(
        code=data.code,
        context={
            "competency": data.competency,
            "methodology": "scaffolding"
        }
    )'''

    hint = "read_csv"

    return StepResponse(
        status="fail",
        hint=hint
    )
