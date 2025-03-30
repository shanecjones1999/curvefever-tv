from player import Player
from tv_client import TvClient
from typing import Dict, List, Optional
from fastapi import WebSocket
import asyncio


class Game:

    def __init__(self, room_code: str):
        self.room_code = room_code
        self.started = False
        self.width = 800
        self.height = 600
        self.hole_frequency = 100
        self.hole_size = 100
        self.round_number = 0
        self.scores = {}
        self.players: Dict[str, Player] = {}  # player.id -> Player
        self.sockets: Dict[str, WebSocket] = {}  # player.id -> WebSocket
        self.tv_client: Optional[TvClient] = None
        self.frame_rate = 1 / 60

    def add_tv_client(self, tv_client: TvClient):
        if self.tv_client:
            raise Exception("tv_client already set")

        self.tv_client = tv_client

    def add_player(self, player: Player, socket: WebSocket):
        if player.id in self.players or player.id in self.sockets:
            raise Exception("duplicate player added")

        self.players[player.id] = player
        self.sockets[player.id] = socket

    def update_player_positions(self):
        for player in self.players.values():
            player.update_position()

    async def broadcast_lobby(self):
        await self.tv_client.broadcast_lobby(self.players)

    def update_player_direction(self, player_id: str, left_pressed: bool,
                                right_pressed: bool):
        if player_id not in self.players:
            raise Exception("player not in game")

        player = self.players[player_id]
        player.left_pressed = left_pressed
        player.right_pressed = right_pressed

    async def start_game(self):
        for socket in self.sockets.values():
            await socket.send_json({"type": "game_start"})

        await self.tv_client.socket.send_json({"type": "game_start"})

        self.started = True

    async def game_loop(self):
        """Continuously update player positions and send game state."""
        while True:
            for player in self.players.values():
                player.update_position()

            await self.broadcast_game_state()
            await asyncio.sleep(self.frame_rate)

    async def broadcast_game_state(self):
        """Send updated player positions to TV and players."""

        player_dict = {
            player.id: player.to_json()
            for player in self.players.values()
        }

        game_state = {"type": "game_update", "players": player_dict}

        await self.tv_client.socket.send_json(game_state)
