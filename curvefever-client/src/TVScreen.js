import React, { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import { Player } from "./models/Player";
import Scoreboard from "./Scoreboard";
import { Copy, Undo2 } from "lucide-react";
import WaitingMessage from "./hooks/waitingMessage";
import { useWebSocket } from "./hooks/useWebSocket";
import LobbyPlayers from "./LobbyPlayers";
import GameScreen from "./GameScreen";

const TVScreen = ({ roomCode, handleBackClick, sgs }) => {
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

    useEffect(() => {
        if (gameStarted) {
            sgs(true);
        } else {
            sgs(false);
        }
    }, [gameStarted, sgs]);

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
                <GameScreen
                    players={players}
                    countdown={countdown}
                ></GameScreen>
            ) : (
                <div className="max-w-xl mx-auto p-6 bg-gray-800 shadow-lg rounded-xl space-y-4">
                    <div className="w-full max-w-xl p-6 rounded-xl text-center">
                        <h2 className="text-3xl font-bold mb-4">
                            <button
                                onClick={() => {
                                    if (navigator.clipboard) {
                                        navigator.clipboard.writeText(roomCode);
                                    }
                                }}
                            >
                                Room Code: {roomCode}
                            </button>
                        </h2>

                        <WaitingMessage />
                    </div>

                    <LobbyPlayers players={players}></LobbyPlayers>

                    <div className="flex justify-around">
                        <button
                            className="w-1/3 py-2 px-4 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700"
                            onClick={handleBackClick}
                            type="button"
                        >
                            Back
                        </button>
                        <button
                            onClick={startGame}
                            disabled={Object.keys(players).length === 0}
                            className={`px-6 py-3 text-lg rounded-lg font-semibold transition ${
                                Object.keys(players).length === 0
                                    ? "bg-green-700 opacity-50 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
                            }`}
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TVScreen;
