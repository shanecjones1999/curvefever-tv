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
