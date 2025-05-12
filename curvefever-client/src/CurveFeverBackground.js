import { useEffect, useRef } from "react";
import { Player } from "./models/Player";

export default function CurveFeverBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d"),
            maxTrailLength = 1000;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const radius = 5;
        const speed = 1.8;
        let numPlayers = 5;

        // const names = ["Alice", "Bob", "Carol", "Dave", "Erin"];

        const colors = [
            "rgb(1, 115, 90)",
            "rgb(115, 50, 1)",
            "rgb(115, 1, 83)",
            "rgb(0, 96, 161)",
            "rgb(126, 161, 0)",
        ];

        function createPlayers(numPlayers) {
            const players = [];

            for (let i = 0; i < numPlayers; i++) {
                const player = new Player(i, "", radius, colors[i], false);
                const side = Math.floor(Math.random() * 4);
                switch (side) {
                    case 0: // Top
                        player.x = Math.random() * width;
                        player.y = 0;
                        break;
                    case 1: // Right
                        player.x = width;
                        player.y = Math.random() * height;
                        break;
                    case 2: // Bottom
                        player.x = Math.random() * width;
                        player.y = height;
                        break;
                    case 3: // Left
                        player.x = 0;
                        player.y = Math.random() * height;
                        break;
                }
                player.angle = Math.random() * Math.PI * 2;
                players.push(player);
            }

            return players;
        }

        const players = createPlayers(numPlayers);

        function draw() {
            ctx.fillStyle = "rgba(0, 50, 100, 0.2)";
            ctx.clearRect(0, 0, width, height);

            players.forEach((player) => {
                player.angle += (Math.random() - 0.5) * 0.2;
                player.x += Math.cos(player.angle) * speed;
                player.y += Math.sin(player.angle) * speed;

                if (player.x < 0) player.x = width;
                if (player.x > width) player.x = 0;
                if (player.y < 0) player.y = height;
                if (player.y > height) player.y = 0;

                player.update(player.x, player.y, false, 0);
                if (player.trail.length > maxTrailLength) {
                    player.trail.shift();
                }

                player.draw(ctx);
            });
        }

        let frameId;
        function animate() {
            draw();
            frameId = requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed top-0 bg-gray-700 left-0 w-screen h-screen z-[-1]"
            />
            <div className="fixed top-0 left-0 w-screen h-screen bg-gray-700/50 z-[-1]" />
        </>
    );
}
