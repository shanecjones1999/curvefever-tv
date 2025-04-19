import React, { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import { Player } from "./models/Player";
import Scoreboard from "./Scoreboard";
import { Copy } from "lucide-react";

const TVScreen = ({ roomCode }) => {
    const [players, setPlayers] = useState({});
    const [gameStarted, setGameStarted] = useState(false);
    const [ws, setWs] = useState(null);
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/${roomCode}/tv`);
        ws.onopen = () => setWs(ws);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "lobby") {
                const playerDict = {};
                Object.entries(data.players).forEach(([id, playerData]) => {
                    playerDict[id] = new Player(
                        id,
                        playerData.name,
                        playerData.radius,
                        playerData.color,
                        playerData.eliminated
                    );
                });
                setPlayers(playerDict);
            } else if (data.type === "game_update") {
                setPlayers((prev) => {
                    const updated = { ...prev };
                    Object.entries(data.players).forEach(([id, playerData]) => {
                        if (updated[id]) {
                            updated[id].update(
                                playerData.x,
                                playerData.y,
                                playerData.is_floating,
                                playerData.score
                            );
                        }
                    });
                    return updated;
                });
            } else if (data.type === "reset_round") {
                setPlayers((prev) => {
                    const updated = { ...prev };
                    Object.values(updated).forEach((p) => p.reset());
                    return updated;
                });
            } else if (data.type === "game_start") {
                setGameStarted(true);
            } else if (data.type === "countdown") {
                setCountdown(data.seconds);
            }
        };

        return () => {
            ws.close();
        };
    }, [roomCode]);

    const startGame = () => {
        if (ws) {
            ws.send(JSON.stringify({ type: "start_game" }));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center text-white px-4">
            {gameStarted ? (
                <div className="flex h-screen w-full text-white">
                    <div className="w-1/4 p-4 border-gray-800 flex flex-col justify-start mt-16">
                        <Scoreboard players={Object.values(players)} />
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <GameCanvas players={Object.values(players)} />
                    </div>
                </div>
            ) : countdown > 0 ? (
                <div>
                    {countdown !== null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 text-white text-8xl font-bold">
                            {countdown > 0 ? countdown : "GO!"}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center max-w-xl w-full">
                    <h2 className="text-3xl font-bold mb-2">Lobby</h2>
                    <h3 className="text-xl mb-1 flex items-center gap-2">
                        Room Code:{" "}
                        <span className="font-mono tracking-widest bg-gray-800 px-3 py-1 rounded-md inline-block">
                            {roomCode}
                        </span>
                        <button
                            onClick={() => {
                                if (navigator.clipboard) {
                                    navigator.clipboard.writeText(roomCode);
                                }
                            }}
                            className="ml-1 px-2 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 transition"
                            title="Copy to clipboard"
                        >
                            <Copy />
                        </button>
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs rounded bg-black text-white px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                            {"Copy to clipboard"}
                        </div>
                    </h3>

                    <h3 className="mt-4 text-gray-400 italic">
                        Waiting for players...
                    </h3>
                    <ul className="my-6 space-y-2">
                        {Object.values(players).map((player) => (
                            <li
                                key={player.name}
                                className="bg-white/10 rounded-md py-2 text-lg"
                            >
                                {player.name}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={startGame}
                        disabled={Object.keys(players).length === 0}
                        className={`px-6 py-3 text-lg rounded-lg font-semibold transition ${
                            Object.keys(players).length === 0
                                ? "bg-green-700 opacity-50 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                        }`}
                    >
                        Start Game
                    </button>
                </div>
            )}
        </div>
    );
};

export default TVScreen;
