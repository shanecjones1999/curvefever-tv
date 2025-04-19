import React, { useEffect, useState } from "react";
import PlayerControls from "./PlayerControls";
import { usePlayerSocket } from "./hooks/usePlayerSocket";

const PlayerScreen = () => {
    const [name, setName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [eliminated, setEliminated] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [hasJoined, setHasJoined] = useState(false);

    const {
        playerId,
        playerName,
        gameStarted,
        readyState,
        lastMessage,
        registerPlayer,
        sendJson,
    } = usePlayerSocket(roomCode);

    const connected = readyState === WebSocket.OPEN;

    // Handle incoming game state updates
    useEffect(() => {
        if (!lastMessage) return;

        switch (lastMessage.type) {
            case "player_info":
                registerPlayer(lastMessage.playerId, name);
                break;
            case "game_start":
                setEliminated(false);
                break;
            case "eliminated":
                setEliminated(true);
                break;
            case "reset_round":
                setEliminated(false);
                break;
            case "invalid_room_code":
                alert("The entered room code is invalid.");
                break;
            case "tv_disconnect":
                alert("The host (TV) has disconnected. The game will end.");
                window.location.href = "/";
                break;
            case "countdown":
                setCountdown(lastMessage.seconds);
                break;
            default:
                break;
        }
    }, [lastMessage, name, registerPlayer]);

    const handleJoin = () => {
        if (!connected || !name) return;
        sendJson({ type: "join", name });
        setHasJoined(true);
    };

    const sendDirection = (left, right) => {
        if (playerId) {
            sendJson({ type: "move", playerId, state: { left, right } });
        }
    };

    // --------------------------
    // UI render logic
    // --------------------------

    if (gameStarted) {
        return (
            <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
                <h2 className="text-2xl font-semibold mb-4">
                    {eliminated
                        ? "You crashed"
                        : "Game has started... Don't crash!"}
                </h2>
                <PlayerControls
                    sendDirection={sendDirection}
                    disabled={eliminated}
                />
            </div>
        );
    }

    if (connected && hasJoined) {
        return (
            <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
                {countdown !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 text-white text-8xl font-bold">
                        {countdown > 0 ? countdown : "GO!"}
                    </div>
                )}
                <h3 className="text-4xl font-medium mb-2">
                    Welcome {playerName || name}.
                </h3>
                <p className="text-base">
                    Waiting for the host to start the game...
                </p>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col justify-center items-center text-white px-4">
            <h2 className="text-2xl font-bold mb-6">Join Game</h2>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mb-4 p-3 w-64 rounded-md text-black focus:outline-none"
            />
            <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                className="mb-4 p-3 w-64 rounded-md text-black focus:outline-none"
            />
            <button
                onClick={handleJoin}
                disabled={!name || !roomCode || hasJoined}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 transform text-white text-lg font-medium py-3 px-6 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Join Game
            </button>
        </div>
    );
};

export default PlayerScreen;
