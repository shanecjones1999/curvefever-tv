from fastapi import WebSocket


class TvClient:

    def __init__(self, socket: WebSocket):
        self.socket = socket