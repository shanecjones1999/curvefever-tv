import React, { useState, useEffect } from "react";

const PlayerControls = ({ ws, playerId }) => {
    const [buttonState, setButtonState] = useState({
        left: false,
        right: false,
    });

    // Send movement state to the server when the buttonState changes
    const sendMovementState = (left, right) => {
        if (ws) {
            ws.send(
                JSON.stringify({
                    type: "move",
                    playerId: playerId,
                    state: { left, right },
                })
            );
        }
    };

    const handleStart = (dir) => {
        setButtonState((prevState) => {
            const newState = {
                ...prevState,
                [dir]: true,
            };
            sendMovementState(newState.left, newState.right);
            return newState;
        });
    };

    const handleEnd = (dir) => {
        setButtonState((prevState) => {
            const newState = {
                ...prevState,
                [dir]: false,
            };
            sendMovementState(newState.left, newState.right);
            return newState;
        });
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
        if (event.key === "ArrowLeft") {
            handleEnd("left");
        } else if (event.key === "ArrowRight") {
            handleEnd("right");
        }
    };

    // Attach event listeners for keyboard events
    useEffect(() => {
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "tv_disconnect") {
                alert("The host (TV) has disconnected. The game will end.");
                window.location.href = "/";
            }
        };

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
