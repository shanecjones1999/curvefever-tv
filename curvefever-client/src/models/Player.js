export class Player {
    constructor(id, name, x, y, radius, color, eliminated) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.trail = []; // Array to store trail points
        this.color = color;
        this.eliminated = eliminated;
    }

    update(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        this.trail.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.radius, 0, Math.PI * 2); // Small circle for the trail
            ctx.fillStyle = this.color; // Transparent trail color
            ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color; // this color
        ctx.fill();
        //ctx.stroke();

        // Draw this's name
        ctx.fillStyle = "#000000";
        ctx.font = "14px Arial";
        ctx.fillText(this.name, this.x - 12, this.y - 12);

        this.trail.push({ x: this.x, y: this.y });
        //console.log("here", this.x, this.y);
    }

    drawTrail(ctx) {}
}
