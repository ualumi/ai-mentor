from fastapi import APIRouter, Depends, Header, HTTPException
from app.infrastructure.user_client import verify_token
from app.application.commands.start_session import start_session
from app.application.queries.get_session import get_session
from app.schemas.session import StartSessionRequest

router = APIRouter(prefix="/learning", tags=["learning"])


@router.post("/start")
async def start_learning_session(
    data: StartSessionRequest,
    authorization: str = Header(...)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = authorization.replace("Bearer ", "")
    payload = await verify_token(token)

    session = await start_session(
        user_id=int(payload["user_id"]),
        competency=data.competency,
        methodology=data.methodology
    )

    return {
        "session_id": session.id,
        "competency": session.competency,
        "methodology": session.methodology,
        "current_step": session.current_step
    }


@router.get("/session/{session_id}")
async def get_learning_session(session_id: str):
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
