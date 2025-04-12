import random
from typing import Dict, List


class TrailPoint:

    def __init__(self, x, y):
        self.x = x
        self.y = y


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

    def create_segment(self):
        if self.get_last_segment().segment_length() >= 100:
            self.segments.append(TrailSegment())

    def add_point(self, x, y):
        point = TrailPoint(x, y)
        last_segment = self.get_last_segment()
        last_segment.add_point(point)

    def get_last_segment(self):
        return self.segments[len(self.segments) - 1]
