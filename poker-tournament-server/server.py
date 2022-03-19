import asyncio
import json
import websockets

async def echo(websocket, path):
    await websocket.send(json.dumps({"message": "Welcome"}))
    async for message in websocket:
        print(message)
        await websocket.send(message)

async def main():
    async with websockets.serve(echo, "localhost", 8765):
        await asyncio.Future()  # run forever

asyncio.run(main())
