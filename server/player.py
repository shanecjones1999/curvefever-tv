import math


class Player:

    def __init__(self, id, room_code, name, radius, color):
        self.id = id
        self.room_code = room_code
        self.name = name
        self.x = 100
        self.y = 100
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
        self.trail = []

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
        }

    def update_position(self):
        """Update player's position based on current movement state."""
        # Update angle if turning
        if self.left_pressed:
            self.angle -= self.turning_speed
        if self.right_pressed:
            self.angle += self.turning_speed

        # Move forward in the direction of the current angle
        self.x += self.speed * math.cos(self.angle)
        self.y += self.speed * math.sin(self.angle)

        if self.x > 800:
            self.x = 0

        if self.x < 0:
            self.x = 800

        if self.y > 600:
            self.y = 0

        if self.y < 0:
            self.y = 600