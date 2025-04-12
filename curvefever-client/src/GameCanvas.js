import React, { useEffect, useRef } from "react";

const GameCanvas = ({ players }) => {
    const canvasRef = useRef(null);
    const animationFrameIdRef = useRef(null);
    const playersRef = useRef(players);

    // Keep the latest players in a ref so we don't retrigger the effect
    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use latest players from ref
            playersRef.current.forEach((player) => {
                player.draw(ctx);
            });

            animationFrameIdRef.current = requestAnimationFrame(draw);
        };

        draw(); // Initial call

        return () => {
            cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, []); // Run once on mount — don't depend on players

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ border: "1px solid #000", marginTop: "20px" }}
        />
    );
};

export default GameCanvas;

// import React, { useEffect, useRef } from "react";

// const GameCanvas = ({ players }) => {
//     const canvasRef = useRef(null);
//     const animationFrameIdRef = useRef(null); // Store animation frame ID

//     useEffect(() => {
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");

//         // Function to draw players
//         const drawPlayers = () => {
//             ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

//             players.forEach((player) => {
//                 player.draw(ctx);
//             });

//             // Request the next animation frame
//             animationFrameIdRef.current = requestAnimationFrame(drawPlayers);
//         };

//         drawPlayers(); // Start the animation loop

//         return () => {
//             cancelAnimationFrame(animationFrameIdRef.current); // Stop animation on unmount
//         };
//     }, [players]); // Depend on `players`, so the loop restarts when they change

//     return (
//         <canvas
//             ref={canvasRef}
//             width={800}
//             height={600}
//             style={{ border: "1px solid #000", marginTop: "20px" }}
//         ></canvas>
//     );
// };

// export default GameCanvas;
