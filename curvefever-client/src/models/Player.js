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
        this.score = 0;
    }

    update(x, y, isFloating, score) {
        this.x = x;
        this.y = y;
        this.isFloating = isFloating;
        this.score = score;
    }

    draw(ctx) {
        this.drawTrail(ctx);
        this.drawPlayer(ctx);
        this.drawName(ctx);

        if (!this.isFloating) {
            this.trail.push({ x: this.x, y: this.y });
        }
    }

    drawPlayer(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    drawName(ctx) {
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#000000";
        ctx.fillText(this.name, this.x + 1, this.y - this.radius - 11 + 1);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(this.name, this.x, this.y - this.radius - 11);
    }
    drawTrail(ctx) {
        if (this.trail.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);

        for (let i = 1; i < this.trail.length; i++) {
            const prev = this.trail[i - 1];
            const curr = this.trail[i];

            const dx = Math.abs(curr.x - prev.x);
            const dy = Math.abs(curr.y - prev.y);
            const wrapThreshold = 10; // TODO: Consider adjusting this threshold

            if (dx > wrapThreshold || dy > wrapThreshold) {
                ctx.moveTo(curr.x, curr.y);
            } else {
                ctx.lineTo(curr.x, curr.y);
            }
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.radius * 2;
        ctx.stroke();
    }

    reset() {
        this.trail = [];
        this.x = undefined;
        this.y = undefined;
    }
}
