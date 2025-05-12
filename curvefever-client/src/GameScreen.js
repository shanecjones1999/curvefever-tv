import React, { useState, useEffect } from "react";
import Scoreboard from "./Scoreboard";
import GameCanvas from "./GameCanvas";

const GameScreen = ({ players, countdown }) => (
    <div className="flex h-screen w-full text-white">
        <div className="w-1/4 p-4 border-gray-800 flex flex-col justify-start mt-16">
            <Scoreboard players={Object.values(players)} />
        </div>

        <div className="flex-1 p-4 relative flex items-center justify-center">
            <GameCanvas players={Object.values(players)} />

            {countdown >= 1 && (
                <div className="absolute inset-0 z-50 flex items-center justify-center text-white text-8xl font-bold">
                    {countdown}
                </div>
            )}
        </div>
    </div>
);

export default GameScreen;
