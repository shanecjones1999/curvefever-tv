// WelcomeScreen.js
import React from "react";

const PlayerWelcome = ({ name, roomCode, color }) => (
    <div>
        <h2 className="text-2xl font-bold text-white">
            Welcome, <span style={{ color }}>{name}</span>
        </h2>
        <p className="text-sm text-gray-300">
            You are in room:{" "}
            <span className="font-mono text-white">{roomCode}</span>
        </p>
    </div>
);

export default PlayerWelcome;
