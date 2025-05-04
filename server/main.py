from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from typing import Dict, List
from fastapi.middleware.cors import CORSMiddleware
import json
import sys
import os
import uuid
import random
import asyncio
from pydantic import BaseModel

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
    room_code = str(uuid.uuid4().hex[:4]).upper()
    game_manager.create_game(room_code)
    return {"room_code": room_code}


@app.get("/check_player")
def check_player(room_code: str, player_id: str):
    game = game_manager.get_game(room_code)
    if game and game.started and game.players.get(player_id):
        return {"active": True, "room_code": room_code, "player_id": player_id}
    return {"active": False}


@app.get("/check_room")
def check_player(room_code: str):
    game = game_manager.get_game(room_code)
    if game and not game.started:
        return {"active": True, "room_code": room_code}
    return {"active": False}


class JoinRoomRequest(BaseModel):
    room_code: str
    name: str


class JoinRoomResponse(BaseModel):
    player_id: str
    room_code: str
    name: str


@app.post("/join_room", response_model=JoinRoomResponse)
def join_room(request: JoinRoomRequest):
    room_code = request.room_code.upper()
    player_name = request.name.strip()

    if not player_name:
        raise HTTPException(status_code=400, detail="Player name is required")

    game = game_manager.get_game(room_code)
    if not game or game.started:
        raise HTTPException(status_code=404, detail="Room not found")

    player_id = str(uuid.uuid4().hex[:8])

    return JoinRoomResponse(player_id=player_id,
                            room_code=room_code,
                            name=player_name)


@app.websocket("/ws/{room_code}/{client_type}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_code: str,
                             client_type: str, client_id: str):
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
                    game = game_manager.get_game(room_code)
                    if not game:
                        await websocket.send_json(
                            {"type": "invalid_room_code"})
                        return

                    if client_id in game.sockets:
                        game.sockets[client_id] = websocket
                        player = game.players[client_id]
                        player_state = game.get_player_state(player)
                        await websocket.send_json({
                            "type": "player_state_update",
                            "playerState": player_state
                        })

                    else:
                        r = random.randint(180, 255)
                        g = random.randint(180, 255)
                        b = random.randint(180, 255)
                        color = '#{:02x}{:02x}{:02x}'.format(r, g, b)
                        player = Player(client_id, room_code, name, 4, color)

                        game.add_player(player, websocket)
                        await broadcast_lobby(room_code)

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
                    player_id = client_id
                    game.update_player_direction(player_id,
                                                 message['state']['left'],
                                                 message['state']['right'])

    except WebSocketDisconnect:
        print("Disconnecting websocket", client_type)
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
    except Exception as e:
        print(e)


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
