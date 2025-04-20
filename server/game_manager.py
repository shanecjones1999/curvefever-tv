from typing import Dict, List, Optional
from player import Player
from game import Game


class GameManager:

    def __init__(self):
        self.games: Dict[str, Game] = {}

    def create_game(self, room_code: str) -> Game:
        if room_code in self.games:
            raise KeyError
        self.games[room_code] = Game(room_code)
        return self.games[room_code]

    def get_game(self, room_code) -> Game | None:
        return self.games.get(room_code, None)

    def remove_game(self, room_code: str) -> None:
        if room_code not in self.games:
            raise KeyError
        self.games.pop(room_code)