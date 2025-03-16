import React, { useState, useEffect } from "react";

const PlayerControls = ({ ws, playerName }) => {
    const [buttonState, setButtonState] = useState({
        left: false,
        right: false,
    });

    // Send movement state to server when buttonState changes
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
        setButtonState((prev) => ({ ...prev, [dir]: true }));
    };

    const handleMouseUp = (dir) => {
        setButtonState((prev) => ({ ...prev, [dir]: false }));
    };

    const handleKeyDown = (event) => {
        if (event.key === "ArrowLeft") {
            setButtonState((prev) => ({ ...prev, left: true }));
        } else if (event.key === "ArrowRight") {
            setButtonState((prev) => ({ ...prev, right: true }));
        }
    };

    const handleKeyUp = (event) => {
        if (event.key === "ArrowLeft") {
            setButtonState((prev) => ({ ...prev, left: false }));
        } else if (event.key === "ArrowRight") {
            setButtonState((prev) => ({ ...prev, right: false }));
        }
    };

    // Attach event listeners when the component mounts
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
