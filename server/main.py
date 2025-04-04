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
from tv_client import TvClient
from player import Player
from game_manager import GameManager

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

game_manager = GameManager()


@app.get("/get_room_code")
async def get_room_code():
    room_code = uuid.uuid4().hex[:4]
    game_manager.create_game(room_code)
    return {"room_code": room_code}


@app.websocket("/ws/{room_code}/{client_type}/{name}")
async def websocket_endpoint(websocket: WebSocket, room_code: str,
                             client_type: str, name: str):
    await websocket.accept()

    if client_type == "tv":
        game = game_manager.get_game(room_code)
        tv_client = TvClient(websocket)
        game.add_tv_client(tv_client)
    else:
        player = Player(uuid.uuid4().hex[:8], room_code, name, 4,
                        "#{:06x}".format(random.randint(0, 0xFFFFFF)))

        game = game_manager.get_game(room_code)
        game.add_player(player, websocket)
        await broadcast_lobby(room_code)

        await websocket.send_json({
            "type": "player_info",
            "playerId": player.id,
        })

    try:
        while True:
            message = await websocket.receive_text()

            parsed_message = json.loads(message)

            if client_type == "tv" and parsed_message["type"] == "start_game":
                await start_game(room_code)

            elif client_type == "player" and parsed_message["type"] == "move":
                game = game_manager.get_game(room_code)
                player_id = parsed_message["playerId"]
                game.update_player_direction(player_id,
                                             parsed_message['state']['left'],
                                             parsed_message['state']['right'])

    except WebSocketDisconnect:
        # TODO: Enhance logic
        print("Disconnecting websocket")
        if client_type == "tv":
            game_manager.remove_game(room_code)
        else:
            await broadcast_lobby(room_code)


async def broadcast_lobby(room_code: str):
    """Send the updated player list to the TV."""
    game = game_manager.get_game(room_code)
    await game.broadcast_lobby()


async def start_game(room_code: str):
    """Send game start event to all players and TV."""
    game = game_manager.get_game(room_code)

    await game.start_game()

    asyncio.create_task(game.game_loop())