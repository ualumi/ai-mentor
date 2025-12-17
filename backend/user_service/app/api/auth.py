'''from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from app.core.models import User
from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter()


# ----- Схемы -----
from pydantic import constr

class RegisterRequest(BaseModel):
    username: constr(min_length=1, max_length=50)
    email: constr(max_length=120)
    password: constr(min_length=6, max_length=72)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ----- Регистрация -----
@router.post("/register", response_model=TokenResponse)
async def register_user(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.email == data.email)
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")

    new_user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(new_user)
    await db.commit()

    token = create_access_token({"sub": str(new_user.id)})
    return TokenResponse(access_token=token)


# ----- Авторизация -----
@router.post("/login", response_model=TokenResponse)
async def login_user(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.email == data.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверные учетные данные")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)'''




'''from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, constr
from app.core.models import User
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, verify_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

# ----- Схемы -----
class RegisterRequest(BaseModel):
    username: constr(min_length=1, max_length=50)
    email: constr(max_length=120)
    password: constr(min_length=6, max_length=255)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ----- Регистрация -----
@router.post("/register", response_model=TokenResponse)
async def register_user(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.email == data.email)
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")

    password_hash = hash_password(data.password)
    new_user = User(
        username=data.username,
        email=data.email,
        password_hash=password_hash,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id)})
    return TokenResponse(access_token=token)


# ----- Авторизация -----
@router.post("/login", response_model=TokenResponse)
async def login_user(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.email == data.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверные учетные данные")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


# ----- Проверка токена -----
from fastapi import Header

@router.get("/verify-token")
async def verify_token_endpoint(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid Authorization format")

    # Проверяем токен
    token_data = verify_access_token(token)

    return {
        "user_id": token_data.get("sub"),
        "email": token_data.get("email")
    }'''



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

'''@router.get("/verify-token")
async def verify_token(authorization: str):
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401)

    return await verify_token_query(token)'''

from fastapi import APIRouter, HTTPException, Query
from app.core.security import verify_access_token


@router.get("/verify-token")
async def verify_token(token: str = Query(...)):
    """
    Принимает чистый токен из ?token=...
    Имя переменной 'token' теперь совпадает с тем, что шлет websocket_service
    """
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
