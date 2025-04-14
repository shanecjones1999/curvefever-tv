import React, { useEffect, useRef } from "react";

const GameCanvas = ({ players }) => {
    const canvasRef = useRef(null);
    const animationFrameIdRef = useRef(null);
    const playersRef = useRef(players);

    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            playersRef.current.forEach((player) => player.draw(ctx));
            animationFrameIdRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, []);

    return (
        <div className="flex justify-center mt-6">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-white shadow-lg bg-gray-900"
            />
        </div>
    );
};

export default GameCanvas;

// import React, { useEffect, useRef } from "react";

// const GameCanvas = ({ players }) => {
//     const canvasRef = useRef(null);
//     const animationFrameIdRef = useRef(null);
//     const playersRef = useRef(players);

//     useEffect(() => {
//         playersRef.current = players;
//     }, [players]);

//     useEffect(() => {
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");

//         const draw = () => {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);

//             playersRef.current.forEach((player) => {
//                 player.draw(ctx);
//             });

//             animationFrameIdRef.current = requestAnimationFrame(draw);
//         };

//         draw();

//         return () => {
//             cancelAnimationFrame(animationFrameIdRef.current);
//         };
//     }, []);

//     return (
//         <canvas
//             ref={canvasRef}
//             width={800}
//             height={600}
//             style={{ border: "1px solid #000", marginTop: "20px" }}
//         />
//     );
// };

// export default GameCanvas;
