import asyncio
import json
from random import choice
import websockets

clients = dict()
controlPanels = dict()

VALID_IDS = set([str(n) for n in range(1000)])

# TODO: Handle disconnects
# TODO: Browser localstorage save id?
# TODO: Handle tables

async def connect(websocket, path):
    async for message in websocket:
        print(f"Got message { message}")
        msg = json.loads(message)
        if "cmd" not in msg:
            print(f"Message unknown: {message}")
            return
        if msg["cmd"] == "connect":
            await handle_connect(websocket, msg)

        if msg["cmd"] == "start":
            await handle_start()


async def handle_start():
    websockets.broadcast(get_connected_clients(),
                         json.dumps({"cmd": "start", "table": 1}))


async def handle_connect(websocket, msg):
    id = choice(list(VALID_IDS - clients.keys() - controlPanels.keys()))
    await websocket.send(json.dumps({"cmd": "ACK", "clientId": id}))

    if "type" in msg and msg["type"] == "client":
        clients[id] = websocket
        print(f"Client '{id}' connected!")
        websockets.broadcast(get_connected_control_panels(),
                             get_active_clients_ids())

    if "type" in msg and msg["type"] == "controlPanel":
        controlPanels[id] = websocket
        await websocket.send(get_active_clients_ids())


def get_active_clients_ids():
    return json.dumps({
        "cmd": "clients",
        "clients": [k for k, v in clients.items() if not v.closed],
    })


def get_connected_control_panels():
    return [cp for cp in controlPanels.values() if not cp.closed]


def get_connected_clients():
    return [c for c in clients.values() if not c.closed]


async def main():
    async with websockets.serve(connect, "localhost", 8765):
        await asyncio.Future()  # run forever

asyncio.run(main())
