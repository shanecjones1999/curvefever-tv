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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

game_manager = GameManager()


@app.get("/get_room_code")
async def get_room_code():
    room_code = uuid.uuid4().hex[:4]
    game_manager.create_game(room_code)
    return {"room_code": room_code}


@app.websocket("/ws/{room_code}/{client_type}")
async def websocket_endpoint(websocket: WebSocket, room_code: str,
                             client_type: str):
    await websocket.accept()

    game = game_manager.get_game(room_code)
    if not game:
        await websocket.send_json({
            "type": "invalid_room_code",
        })
        await websocket.close()
        return

    if client_type == "tv":
        game = game_manager.get_game(room_code)
        if not game:
            raise Exception("Missing game")
        tv_client = TvClient(websocket)
        game.add_tv_client(tv_client)

    try:
        while True:
            message = await websocket.receive_json()

            if client_type == "tv":
                if message["type"] == "start_game":
                    await start_game(room_code)
                    game = game_manager.get_game(room_code)

            elif client_type == "player":
                if message["type"] == "join":
                    name = message["name"]
                    r = random.randint(180, 255)
                    g = random.randint(180, 255)
                    b = random.randint(180, 255)
                    color = '#{:02x}{:02x}{:02x}'.format(r, g, b)
                    player = Player(uuid.uuid4().hex[:8], room_code, name, 4,
                                    color)

                    game = game_manager.get_game(room_code)
                    if not game:
                        await websocket.send_json(
                            {"type": "invalid_room_code"})
                        return
                    game.add_player(player, websocket)
                    await broadcast_lobby(room_code)

                    await websocket.send_json({
                        "type": "player_info",
                        "playerId": player.id,
                    })

                elif message["type"] == "reconnect":
                    try:
                        player_id = message["player_id"]
                        room_code = message["room_code"]
                        game = game_manager.get_game(room_code)
                        if not game:
                            await websocket.send_json(
                                {"type": "reconnect_failed"})
                            return
                        if player_id in game.players:
                            player = game.players[player_id]
                            game.sockets[player_id] = websocket
                            await websocket.send_json({
                                "type":
                                "reconnect_success",
                                "player":
                                player.to_json()
                            })
                    except:
                        await websocket.send_json({"type": "reconnect_failed"})

                elif message["type"] == "move":
                    game = game_manager.get_game(room_code)
                    if not game:
                        raise Exception("Missing game")
                    player_id = message["playerId"]
                    game.update_player_direction(player_id,
                                                 message['state']['left'],
                                                 message['state']['right'])

    except WebSocketDisconnect:
        print("Disconnecting websocket")
        if client_type == "tv":
            game = game_manager.get_game(room_code)
            if not game:
                return

            # Cancel the running loop task if it exists
            if game.loop_task and not game.loop_task.done():
                game.loop_task.cancel()
                try:
                    await game.loop_task  # clean cancellation
                except asyncio.CancelledError:
                    print(f"Game loop for room {room_code} cancelled.")

            await game.broadcast_tv_disconnect()
            game_manager.remove_game(room_code)
        elif client_type == "player":
            game = game_manager.get_game(room_code)
            if not game or game.started:
                return

            player_id = None
            for pid, sock in game.sockets.items():
                if sock == websocket:
                    player_id = pid
                    break

            if player_id:
                print(f"Removing player {player_id}")
                del game.players[player_id]
                del game.sockets[player_id]
                await game.broadcast_lobby()  # Notify the TV of updated lobby
            else:
                print("Disconnected websocket not found in player_sockets")
        else:
            raise Exception(f"Invalid client_type: {client_type}")


async def broadcast_lobby(room_code: str):
    """Send the updated player list to the TV."""
    game = game_manager.get_game(room_code)
    if not game or game.started:
        return

    await game.broadcast_lobby()


async def start_game(room_code: str):
    """Send game start event to all players and TV."""
    game = game_manager.get_game(room_code)
    if not game:
        raise Exception("Missing game")
    await game.start_game()
