import React from "react";

const PlayerGameOver = ({ placement, onClose }) => (
    <div className="flex flex-col justify-center items-center text-white text-center px-4">
        <h2 className="text-4xl font-bold mb-4">Game Over</h2>
        <p className="text-2xl mb-4">
            You placed {placement === 1 ? "1st 🏆" : `${placement}th`}!
        </p>
        <button
            onClick={onClose}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
            Close
        </button>
    </div>
);

export default PlayerGameOver;
