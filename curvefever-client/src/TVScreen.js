import React, { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import { Player } from "./models/Player";
import Scoreboard from "./Scoreboard";
import { Copy, Undo2 } from "lucide-react";
import WaitingMessage from "./hooks/waitingMessage";
import { useWebSocket } from "./hooks/useWebSocket";

const TVScreen = ({ roomCode }) => {
    const [players, setPlayers] = useState({});
    const [gameStarting, setGameStarting] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [countdown, setCountdown] = useState(null);

    const { lastMessage, sendJson, readyState, connect, disconnect } =
        useWebSocket({
            url: `ws://localhost:8000/ws/${roomCode}/tv/${roomCode}`,
            autoConnect: true,
        });

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
                setCountdown(data.countdown);
                setGameStarted(data.started);
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
            case "game_starting":
                setGameStarting(true);
                break;
            case "countdown":
                setCountdown(data.seconds);
                break;
            case "game_over":
                setGameStarted(false);
                setGameStarting(false);
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
            {gameStarting && !gameStarted ? (
                <div className="h-screen w-full flex items-center justify-center text-white text-4xl font-bold">
                    <div className="flex items-center gap-4 animate-pulse">
                        <span className="animate-bounce">Game is starting</span>
                        <div className="flex gap-1">
                            <span className="animate-bounce">.</span>
                            <span className="animate-bounce delay-200">.</span>
                            <span className="animate-bounce delay-400">.</span>
                        </div>
                    </div>
                </div>
            ) : gameStarted ? (
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
            ) : (
                <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6 text-white">
                    <div className="w-full max-w-xl flex justify-start mb-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-1 text-sm px-3 py-2 rounded-md hover:bg-gray-700 transition"
                        >
                            <Undo2 className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                    </div>
                    <div className="w-full max-w-xl p-6 rounded-xl text-center">
                        <h2 className="text-3xl font-bold mb-4">Lobby</h2>
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
                    </div>
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
