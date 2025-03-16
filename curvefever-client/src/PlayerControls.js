import React, { useState, useEffect } from "react";

const PlayerControls = ({ ws, playerName }) => {
    // Track button states
    const [buttonState, setButtonState] = useState({
        left: false,
        right: false,
    });

    // Send movement state when it updates
    useEffect(() => {
        ws.send(
            JSON.stringify({
                type: "move",
                player: playerName,
                state: buttonState,
            })
        );
    }, [buttonState, playerName, ws]);

    const handleMouseDown = (dir) => {
        console.log(`Mouse down: ${dir}`);
        setButtonState((prev) => ({ ...prev, [dir]: true }));
    };

    const handleMouseUp = (dir) => {
        console.log(`Mouse up: ${dir}`);
        setButtonState((prev) => ({ ...prev, [dir]: false }));
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
                onMouseDown={() => handleMouseDown("left")}
                onMouseUp={() => handleMouseUp("left")}
                style={{ padding: "20px", marginRight: "10px" }}
            >
                Left
            </button>
            <button
                onMouseDown={() => handleMouseDown("right")}
                onMouseUp={() => handleMouseUp("right")}
                style={{ padding: "20px" }}
            >
                Right
            </button>
        </div>
    );
};

export default PlayerControls;

// import React, { useState, useEffect } from "react";

// const PlayerControls = ({ ws, playerName }) => {
//     const [direction, setDirection] = useState(null);

//     useEffect(() => {
//         // Send movement direction to the server when direction changes
//         // ws.send(
//         //     JSON.stringify({
//         //         type: "move",
//         //         player: playerName,
//         //         direction: direction,
//         //     })
//         // );
//     }, [direction, playerName, ws]);

//     const handleMouseDown = (dir) => {
//         console.log("Mouse down, direction:", dir); // Debugging log
//         setDirection(dir); // Set the direction based on mouse down
//         ws.send(
//             JSON.stringify({
//                 type: "move",
//                 player: playerName,
//                 direction: dir,
//             })
//         );
//     };

//     const handleMouseUp = () => {
//         console.log("Mouse up"); // Debugging log
//         setDirection(null); // Stop movement when mouse up
//         ws.send(
//             JSON.stringify({
//                 type: "move",
//                 player: playerName,
//                 direction: null,
//             })
//         );
//     };

//     return (
//         <div style={{ textAlign: "center", marginTop: "20px" }}>
//             <button
//                 onMouseDown={() => handleMouseDown("left")}
//                 onMouseUp={handleMouseUp}
//                 style={{ padding: "20px", marginRight: "10px" }}
//             >
//                 Left
//             </button>
//             <button
//                 onMouseDown={() => handleMouseDown("right")}
//                 onMouseUp={handleMouseUp}
//                 style={{ padding: "20px" }}
//             >
//                 Right
//             </button>
//         </div>
//     );
// };

// export default PlayerControls;
