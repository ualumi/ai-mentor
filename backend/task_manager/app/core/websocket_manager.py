'''from typing import Dict
from fastapi import WebSocket


class ConnectionManager:
    """
    Менеджер активных WebSocket соединений.
    Хранит соединения по user_id и позволяет отправлять личные сообщения.
    """
    def __init__(self):
        async def connect(self, websocket: WebSocket, task_run_id: str):
            self.active_connections[task_run_id] = websocket

    async def connect(self, websocket: WebSocket, user_id: str):
        # НЕ вызываем websocket.accept() здесь
        self.active_connections[user_id] = websocket
        print(f"🔗 Пользователь {user_id} подключен")

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)
        print(f"❌ Пользователь {user_id} отключен")

    async def send_personal_message(self, message: str, user_id: str):
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_text(message)
            except Exception as e:
                print(f"Ошибка при отправке пользователю {user_id}: {e}")

    async def broadcast(self, message: str):
        for websocket in list(self.active_connections.values()):
            try:
                await websocket.send_text(message)
            except Exception as e:
                print(f"Broadcast error: {e}")

# singleton — используем один manager по всему микросервису
manager = ConnectionManager()'''


'''# task_manager/app/core/websocket_manager.py
from typing import Dict
from fastapi import WebSocket

TASK_CONTEXT: Dict[str, dict] = {}
# NEW
SESSION_TO_TASK: Dict[str, str] = {}
class ConnectionManager:
    """
    Менеджер активных WebSocket соединений.
    Хранит соединения по user_id/task_run_id и позволяет отправлять личные сообщения.
    """
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, connection_id: str):
        self.active_connections[connection_id] = websocket
        print(f"🔗 Подключён: {connection_id}")

    def disconnect(self, connection_id: str):
        if connection_id in self.active_connections:
            self.active_connections.pop(connection_id)
            print(f"❌ Отключён: {connection_id}")

    async def send_personal_message(self, message: str, connection_id: str):
        ws = self.active_connections.get(connection_id)
        if ws:
            return
        try:
            await ws.send_text(message)
        except Exception as e:
            self.disconnect(connection_id)

# singleton для всего микросервиса
manager = ConnectionManager()'''


from typing import Dict
from fastapi import WebSocket

TASK_CONTEXT: Dict[str, dict] = {}
SESSION_TO_TASK: Dict[str, str] = {}

class ConnectionManager:
    """
    Менеджер активных WebSocket соединений.
    Хранит соединения по task_run_id и буферизует сообщения.
    """
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, task_run_id: str):
        self.active_connections[task_run_id] = websocket
        print(f"🔗 Подключён: {task_run_id}")

        # Отправляем все накопленные сообщения
        ctx = TASK_CONTEXT.get(task_run_id, {})
        for msg in ctx.get("pending_messages", []):
            try:
                await websocket.send_text(msg)
            except Exception as e:
                print(f"⚠️ Failed to send buffered message: {e}")
        ctx["pending_messages"] = []

    def disconnect(self, task_run_id: str):
        if task_run_id in self.active_connections:
            self.active_connections.pop(task_run_id)
            print(f"❌ Отключён: {task_run_id}")

    async def send_personal_message(self, message: str, task_run_id: str):
        ws = self.active_connections.get(task_run_id)
        ctx = TASK_CONTEXT.setdefault(task_run_id, {})

        if ws:
            try:
                await ws.send_text(message)
                print(f"✅ Sent to WS {task_run_id}: {message}")
            except Exception as e:
                print(f"⚠️ Failed to send WS message: {e}")
                self.disconnect(task_run_id)
                ctx.setdefault("pending_messages", []).append(message)
        else:
            # Буферизуем сообщение, пока нет активного WS
            ctx.setdefault("pending_messages", []).append(message)
            print(f"📝 Message buffered for task_run_id={task_run_id}")


# Singleton
manager = ConnectionManager()


