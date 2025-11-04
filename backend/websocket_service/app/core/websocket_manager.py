from typing import Dict
from fastapi import WebSocket

class ConnectionManager:
    """
    Менеджер активных WebSocket соединений.
    Хранит соединения по user_id и позволяет отправлять личные сообщения.
    """
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
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
manager = ConnectionManager()

'''from typing import Dict
from fastapi import WebSocket

class ConnectionManager:
    """
    Менеджер активных WebSocket соединений.
    Хранит соединения по user_id и позволяет отправлять личные сообщения.
    """
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"🔗 Пользователь {user_id} подключен")

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)
        print(f"❌ Пользователь {user_id} отключен")

    async def send_personal_message(self, message: str, user_id: str):
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_text(message)

    async def broadcast(self, message: str):
        for websocket in self.active_connections.values():
            await websocket.send_text(message)'''
