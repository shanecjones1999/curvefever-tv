export class Player {
    constructor(id, name, radius, color, eliminated) {
        this.id = id;
        this.name = name;
        this.radius = radius;
        this.trail = [];
        this.color = color;
        this.eliminated = eliminated;
        this.x = undefined;
        this.y = undefined;
        this.isFloating = false;
    }

    update(x, y, isFloating) {
        this.x = x;
        this.y = y;
        this.isFloating = isFloating;
    }

    draw(ctx) {
        this.drawTrail(ctx);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.font = "14px Arial";
        ctx.fillText(this.name, this.x - 12, this.y - 12);
        if (!this.isFloating) {
            this.trail.push({ x: this.x, y: this.y });
        }
    }

    drawTrail(ctx) {
        this.trail.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        });
    }

    reset() {
        this.trail = [];
        this.x = undefined;
        this.y = undefined;
    }
}
