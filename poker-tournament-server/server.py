import asyncio
import json
from random import choice
import websockets

clients = dict()
controlPanels = dict()

THINGS = [str(n) for n in range(1000)]


async def connect(websocket, path):
    async for message in websocket:
        print(f"Got message { message}")
        msg = json.loads(message)
        if "cmd" not in msg:
            print(f"Message unknown: {message}")
            return
        if msg["cmd"] == "connect":
            id = choice([t for t in THINGS if t not in clients.keys()
                        and t not in controlPanels.keys()])
            await websocket.send(json.dumps({"cmd": "ACK", "clientId": id}))
            if "type" in msg and msg["type"] == "client":
                clients[id] = websocket
                print(f"Client '{id}' connected!")
                for cp in [cp for cp in controlPanels.values() if not cp.closed]:
                    await cp.send(json.dumps({
                        "cmd": "client",
                        "clients": id,
                    }))
            if "type" in msg and msg["type"] == "controlPanel":
                controlPanels[id] = websocket
                await websocket.send(json.dumps({
                    "cmd": "clients",
                    "clients": [k for k, v in clients.items() if not v.closed],
                }))

        if msg["cmd"] == "start":
            for c in clients.values():
                await c.send(json.dumps({"cmd": "start", "table": 1}))


async def main():
    async with websockets.serve(connect, "localhost", 8765):
        await asyncio.Future()  # run forever

asyncio.run(main())
