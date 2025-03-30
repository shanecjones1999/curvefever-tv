import React, { useState, useEffect } from "react";

const PlayerControls = ({ ws, playerName, playerId }) => {
    const [buttonState, setButtonState] = useState({
        left: false,
        right: false,
    });

    // Send movement state to the server when the buttonState changes
    const sendMovementState = (left, right) => {
        if (ws) {
            console.log(playerId);
            ws.send(
                JSON.stringify({
                    type: "move",
                    player: playerName,
                    playerId: playerId,
                    state: { left, right },
                })
            );
        }
    };

    // Handle touch or mouse start (movement starts)
    const handleStart = (dir) => {
        setButtonState((prevState) => ({
            ...prevState,
            [dir]: true,
        }));

        if (dir === "left") {
            sendMovementState(true, false);
        } else if (dir === "right") {
            sendMovementState(false, true);
        }
    };

    // Handle touch or mouse end (movement stops)
    const handleEnd = () => {
        setButtonState({
            left: false,
            right: false,
        });
        sendMovementState(false, false);
    };

    // Handle keydown for arrow keys
    const handleKeyDown = (event) => {
        if (event.key === "ArrowLeft") {
            handleStart("left");
        } else if (event.key === "ArrowRight") {
            handleStart("right");
        }
    };

    // Handle keyup for arrow keys
    const handleKeyUp = (event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            handleEnd();
        }
    };

    // Attach event listeners for keyboard events
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <div
                onTouchStart={() => handleStart("left")}
                onTouchEnd={handleEnd}
                onMouseDown={() => handleStart("left")}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd} // Ensure it stops if the user leaves the button area
                style={{
                    display: "inline-block",
                    width: "120px",
                    height: "120px",
                    backgroundColor: "#007bff",
                    color: "white",
                    borderRadius: "50%",
                    lineHeight: "80px",
                    fontSize: "18px",
                    marginRight: "20px",
                    cursor: "pointer",
                    userSelect: "none", // Prevent text selection
                }}
            />
            <div
                onTouchStart={() => handleStart("right")}
                onTouchEnd={handleEnd}
                onMouseDown={() => handleStart("right")}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd} // Ensure it stops if the user leaves the button area
                style={{
                    display: "inline-block",
                    width: "120px",
                    height: "120px",
                    backgroundColor: "#28a745",
                    color: "white",
                    borderRadius: "50%",
                    lineHeight: "80px",
                    fontSize: "18px",
                    cursor: "pointer",
                    userSelect: "none", // Prevent text selection
                }}
            />
        </div>
    );
};

export default PlayerControls;

// import React, { useState, useEffect } from "react";

// const PlayerControls = ({ ws, playerName }) => {
//     const [buttonState, setButtonState] = useState({
//         left: false,
//         right: false,
//     });

//     // Send movement state to server when buttonState changes
//     useEffect(() => {
//         ws.send(
//             JSON.stringify({
//                 type: "move",
//                 player: playerName,
//                 state: buttonState,
//             })
//         );
//     }, [buttonState, playerName, ws]);

//     const handleMouseDown = (dir) => {
//         setButtonState((prev) => ({ ...prev, [dir]: true }));
//     };

//     const handleMouseUp = (dir) => {
//         setButtonState((prev) => ({ ...prev, [dir]: false }));
//     };

//     const handleKeyDown = (event) => {
//         if (event.key === "ArrowLeft") {
//             setButtonState((prev) => ({ ...prev, left: true }));
//         } else if (event.key === "ArrowRight") {
//             setButtonState((prev) => ({ ...prev, right: true }));
//         }
//     };

//     const handleKeyUp = (event) => {
//         if (event.key === "ArrowLeft") {
//             setButtonState((prev) => ({ ...prev, left: false }));
//         } else if (event.key === "ArrowRight") {
//             setButtonState((prev) => ({ ...prev, right: false }));
//         }
//     };

//     // Attach event listeners when the component mounts
//     useEffect(() => {
//         window.addEventListener("keydown", handleKeyDown);
//         window.addEventListener("keyup", handleKeyUp);

//         return () => {
//             window.removeEventListener("keydown", handleKeyDown);
//             window.removeEventListener("keyup", handleKeyUp);
//         };
//     }, []);

//     return (
//         <div style={{ textAlign: "center", marginTop: "20px" }}>
//             <button
//                 onMouseDown={() => handleMouseDown("left")}
//                 onMouseUp={() => handleMouseUp("left")}
//                 style={{ padding: "20px", marginRight: "10px" }}
//             >
//                 Left
//             </button>
//             <button
//                 onMouseDown={() => handleMouseDown("right")}
//                 onMouseUp={() => handleMouseUp("right")}
//                 style={{ padding: "20px" }}
//             >
//                 Right
//             </button>
//         </div>
//     );
// };

// export default PlayerControls;
