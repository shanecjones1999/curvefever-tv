import math


class Player:

    def __init__(self, name):
        self.name = name
        self.x = 100
        self.y = 100
        self.angle = 0
        self.left_pressed = False
        self.right_pressed = False
        self.speed = 2
        self.turning_speed = 0.04

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