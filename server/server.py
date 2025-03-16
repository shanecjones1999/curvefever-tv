from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List
from fastapi.middleware.cors import CORSMiddleware
import json
import sys
import os
import asyncio

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from player import Player

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Store player names mapped to WebSocket connections
players: Dict[WebSocket, Player] = {}
tv_client: WebSocket = None  # The TV connection


@app.websocket("/ws/{client_type}/{name}")
async def websocket_endpoint(websocket: WebSocket, client_type: str,
                             name: str):
    global tv_client
    await websocket.accept()

    if client_type == "tv":
        tv_client = websocket
    else:
        player = Player(name)
        players[websocket] = player
        await broadcast_lobby()

    try:
        while True:
            message = await websocket.receive_text()

            parsed_message = json.loads(message)

            if client_type == "tv" and parsed_message.get(
                    "type") == "start_game":
                await start_game()

            elif client_type == "player" and parsed_message.get(
                    "type") == "move":
                player = players[websocket]
                print(parsed_message.get("player"),
                      parsed_message.get("direction"))
    except WebSocketDisconnect:
        if client_type == "tv":
            tv_client = None
        else:
            players.pop(websocket, None)
            await broadcast_lobby()


async def broadcast_lobby():
    """Send the updated player list to the TV."""
    if tv_client:
        name_list = []
        for player in players.values():
            name_list.append(player.name)
        # player_list = list(players.values())
        await tv_client.send_json({"type": "lobby", "players": name_list})


async def start_game():
    """Send game start event to all players and TV."""
    for ws in list(players.keys()):
        try:
            await ws.send_json({"type": "game_start"})
        except WebSocketDisconnect:
            players.pop(ws, None)

    if tv_client:
        await tv_client.send_json({"type": "game_start"})


async def game_loop():
    """Continuously update player positions and send game state."""
    global game_running
    while game_running:
        # TODO: Update player positions based on their movement direction
        for player in players.values():
            player.update_position(
            )  # Implement movement logic in Player class

        # Broadcast the updated game state to all clients
        await broadcast_game_state()

        # Wait before the next update (adjust time step as needed)
        await asyncio.sleep(0.05)  # 50ms update interval


async def broadcast_game_state():
    """Send updated player positions to TV and players."""
    game_state = {
        "type": "game_update",
        "players": {
            name: {
                "x": player.x,
                "y": player.y
            }
            for name, player in players.items()
        }
    }

    for ws in list(players.keys()):
        try:
            await ws.send_json(game_state)
        except WebSocketDisconnect:
            players.pop(ws, None)

    if tv_client:
        await tv_client.send_json(game_state)
