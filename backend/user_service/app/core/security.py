

from passlib.context import CryptContext
from datetime import datetime, timedelta

# Настройки для хэширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Секретный ключ для JWT
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 день


def hash_password(password: str) -> str:
    """
    Хэширует пароль, обрезая его до 72 байт (ограничение bcrypt)
    """
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        truncated = password_bytes[:72].decode("utf-8", errors="ignore")
        print(f"[security] Password truncated to 72 bytes")
    else:
        truncated = password
    print(f"[security] Password length in bytes: {len(password.encode())}")
    return pwd_context.hash(truncated)


def verify_password(password: str, hashed: str) -> bool:
    """
    Проверяет пароль
    """
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        truncated = password_bytes[:72].decode("utf-8", errors="ignore")
    else:
        truncated = password
    return pwd_context.verify(truncated, hashed)


from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from fastapi import HTTPException

SECRET_KEY = os.getenv("SECRET_KEY", "default_secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

