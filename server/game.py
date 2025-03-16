from player import Player


class Game:

    def __init__(self, players: list[Player]):
        self.players = players

    def update_player_positions(self):
        for player in list(self.players):
            player.update_position()