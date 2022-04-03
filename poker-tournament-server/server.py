import asyncio
import json
from random import choice
import websockets

clients = dict()
control_panels = dict()

VALID_IDS = set([str(n) for n in range(1000)])
REQ_ID = "requested_id"

# TODO: Handle disconnects
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
            await handle_start(msg["tables"] if "tables" in msg else None)


async def handle_start(tables):
    websockets.broadcast(get_connected_clients(),
                         json.dumps({"cmd": "load", "table": tables}))
    websockets.broadcast(get_connected_clients(),
                         json.dumps({"cmd": "start"}))


async def handle_connect(websocket, msg):
    id = choice(list(VALID_IDS - clients.keys() - control_panels.keys()))  
    if REQ_ID in msg:
        if msg[REQ_ID] in VALID_IDS and not is_connected(clients, msg[REQ_ID]) and not is_connected(control_panels, msg[REQ_ID]):
            id = msg[REQ_ID]

    await websocket.send(json.dumps({"cmd": "ACK", "clientId": id}))

    if "type" in msg and msg["type"] == "client":
        clients[id] = websocket
        print(f"Client '{id}' connected!")
        websockets.broadcast(get_connected_control_panels(),
                             get_active_clients_ids())

    if "type" in msg and msg["type"] == "controlPanel":
        control_panels[id] = websocket
        await websocket.send(get_active_clients_ids())


def is_connected(dict: dict, id: str):
    if id in dict.keys():
        if dict[id] is not None and dict[id].open:
            print("ID CONFLICT :(")
            return True
    return False

def get_active_clients_ids():
    return json.dumps({
        "cmd": "clients",
        "clients": [k for k, v in clients.items() if not v.closed],
    })


def get_connected_control_panels():
    return [cp for cp in control_panels.values() if not cp.closed]


def get_connected_clients():
    return [c for c in clients.values() if not c.closed]


async def main():
    async with websockets.serve(connect, "localhost", 8765):
        await asyncio.Future()  # run forever

asyncio.run(main())
