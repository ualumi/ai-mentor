from fastapi import FastAPI
from app.api import auth
from app.core.database import engine, Base

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="User Service")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
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

#роутеры авторизации
app.include_router(auth.router)

@app.get("/health")
async def health():
    return {"status": "ok"}
