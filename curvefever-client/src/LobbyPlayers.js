import React, { useState } from "react";

const LobbyPlayers = ({ players }) => (
    <div className="flex justify-center items-center h-full">
        <div className="flex flex-wrap gap-4 my-4">
            {Object.values(players).map((player) => (
                <div
                    key={player.name}
                    className="flex items-center bg-white/10 rounded-md py-2 px-3 text-lg"
                >
                    <div
                        className="w-5 h-5 rounded-full mr-3"
                        style={{
                            backgroundColor: player.color,
                        }}
                    />
                    <span>{player.name}</span>
                </div>
            ))}
        </div>
    </div>
);

export default LobbyPlayers;
