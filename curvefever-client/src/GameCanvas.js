import React, { useEffect, useRef } from "react";

const Canvas = ({ players }) => {
    const canvasRef = useRef(null);
    const animationFrameIdRef = useRef(null); // Store animation frame ID

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Function to draw players
        const drawPlayers = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

            players.forEach((player) => {
                // Draw player (circle)
                ctx.beginPath();
                ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
                ctx.fillStyle = "#007bff"; // Player color
                ctx.fill();
                ctx.stroke();

                // Draw player's name
                ctx.fillStyle = "#000000";
                ctx.font = "14px Arial";
                ctx.fillText(player.name, player.x - 12, player.y - 12);
            });

            // Request the next animation frame
            animationFrameIdRef.current = requestAnimationFrame(drawPlayers);
        };

        drawPlayers(); // Start the animation loop

        return () => {
            cancelAnimationFrame(animationFrameIdRef.current); // Stop animation on unmount
        };
    }, [players]); // Depend on `players`, so the loop restarts when they change

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ border: "1px solid #000", marginTop: "20px" }}
        ></canvas>
    );
};

export default Canvas;

// import React, { useEffect, useRef } from "react";

// const Canvas = ({ players }) => {
//     const canvasRef = useRef(null); // Reference to the canvas element

//     // Function to draw players on the canvas
//     const drawPlayers = () => {
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");

//         // Clear the canvas before drawing
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         if (players) {
//             players.forEach((player) => {
//                 ctx.beginPath();
//                 ctx.arc(player.x, player.y, 10, 0, Math.PI * 2); // Draw a circle
//                 ctx.fillStyle = "#007bff"; // Set player color
//                 ctx.fill(); // Fill the circle
//                 ctx.stroke();
//                 ctx.fillStyle = "#000000"; // Reset color for text
//                 ctx.fillText(player.name, player.x - 12, player.y - 12); // Display player's name
//             });
//         }
//         // Draw each player on the canvas
//     };

//     // Re-draw players whenever the players list changes
//     useEffect(() => {
//         drawPlayers(); // Call the drawing function
//     }, [players]);

//     return (
//         <canvas
//             ref={canvasRef}
//             width={800}
//             height={600}
//             style={{ border: "1px solid #000", marginTop: "20px" }}
//         ></canvas>
//     );
// };

// export default Canvas;
