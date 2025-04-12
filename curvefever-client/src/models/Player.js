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

    // drawTrail(ctx) {
    //     this.trail.forEach((point) => {
    //         ctx.beginPath();
    //         ctx.arc(point.x, point.y, this.radius, 0, Math.PI * 2);
    //         ctx.fillStyle = this.color;
    //         ctx.fill();
    //     });
    // }

    drawTrail(ctx) {
        if (this.trail.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);

        for (let i = 1; i < this.trail.length; i += 2) {
            // skip every 2nd point
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.radius * 2; // simulate circle thickness
        ctx.lineCap = "round";
        ctx.stroke();
    }

    reset() {
        this.trail = [];
        this.x = undefined;
        this.y = undefined;
    }
}
