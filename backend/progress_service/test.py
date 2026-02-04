"""# tests/test_user_flow.py
import asyncio
import json
import pytest, websockets
from httpx import AsyncClient
from app.main import app
from app.redis_client import redis
from app.state import TASKS

# -----------------------
# Настройки
# -----------------------
FREE_MODE_CODE = "print('Hello world')"  # пример кода в free-mode
MODULE_STEP_CODE = "load_data(); fit_model()"  # пример кода для шага модуля
SESSION_ID = "test_session_1"
PROGRESS_SERVICE_URL = "http://localhost:8008"  # endpoint прогресса

# -----------------------
# Тест
# -----------------------
@pytest.mark.asyncio
async def test_full_user_path():
    async with websockets.connect("ws://localhost:8004/ws/tasks/test1") as websocket:
        # Отправляем данные
        await websocket.send(json.dumps({"mode": "free"}))
        await websocket.send("model.fit(X, y)")
        
        # Получаем ответы
        while True:
            response = await websocket.recv()
            print(response)
    async with AsyncClient(app=app, base_url="http://test") as client:

        # ----------------------
        # 1️⃣ Отправка кода в free-mode
        # ----------------------
        msg = {
            "session_id": SESSION_ID,
            "code": FREE_MODE_CODE
        }
        await redis.publish("mentor_in", json.dumps(msg))
        await redis.publish("submit_code", json.dumps(msg))
        await redis.publish("analyze", json.dumps(msg))

        # Ждём обработки
        await asyncio.sleep(0.5)

        task = TASKS[SESSION_ID]
        assert task.mentor_reply is not None, "Нет ответа от ментора"
        assert task.sandbox_reply is not None, "Нет ответа от песочницы"

        # ----------------------
        # 2️⃣ Аналитика предлагает модуль
        # ----------------------
        analysis_msg = {
            "session_id": SESSION_ID,
            "event": "suggest_module",
            "module": "model_evaluation"
        }
        await redis.publish("analysis_result", json.dumps(analysis_msg))
        await asyncio.sleep(0.2)

        '''# ----------------------
        # 3️⃣ Регистрация сессии модуля
        # ----------------------
        resp = await client.post("/tasks/register_session", params={"session_id": SESSION_ID})
        assert resp.status_code == 200
        task_run_id = resp.json().get("task_run_id")
        assert task_run_id is not None

        # ----------------------
        # 4️⃣ Прохождение шага модуля
        # ----------------------
        # Эмулируем приход условия от learning_service
        task.condition = {"description": "step 0"}
        task.step_id = 0
        task.condition_event.set()
        await asyncio.sleep(0.1)

        # Публикуем код для шага модуля
        module_msg = {
            "session_id": SESSION_ID,
            "code": MODULE_STEP_CODE,
            "step_id": 0,
            "condition": task.condition
        }
        await redis.publish("mentor_in", json.dumps(module_msg))
        await redis.publish("submit_code", json.dumps(module_msg))
        await redis.publish("analyze", json.dumps(module_msg))
        await asyncio.sleep(0.2)

        assert task.mentor_reply is not None
        assert task.sandbox_reply is not None'''

        # ----------------------
        # 5️⃣ Проверка прогресса через progress_service
        # ----------------------
        progress_resp = await client.get(f"{PROGRESS_SERVICE_URL}/get_progress", params={"user_id": "test_user"})
        assert progress_resp.status_code == 200
        progress_data = progress_resp.json()

        # Проверяем, что free-mode код + модуль учитываются
        assert "model_evaluation" in progress_data, "Компетенция не обновилась"
        assert progress_data["model_evaluation"]["level"] > 0, "Уровень компетенции не увеличился"
"""


import redis
import json
import time
import requests

#r = redis.Redis(host="localhost", port=6379, decode_responses=True)
'''r = redis.Redis(host="redis", port=6379, decode_responses=True)

r.publish("analysis_result", json.dumps({
    "session_id": "test-session-2",
    "analysis": {
        "competencies": {
            "debugging": 0.2
        },
        "confidence": 0.5
    }
}))

time.sleep(0.5)'''

resp = requests.get("http://localhost:8008/progress/test1")
print(resp.json())
