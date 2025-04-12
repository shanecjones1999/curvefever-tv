from fastapi import WebSocket
from player import Player
from typing import Dict


class TvClient:

    def __init__(self, socket: WebSocket):
        self.socket = socket

    async def broadcast_lobby(self, players: Dict[str, Player]):
        if not self.socket:
            raise Exception("No websocket set")

        player_dict = {
            player.id: player.to_json()
            for player in players.values()
        }

        await self.socket.send_json({"type": "lobby", "players": player_dict})

    async def reset_round(self):
        await self.socket.send_json({"type": "reset_round"})
