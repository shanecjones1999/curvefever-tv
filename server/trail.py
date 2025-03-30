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


class Trail:

    def __init__(self, gap_chance=0.05):
        self.segments: List[TrailSegment] = [TrailSegment()]
        self.gap_chance = gap_chance

    def create_segment(self):
        if random.random() > self.gap_chance:
            self.segments.append(TrailSegment())

    def add_point(self, x, y):
        point = TrailPoint(x, y)
        last_segment = self.get_last_segment()
        last_segment.add_point(point)

    def get_last_segment(self):
        return self.segments[len(self.segments) - 1]
