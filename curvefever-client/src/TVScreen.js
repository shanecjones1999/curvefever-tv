import React, { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import { Player } from "./models/Player";
import Scoreboard from "./Scoreboard";
import { Copy } from "lucide-react";
import WaitingMessage from "./hooks/waitingMessage";
import { useWebSocket } from "./hooks/useWebSocket";

const TVScreen = ({ roomCode }) => {
    const [players, setPlayers] = useState({});
    const [gameStarted, setGameStarted] = useState(false);
    const [countdown, setCountdown] = useState(null);

    const { lastMessage, sendJson, readyState, connect, disconnect } =
        useWebSocket({
            url: `ws://localhost:8000/ws/${roomCode}/tv`,
            autoConnect: true,
        });

    // Handle incoming messages
    useEffect(() => {
        if (!lastMessage) return;

        const data = lastMessage;

        switch (data.type) {
            case "lobby":
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
                break;
            case "game_update":
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
                break;
            case "reset_round":
                setPlayers((prev) => {
                    const updated = { ...prev };
                    Object.values(updated).forEach((p) => p.reset());
                    return updated;
                });
                break;
            case "game_start":
                setGameStarted(true);
                break;
            case "countdown":
                setCountdown(data.seconds);
                break;
            default:
                break;
        }
    }, [lastMessage]);

    const startGame = () => {
        sendJson({ type: "start_game" });
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
                    </h3>

                    <WaitingMessage />
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
