from player import Player
from tv_client import TvClient
from typing import Dict, List, Optional, Tuple
from fastapi import WebSocket
import asyncio
import random
import math
import time
from trail import Trail, TrailPoint, TrailSegment


class Game:

    def __init__(self, room_code: str):
        self.room_code = room_code
        self.started = False
        self.game_over = False
        self.width = 800
        self.height = 600
        self.hole_frequency = 100  # Frames between new hole generation
        self.hole_size = 100
        self.round_number = 0
        self.scores = {}
        self.players: Dict[str, Player] = {}  # player.id -> Player
        self.sockets: Dict[str, WebSocket] = {}  # player.id -> WebSocket
        self.tv_client: Optional[TvClient] = None
        self.frame_rate = 1 / 60
        self.frame_count = 0
        self.game_over = False

    def add_tv_client(self, tv_client: TvClient):
        if self.tv_client:
            raise Exception("tv_client already set")

        self.tv_client = tv_client

    def add_player(self, player: Player, socket: WebSocket):
        if player.id in self.players or player.id in self.sockets:
            raise Exception("duplicate player added")

        self.players[player.id] = player
        self.sockets[player.id] = socket
        # Initialize player score if not already set
        if player.id not in self.scores:
            self.scores[player.id] = 0

    def update_player_positions(self):
        for player in self.players.values():
            if not player.eliminated:
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

    def reset_round(self):
        self.frame_count = 0

        start_positions = self.generate_starting_positions(len(self.players))

        for player in self.players.values():
            player.reset()
            player.x = 300
            player.y = 300

    def generate_starting_positions(self,
                                    num_players: int) -> List[Tuple[int, int]]:
        positions = []
        spacing = self.width / (num_players + 1)

        for i in range(1, num_players + 1):
            x = int(spacing * i - (4))
            y = int(self.height * 0.8)  # Start near bottom
            positions.append((x, y))

        return positions

    def start_round(self):
        self.round_number += 1
        self.reset_round()

    async def start_game(self):
        for socket in self.sockets.values():
            await socket.send_json({"type": "game_start"})

        await self.tv_client.socket.send_json({"type": "game_start"})

        self.started = True
        self.start_round()

    async def end_round(self):
        await asyncio.sleep(3)
        await self.tv_client.reset_round()

        if self.round_number >= 3:
            await self.end_game()
        else:
            self.start_round()

    async def end_game(self):
        self.game_over = True

    async def game_loop(self):
        """Continuously update player positions and send game state."""
        while not self.game_over:
            self.frame_count += 1

            self.update_player_positions()

            for player in self.players.values():
                self.check_collision(player)

            round_over = self.is_round_over()
            if round_over:
                await self.end_round()

            await self.broadcast_game_state()

            await asyncio.sleep(self.frame_rate)

    async def broadcast_game_state(self):
        """Send updated player positions to TV and players."""
        player_dict = {
            player.id: player.to_json()
            for player in self.players.values()
        }

        game_state = {
            "type": "game_update",
            "players": player_dict,
            "round": self.round_number,
            "scores": self.scores
        }

        await self.tv_client.socket.send_json(game_state)

    def is_round_over(self):
        eliminated_count = 0
        for player in self.players.values():
            if player.eliminated:
                eliminated_count += 1

        if len(self.players) == 1:
            return eliminated_count == 1
        else:
            return eliminated_count >= len(self.players) - 1

    def check_collision(self, player: Player):
        """Check if the player collides with any trail, including their own."""
        for other_player in self.players.values():
            for segment in other_player.trail.segments:
                # Skip checking recent points to prevent immediate self-collision
                if other_player == player:
                    trail_points = segment.points[:-10]
                else:
                    trail_points = segment.points

                for point in trail_points:
                    if self.is_colliding(player, point):
                        player.eliminated = True

    def is_colliding(self, player: Player, point: TrailPoint):
        """Check if a player's position overlaps with a given trail point."""
        distance = math.sqrt((player.x - point.x)**2 + (player.y - point.y)**2)
        return distance < player.radius