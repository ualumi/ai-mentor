from fastapi import FastAPI
from app.api import auth
from app.core.database import engine, Base

from fastapi.middleware.cors import CORSMiddleware






app = FastAPI(title="User Service")

# Разрешаем все источники (для разработки)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Или список конкретных фронтенд URL, например ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание таблиц при старте (упрощённо)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ База данных инициализирована")

# Подключаем роутер авторизации
app.include_router(auth.router)

@app.get("/health")
async def health():
    return {"status": "ok"}
