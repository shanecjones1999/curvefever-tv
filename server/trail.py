import random
from typing import Dict, List


class TrailPoint:

    def __init__(self, x: int, y: int, player_id: str, game_index: int):
        self.x = x
        self.y = y
        self.player_id = player_id
        self.game_index = game_index


class TrailSegment:

    def __init__(self):
        self.points: List[TrailPoint] = []

    def add_point(self, point: TrailPoint):
        self.points.append(point)

    def segment_length(self):
        return len(self.points)


class Trail:

    def __init__(self, gap_chance=0.05):
        self.segments: List[TrailSegment] = [TrailSegment()]
        # only create a gap if the length of the current segment is X
        self.gap_chance = gap_chance
        self.is_floating = True
        self.float_counter = 0
        self.float_duration = 20

    def create_segment(self):
        self.segments.append(TrailSegment())

    def can_trail_gap(self):
        return self.get_last_segment().segment_length() >= 100

    def add_point(self, x: int, y: int, player_id: str, game_index: int):
        if game_index <= 200:
            self.is_floating = True
            return

        if self.is_floating:
            self.float_counter -= 1
            if self.float_counter <= 0:
                self.is_floating = False
                self.create_segment()
            return

        if self.can_trail_gap(
        ):  # random.random() < self.gap_chance and self.get_last_segment().segment_length() >= 50:
            self.is_floating = True
            self.float_counter = self.float_duration
            return

        point = TrailPoint(x, y, player_id, game_index)
        last_segment = self.get_last_segment()
        last_segment.add_point(point)

    def get_last_segment(self):
        return self.segments[len(self.segments) - 1]
