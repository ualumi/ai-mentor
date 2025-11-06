'''import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# Конфигурация
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 часа

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Хэширует пароль с bcrypt.
    Ограничение bcrypt: максимум 72 байта.
    Мы обрезаем строку до 72 символов, так как в UTF-8 1 символ = 1-4 байта,
    это безопасно для большинства случаев.
    """
    truncated = password[:72]  # берём первые 72 символа
    return pwd_context.hash(truncated)

def verify_password(plain: str, hashed: str) -> bool:
    truncated = plain[:72]
    return pwd_context.verify(truncated, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None'''

from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

# Настройки для хэширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Секретный ключ для JWT
SECRET_KEY = "your_super_secret_key"
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


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Генерация JWT токена
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

