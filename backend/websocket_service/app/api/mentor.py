'''from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
import aiohttp
import json
from app.core.redis_client import redis
from app.core.websocket_manager import manager

router = APIRouter()

CHANNEL_IN = "mentor_in"  # код от пользователя → AI

# 🔹 URL user_service — можно взять из docker-compose сети
USER_SERVICE_URL = "http://user_service:8002/auth/verify-token"


async def verify_token(token: str):
    """Проверка токена через user_service"""
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(
                USER_SERVICE_URL,
                headers={"Authorization": f"Bearer {token}"}
            ) as resp:
                if resp.status == 200:
                    return await resp.json()  # { "user_id": ..., "email": ... }
                return None
        except Exception as e:
            print(f"⚠️ Ошибка запроса к user_service: {e}")
            return None


@router.websocket("/ws/mentor")
async def websocket_mentor(websocket: WebSocket):
    """
    WebSocket соединение пользователя.
    Проверяет токен через user_service.
    Отправляет введённый код в Redis → mentor_in.
    """
    # 1️⃣ Принимаем подключение
    await websocket.accept()

    # 2️⃣ Извлекаем токен из query-параметров
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        print("❌ Отклонено подключение: отсутствует токен")
        return

    # 3️⃣ Проверяем токен через user_service
    user_data = await verify_token(token)
    if not user_data:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        print("❌ Отклонено подключение: неверный токен")
        return

    # 4️⃣ Получаем user_id из ответа user_service
    user_id = str(user_data.get("user_id"))
    print(f"✅ Подключён пользователь {user_id}")

    # 5️⃣ Подключаем WebSocket к менеджеру
    await manager.connect(websocket, user_id)

    try:
        while True:
            # 6️⃣ Получаем сообщение от клиента
            data = await websocket.receive_text()
            message = {"user_id": user_id, "code": data}

            # 7️⃣ Отправляем сообщение в Redis
            await redis.publish(CHANNEL_IN, json.dumps(message))
    except WebSocketDisconnect:
        print(f"🔌 Отключился пользователь {user_id}")
    except Exception as e:
        print(f"⚠️ WebSocket error: {e}")
    finally:
        manager.disconnect(user_id)'''



'''from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
import aiohttp
import json
from app.core.redis_client import redis
from app.core.websocket_manager import manager

router = APIRouter()

# Каналы Redis
CHANNEL_MENTOR_IN = "mentor_in"       # код пользователя → ИИ-ментор
CHANNEL_SUBMIT = "submit_code"        # код пользователя → песочница

# URL сервиса пользователей
USER_SERVICE_URL = "http://user_service:8002/auth/verify-token"


async def verify_token(token: str):
    """Проверка токена через user_service"""
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(
                USER_SERVICE_URL,
                headers={"Authorization": f"Bearer {token}"}
            ) as resp:
                if resp.status == 200:
                    return await resp.json()  # { "user_id": ..., "email": ... }
                return None
        except Exception as e:
            print(f"⚠️ Ошибка запроса к user_service: {e}")
            return None


@router.websocket("/ws/mentor")
async def websocket_mentor(websocket: WebSocket):
    """Соединение с ИИ-ментором"""
    await websocket.accept()

    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        print("❌ Отклонено подключение: отсутствует токен")
        return

    user_data = await verify_token(token)
    if not user_data:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        print("❌ Отклонено подключение: неверный токен")
        return

    user_id = str(user_data.get("user_id"))
    print(f"✅ Подключён пользователь {user_id} (ментор)")

    await manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            message = {"user_id": user_id, "code": data}

            """# Отправляем код в ИИ-ментор
            await redis.publish(CHANNEL_MENTOR_IN, json.dumps(message))"""

            # Отправляем код в песочницу
            """await redis.publish(CHANNEL_SUBMIT, json.dumps({"user_id": user_id, "code": data}))"""
            # Отправляем код в песочницу
            await redis.publish(
                CHANNEL_SUBMIT,
                json.dumps({"user_id": user_id, "code": data})
            )

    except WebSocketDisconnect:
        print(f"🔌 Отключился пользователь {user_id} (ментор)")
    except Exception as e:
        print(f"⚠️ WebSocket error: {e}")
    finally:
        manager.disconnect(user_id)


"""@router.websocket("/ws/code/{user_id}")
async def websocket_code(websocket: WebSocket, user_id: str):
    await websocket.accept()
    await manager.connect(websocket, user_id)

    try:
        while True:
            code = await websocket.receive_text()
            await redis.publish(CHANNEL_SUBMIT, json.dumps({"user_id": user_id, "code": code}))
    except WebSocketDisconnect:
        print(f"🔌 Пользователь {user_id} отключился от /ws/code")
    finally:
        manager.disconnect(user_id)"""

@router.websocket("/ws/code/{user_id}")
async def websocket_code(websocket: WebSocket, user_id: str):
    """
    Отдельный канал для отправки кода напрямую в песочницу.
    Теперь с проверкой прав доступа.
    """
    await websocket.accept()

    # 1. Извлекаем токен
    token = websocket.query_params.get("token")

    # 2. Проверяем на пустой токен или строку "undefined" (защита от багов фронтенда)
    if not token or token == "undefined":
        print(f"❌ Отклонено /ws/code/{user_id}: токен не передан или undefined")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 3. Валидируем токен через user_service
    user_data = await verify_token(token)
    
    if not user_data:
        print(f"❌ Отклонено /ws/code/{user_id}: невалидный токен")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 4. Проверяем, что токен принадлежит именно этому пользователю
    # (Чтобы пользователь 10 не мог слать код в канал /ws/code/20)
    authenticated_user_id = str(user_data.get("user_id"))
    if authenticated_user_id != user_id:
        print(f"❌ Ошибка доступа: токен пользователя {authenticated_user_id} не совпадает с URL {user_id}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 5. Если всё ок — подключаем
    print(f"✅ Пользователь {user_id} авторизован для прямой отправки кода")
    await manager.connect(websocket, user_id)

    try:
        while True:
            # Получаем код от клиента
            code = await websocket.receive_text()
            
            # Отправляем в Redis для песочницы
            payload = {
                "user_id": user_id, 
                "code": code
            }
            await redis.publish(CHANNEL_SUBMIT, json.dumps(payload))
            
    except WebSocketDisconnect:
        print(f"🔌 Пользователь {user_id} отключился от /ws/code")
    except Exception as e:
        print(f"⚠️ Ошибка в /ws/code/{user_id}: {e}")
    finally:
        manager.disconnect(user_id)'''


import json
import aiohttp
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from app.core.redis_client import redis
from app.core.websocket_manager import manager

router = APIRouter()

# Каналы Redis
CHANNEL_MENTOR_IN = "mentor_in"
CHANNEL_SUBMIT = "current_task"

# URL сервиса пользователей
USER_SERVICE_URL = "http://user_service:8002/auth/verify-token"

async def verify_token(token: str):
    """
    Проверка токена через user_service.
    Исправлено: добавлена защита от 'undefined' и поддержка Query-параметра.
    """
    if not token or token in ["undefined", "null"]:
        print("⚠️ Попытка проверки некорректного токена (пусто или undefined)")
        return None

    async with aiohttp.ClientSession() as session:
        try:
            # Отправляем токен как Query-параметр (?token=...), 
            # так как ваш user_service ожидает именно такой формат.
            async with session.get(
                USER_SERVICE_URL,
                params={"token": token},
                timeout=5
            ) as resp:
                if resp.status == 200:
                    return await resp.json()  # { "user_id": ..., "email": ... }
                
                print(f"❌ User_service отклонил токен: статус {resp.status}")
                return None
        except Exception as e:
            print(f"⚠️ Ошибка запроса к user_service: {e}")
            return None

@router.websocket("/ws/mentor")
async def websocket_mentor(websocket: WebSocket):
    """
    Эндпоинт для ИИ-ментора (используется вашим React-компонентом).
    """
    await websocket.accept()

    token = websocket.query_params.get("token")
    
    user_data = await verify_token(token)
    if not user_data:
        print(f"❌ [Mentor] Отклонено: невалидный токен ({token})")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = str(user_data.get("user_id"))
    print(f"✅ [Mentor] Подключён пользователь {user_id}")

    await manager.connect(websocket, user_id)

    try:
        while True:
            # Получаем код от React-фронтенда
            data = await websocket.receive_text()
            
            message = {"user_id": user_id, "code": data}

            # Отправляем в песочницу (как в вашей текущей логике)
            await redis.publish(CHANNEL_SUBMIT, json.dumps(message))
            
            # Если нужно также дублировать ментору:
            await redis.publish(CHANNEL_MENTOR_IN, json.dumps(message))

    except WebSocketDisconnect:
        print(f"🔌 [Mentor] Отключился пользователь {user_id}")
    except Exception as e:
        print(f"⚠️ [Mentor] Ошибка: {e}")
    finally:
        manager.disconnect(user_id)

#для того чтобы в будущем не отправляя на проверку просто выполнить в терминале
@router.websocket("/ws/code/{user_id}")
async def websocket_code(websocket: WebSocket, user_id: str):
    """
    Канал для отправки кода напрямую с проверкой владельца токена.
    """
    await websocket.accept()

    token = websocket.query_params.get("token")
    
    user_data = await verify_token(token)
    if not user_data:
        print(f"❌ [Code] Отклонено: токен отсутствует или невалиден")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Проверка: совпадает ли ID из токена с ID в URL
    authenticated_user_id = str(user_data.get("user_id"))
    if authenticated_user_id != user_id:
        print(f"❌ [Code] Доступ запрещен: {authenticated_user_id} != {user_id}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    print(f"✅ [Code] Авторизован прямой канал для {user_id}")
    await manager.connect(websocket, user_id)

    try:
        while True:
            code = await websocket.receive_text()
            await redis.publish(
                CHANNEL_SUBMIT, 
                json.dumps({"user_id": user_id, "code": code})
            )
    except WebSocketDisconnect:
        print(f"🔌 [Code] Отключился пользователь {user_id}")
    finally:
        manager.disconnect(user_id)
