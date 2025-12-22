
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, constr
from app.core.database import get_db

from app.application.commands.register import register_user_command
from app.application.commands.login import login_user_command
from app.application.queries.verify_token import verify_token_query

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    username: constr(min_length=1, max_length=50)
    email: constr(max_length=120)
    password: constr(min_length=6)

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        user_id = await register_user_command(data, db)
        return {"user_id": user_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        token = await login_user_command(data, db)
        return TokenResponse(access_token=token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid credentials")

from fastapi import APIRouter, HTTPException, Query
from app.core.security import verify_access_token


@router.get("/verify-token")
async def verify_token(token: str = Query(...)):

    # Мы не используем partition, так как нам прилетает чистый JWT без "Bearer"
    try:
        payload = verify_access_token(token)
        # Возвращаем данные, которые нужны воркеру
        return {
            "status": "ok",
            "user_id": payload.get("sub"),
            "email": payload.get("email")
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
