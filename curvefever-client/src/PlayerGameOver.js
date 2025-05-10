// GameOver.js
import React from "react";

const PlayerGameOver = ({ placement }) => (
    <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
        <h2 className="text-4xl font-bold mb-4">Game Over</h2>
        <p className="text-2xl mb-2">
            You placed {placement === 1 ? "1st 🏆" : `${placement}th`}!
        </p>
    </div>
);

export default PlayerGameOver;
