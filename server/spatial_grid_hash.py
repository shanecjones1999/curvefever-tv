from collections import defaultdict
from trail import TrailPoint


class SpatialHashGrid:

    def __init__(self, cell_size):
        self.cell_size = cell_size
        self.cells = defaultdict(list)

    def _hash(self, x, y):
        return (int(x) // self.cell_size, int(y) // self.cell_size)

    def insert(self, point: TrailPoint):
        key = self._hash(point.x, point.y)
        self.cells[key].append(point)

    def get_nearby_points(self, x, y) -> list[TrailPoint]:
        """Get points in the 3x3 grid around the current position."""
        cx, cy = self._hash(x, y)
        nearby = []
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                cell_key = (cx + dx, cy + dy)
                nearby.extend(self.cells.get(cell_key, []))
        return nearby

    def clear(self):
        self.cells.clear()
