from player import Player
from tv_client import TvClient
from typing import Dict, List, Optional


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
        self.players: Dict[str, Player] = {}
        self.tv_client: Optional[TvClient] = None

    def add_tv_client(self, tv_client: TvClient):
        if self.tv_client:
            raise Exception("tv_client already set")

        self.tv_client = tv_client

    def add_player(self, player: Player):
        if (player.id) in self.players:
            raise Exception("duplicate player added")
        self.players[player.id] = player

    def update_player_positions(self):
        for player in self.players.values():
            player.update_position()
