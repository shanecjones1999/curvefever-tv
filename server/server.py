from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List
import uuid
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Store player names mapped to WebSocket connections
players: Dict[WebSocket, str] = {}
tv_client: WebSocket = None  # The TV connection


@app.websocket("/ws/{client_type}/{name}")
async def websocket_endpoint(websocket: WebSocket, client_type: str, name: str):
    global tv_client
    await websocket.accept()

    if client_type == "tv":
        tv_client = websocket
    else:
        players[websocket] = name
        await broadcast_lobby()

    try:
        while True:
            message = await websocket.receive_text()
            if client_type == "tv" and message == "start_game":
                await start_game()
    except WebSocketDisconnect:
        if client_type == "tv":
            tv_client = None
        else:
            players.pop(websocket, None)
            await broadcast_lobby()

async def broadcast_lobby():
    """Send the updated player list to the TV."""
    if tv_client:
        player_list = list(players.values())
        await tv_client.send_json({"type": "lobby", "players": player_list})

async def start_game():
    """Send game start event to all players and TV."""
    for ws in list(players.keys()):
        try:
            await ws.send_json({"type": "game_start"})
        except WebSocketDisconnect:
            players.pop(ws, None)

    if tv_client:
        await tv_client.send_json({"type": "game_start"})