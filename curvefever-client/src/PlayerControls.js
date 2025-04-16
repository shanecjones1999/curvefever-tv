import React, { useState, useEffect } from "react";

const PlayerControls = ({ sendDirection, disabled = false }) => {
    const [buttonState, setButtonState] = useState({
        left: false,
        right: false,
    });

    const handleStart = (dir, e) => {
        if (disabled) return;
        e?.preventDefault();
        setButtonState((prevState) => {
            const newState = { ...prevState, [dir]: true };
            sendDirection(newState.left, newState.right);
            return newState;
        });
    };

    const handleEnd = (dir, e) => {
        if (disabled) return;
        e?.preventDefault();
        setButtonState((prevState) => {
            const newState = { ...prevState, [dir]: false };
            sendDirection(newState.left, newState.right);
            return newState;
        });
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (disabled) return;
            if (event.key === "ArrowLeft") handleStart("left", event);
            else if (event.key === "ArrowRight") handleStart("right", event);
        };

        const handleKeyUp = (event) => {
            if (disabled) return;
            if (event.key === "ArrowLeft") handleEnd("left", event);
            else if (event.key === "ArrowRight") handleEnd("right", event);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [disabled]);

    useEffect(() => {
        if (disabled) {
            setButtonState({ left: false, right: false });
            sendDirection(false, false);
        }
    }, [disabled, sendDirection]);

    return (
        <div className="flex justify-center mt-6 gap-8">
            {["left", "right"].map((dir) => (
                <button
                    key={dir}
                    className={`w-28 h-28 rounded-full text-white text-lg font-semibold select-none touch-none transition-transform duration-100 ${
                        dir === "left"
                            ? "bg-blue-600 ring-blue-300"
                            : "bg-green-600 ring-green-300"
                    } ${buttonState[dir] ? "scale-95 ring-4" : ""} ${
                        disabled ? "opacity-50 pointer-events-none" : ""
                    }`}
                    onTouchStart={(e) => handleStart(dir, e)}
                    onTouchEnd={(e) => handleEnd(dir, e)}
                    onMouseDown={(e) => handleStart(dir, e)}
                    onMouseUp={(e) => handleEnd(dir, e)}
                    onMouseLeave={(e) => handleEnd(dir, e)}
                    draggable={false}
                    disabled={disabled}
                >
                    {dir.charAt(0).toUpperCase() + dir.slice(1)}
                </button>
            ))}
        </div>
    );
};

export default PlayerControls;
