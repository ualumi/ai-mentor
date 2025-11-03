'''from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from app.core.db import init_db
from app.core.redis_client import redis
from app.core.websocket_manager import ConnectionManager

from app.api import users, tasks, mentor, analytics, code_exec

app = FastAPI(
    title="AI Mentor Learning Platform",
    description="Веб-приложение для обучения программированию с ИИ-ментором",
    version="1.0.0"
)

# -------------------------
# 🌍 CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # в продакшене указать конкретный домен фронтенда
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# 🔌 Инициализация
# -------------------------
@app.on_event("startup")
async def startup_event():
    await init_db()
    await redis.ping()
    print("✅ DB и Redis успешно подключены")

@app.on_event("shutdown")
async def shutdown_event():
    await redis.close()
    print("🧹 Соединения закрыты")


# -------------------------
# 🧩 Подключение маршрутов API
# -------------------------
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(code_exec.router, prefix="/api/code", tags=["Code Execution"])
app.include_router(mentor.router, prefix="/api/mentor", tags=["Mentor"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


# -------------------------
# 💬 WebSocket — чат с ментором (реальное время)
# -------------------------
manager = ConnectionManager()

@app.websocket("/ws/mentor/{user_id}")
async def websocket_mentor(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()

            # Отправляем сообщение ИИ-ментору через Redis Pub/Sub
            await redis.publish("mentor_channel", data)

            # Имитируем ответ ИИ (позже заменится на LLM API)
            await asyncio.sleep(1)
            await manager.send_personal_message(
                f"ИИ-ментор: попробуй проанализировать логику цикла!", user_id
            )

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        await manager.broadcast(f"👋 Пользователь {user_id} вышел из чата")


# -------------------------
# 🩺 Health check
# -------------------------
@app.get("/health")
async def health():
    db_status = "ok"
    redis_status = "ok" if await redis.ping() else "fail"
    return {"status": "running", "db": db_status, "redis": redis_status}


# -------------------------
# 🚀 Запуск приложения
# -------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)'''
