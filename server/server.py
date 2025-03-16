from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List
from fastapi.middleware.cors import CORSMiddleware
import json
import sys
import os
import uuid
import random
import asyncio

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from player import Player
from game import Game

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
game_running = False
game = None

frame_rate = 1 / 60


@app.websocket("/ws/{client_type}/{name}")
async def websocket_endpoint(websocket: WebSocket, client_type: str,
                             name: str):
    global tv_client
    await websocket.accept()

    if client_type == "tv":
        tv_client = websocket
    else:
        player = Player(uuid.uuid4().hex[:8], name, 4,
                        "#{:06x}".format(random.randint(0, 0xFFFFFF)))
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
                player.left_pressed = parsed_message['state']['left']
                player.right_pressed = parsed_message['state']['right']

    except WebSocketDisconnect:
        if client_type == "tv":
            tv_client = None
        else:
            players.pop(websocket, None)
            await broadcast_lobby()


async def broadcast_lobby():
    """Send the updated player list to the TV."""
    if tv_client:
        player_dict = {
            player.id: player.to_json()
            for player in players.values()
        }

        await tv_client.send_json({"type": "lobby", "players": player_dict})


async def start_game():
    """Send game start event to all players and TV."""
    global game_running
    game_running = True

    for ws in list(players.keys()):
        try:
            await ws.send_json({"type": "game_start"})
        except WebSocketDisconnect:
            players.pop(ws, None)

    if tv_client:
        await tv_client.send_json({"type": "game_start"})

    global game
    game = Game(players.values())

    asyncio.create_task(game_loop())


async def game_loop():
    """Continuously update player positions and send game state."""
    global game_running
    while game_running:

        global game
        game.update_player_positions()

        # Broadcast the updated game state to all clients
        await broadcast_game_state()

        # Wait before the next update (adjust time step as needed)
        await asyncio.sleep(frame_rate)


async def broadcast_game_state():
    """Send updated player positions to TV and players."""

    player_dict = {player.id: player.to_json() for player in players.values()}

    game_state = {"type": "game_update", "players": player_dict}

    for ws in list(players.keys()):
        try:
            await ws.send_json(game_state)
        except WebSocketDisconnect:
            players.pop(ws, None)

    if tv_client:
        await tv_client.send_json(game_state)
