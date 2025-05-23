import math
from trail import Trail


class Player:

    def __init__(self, id, room_code, name, radius, color):
        self.id = id
        self.room_code = room_code
        self.name = name
        self.x = 0
        self.y = 0
        self.radius = radius
        self.angle = 0
        self.color = color
        self.radius = 4
        self.left_pressed = False
        self.right_pressed = False
        self.speed = 2
        self.turning_speed = 0.05
        self.eliminated = False
        self.score = 0
        self.trail = Trail()

    def to_json(self):
        return {
            "id": self.id,
            "room_code": self.room_code,
            "name": self.name,
            "x": self.x,
            "y": self.y,
            "radius": self.radius,
            "color": self.color,
            "eliminated": self.eliminated,
            "is_floating": self.trail.is_floating,
            "score": self.score,
        }

    def update_position(self, game_index: int):
        """Update player's position based on current movement state."""
        if self.eliminated:
            return

        if self.left_pressed:
            self.angle -= self.turning_speed
        elif self.right_pressed:
            self.angle += self.turning_speed

        self.x += self.speed * math.cos(self.angle)
        self.y += self.speed * math.sin(self.angle)

        self.trail.add_point(self.x, self.y, self.id, game_index)

    def reset(self):
        self.eliminated = False
        self.trail = Trail()
