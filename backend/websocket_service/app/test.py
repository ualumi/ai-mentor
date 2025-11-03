import asyncio
import websockets

async def test_ws():
    uri = "ws://localhost:8000/ws/mentor/test_user"
    async with websockets.connect(uri) as websocket:
        await websocket.send("print('Hello')")
        response = await websocket.recv()
        print("Ответ:", response)

asyncio.run(test_ws())