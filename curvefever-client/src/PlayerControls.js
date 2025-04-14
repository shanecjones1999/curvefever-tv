import React, { useState, useEffect } from "react";

const PlayerControls = ({ ws, playerId }) => {
    const [buttonState, setButtonState] = useState({
        left: false,
        right: false,
    });

    const sendMovementState = (left, right) => {
        if (ws) {
            ws.send(
                JSON.stringify({
                    type: "move",
                    playerId,
                    state: { left, right },
                })
            );
        }
    };

    const handleStart = (dir, e) => {
        e?.preventDefault();
        setButtonState((prevState) => {
            const newState = { ...prevState, [dir]: true };
            sendMovementState(newState.left, newState.right);
            return newState;
        });
    };

    const handleEnd = (dir, e) => {
        e?.preventDefault();
        setButtonState((prevState) => {
            const newState = { ...prevState, [dir]: false };
            sendMovementState(newState.left, newState.right);
            return newState;
        });
    };

    const handleKeyDown = (event) => {
        if (event.key === "ArrowLeft") handleStart("left", event);
        else if (event.key === "ArrowRight") handleStart("right", event);
    };

    const handleKeyUp = (event) => {
        if (event.key === "ArrowLeft") handleEnd("left", event);
        else if (event.key === "ArrowRight") handleEnd("right", event);
    };

    useEffect(() => {
        if (ws) {
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "tv_disconnect") {
                    alert("The host (TV) has disconnected. The game will end.");
                    window.location.href = "/";
                }
            };
        }

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return (
        <div className="flex justify-center mt-6 gap-8">
            <button
                className={`w-28 h-28 rounded-full bg-blue-600 text-white text-lg font-semibold select-none touch-none transition-transform duration-100 ${
                    buttonState.left ? "scale-95 ring-4 ring-blue-300" : ""
                }`}
                onTouchStart={(e) => handleStart("left", e)}
                onTouchEnd={(e) => handleEnd("left", e)}
                onMouseDown={(e) => handleStart("left", e)}
                onMouseUp={(e) => handleEnd("left", e)}
                onMouseLeave={(e) => handleEnd("left", e)}
                draggable={false}
            >
                Left
            </button>

            <button
                className={`w-28 h-28 rounded-full bg-green-600 text-white text-lg font-semibold select-none touch-none transition-transform duration-100 ${
                    buttonState.right ? "scale-95 ring-4 ring-green-300" : ""
                }`}
                onTouchStart={(e) => handleStart("right", e)}
                onTouchEnd={(e) => handleEnd("right", e)}
                onMouseDown={(e) => handleStart("right", e)}
                onMouseUp={(e) => handleEnd("right", e)}
                onMouseLeave={(e) => handleEnd("right", e)}
                draggable={false}
            >
                Right
            </button>
        </div>
    );
};

export default PlayerControls;

// import React, { useState, useEffect } from "react";

// const PlayerControls = ({ ws, playerId }) => {
//     const [buttonState, setButtonState] = useState({
//         left: false,
//         right: false,
//     });

//     const sendMovementState = (left, right) => {
//         if (ws) {
//             ws.send(
//                 JSON.stringify({
//                     type: "move",
//                     playerId: playerId,
//                     state: { left, right },
//                 })
//             );
//         }
//     };

//     const handleStart = (dir, e) => {
//         e?.preventDefault();
//         setButtonState((prevState) => {
//             const newState = { ...prevState, [dir]: true };
//             sendMovementState(newState.left, newState.right);
//             return newState;
//         });
//     };

//     const handleEnd = (dir, e) => {
//         e?.preventDefault();
//         setButtonState((prevState) => {
//             const newState = { ...prevState, [dir]: false };
//             sendMovementState(newState.left, newState.right);
//             return newState;
//         });
//     };

//     // Keyboard controls
//     const handleKeyDown = (event) => {
//         if (event.key === "ArrowLeft") handleStart("left", event);
//         else if (event.key === "ArrowRight") handleStart("right", event);
//     };

//     const handleKeyUp = (event) => {
//         if (event.key === "ArrowLeft") handleEnd("left", event);
//         else if (event.key === "ArrowRight") handleEnd("right", event);
//     };

//     useEffect(() => {
//         ws.onmessage = (event) => {
//             const data = JSON.parse(event.data);
//             if (data.type === "tv_disconnect") {
//                 alert("The host (TV) has disconnected. The game will end.");
//                 window.location.href = "/";
//             }
//         };

//         window.addEventListener("keydown", handleKeyDown);
//         window.addEventListener("keyup", handleKeyUp);

//         return () => {
//             window.removeEventListener("keydown", handleKeyDown);
//             window.removeEventListener("keyup", handleKeyUp);
//         };
//     }, []);

//     const baseStyle = {
//         display: "inline-block",
//         width: "120px",
//         height: "120px",
//         borderRadius: "50%",
//         lineHeight: "120px",
//         fontSize: "18px",
//         textAlign: "center",
//         cursor: "pointer",
//         userSelect: "none",
//         WebkitUserSelect: "none",
//         WebkitTouchCallout: "none",
//         touchAction: "none",
//         color: "white",
//     };

//     return (
//         <div style={{ textAlign: "center", marginTop: "20px" }}>
//             <div
//                 className="touch-control"
//                 onTouchStart={(e) => handleStart("left", e)}
//                 onTouchEnd={(e) => handleEnd("left", e)}
//                 onMouseDown={(e) => handleStart("left", e)}
//                 onMouseUp={(e) => handleEnd("left", e)}
//                 onMouseLeave={(e) => handleEnd("left", e)}
//                 draggable={false}
//                 style={{
//                     ...baseStyle,
//                     backgroundColor: "#007bff",
//                     marginRight: "20px",
//                 }}
//             >
//                 Left
//             </div>
//             <div
//                 className="touch-control"
//                 onTouchStart={(e) => handleStart("right", e)}
//                 onTouchEnd={(e) => handleEnd("right", e)}
//                 onMouseDown={(e) => handleStart("right", e)}
//                 onMouseUp={(e) => handleEnd("right", e)}
//                 onMouseLeave={(e) => handleEnd("right", e)}
//                 draggable={false}
//                 style={{
//                     ...baseStyle,
//                     backgroundColor: "#28a745",
//                 }}
//             >
//                 Right
//             </div>
//         </div>
//     );
// };

// export default PlayerControls;
