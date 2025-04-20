import React, { useEffect, useState } from "react";
import PlayerControls from "./PlayerControls";
import { usePlayerSocket } from "./hooks/usePlayerSocket";
import { Undo2 } from "lucide-react";

const PlayerScreen = ({ cachedRoomCode = "", cachedPlayerId = null }) => {
    const [name, setName] = useState("");
    const [roomCode, setRoomCode] = useState(cachedRoomCode);
    const [playerId, setPlayerId] = useState(cachedPlayerId);
    const [hasJoined, setHasJoined] = useState(false);
    const [eliminated, setEliminated] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [wsUrl, setWsUrl] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);

    const { readyState, lastMessage, sendJson } = usePlayerSocket(wsUrl);

    const connected = readyState === WebSocket.OPEN;

    const registerPlayer = (id) => {
        setPlayerId(id);
        localStorage.setItem(
            "playerInfo",
            JSON.stringify({
                playerId: id,
                roomCode: wsUrl?.split("/")[4],
            })
        );
    };

    useEffect(() => {
        if (!lastMessage) return;

        switch (lastMessage.type) {
            case "player_info":
                registerPlayer(lastMessage.playerId, name);
                break;
            case "game_start":
                setEliminated(false);
                setGameStarted(true);
                break;
            case "eliminated":
                setEliminated(true);
                break;
            case "reset_round":
                setEliminated(false);
                break;
            case "invalid_room_code":
                alert("The entered room code is invalid.");
                setWsUrl(null);
                break;
            case "tv_disconnect":
                alert("The host (TV) has disconnected. The game will end.");
                window.location.href = "/";
                break;
            case "countdown":
                setCountdown(lastMessage.seconds);
                break;
            case "reconnect_success":
                setGameStarted(true);
                break;
            default:
                break;
        }
    }, [lastMessage, name, registerPlayer]);

    useEffect(() => {
        if (
            //readyState === WebSocket.OPEN &&
            cachedRoomCode &&
            cachedPlayerId &&
            !hasJoined &&
            !wsUrl
        ) {
            const url = `ws://localhost:8000/ws/${cachedRoomCode}/player`;
            setWsUrl(url);
            sendJson({
                type: "reconnect",
                player_id: cachedPlayerId,
                room_code: roomCode,
            });
            // Note: setting wsUrl will re-trigger the socket hook
        }
    }, [readyState, cachedRoomCode, cachedPlayerId, hasJoined, wsUrl]);

    const handleJoin = async () => {
        if (!name || !roomCode || hasJoined) return;

        try {
            const response = await fetch(
                `http://localhost:8000/check_room?room_code=${roomCode}`
            );
            const result = await response.json();

            if (result.active) {
                setWsUrl(`ws://localhost:8000/ws/${roomCode}/player`);
                sendJson({ type: "join", name });
                setHasJoined(true);
            } else {
                alert("Invalid room code.");
            }
        } catch (err) {
            console.error("Error validating room code:", err);
            alert("Something went wrong. Please try again.");
        }
    };

    const sendDirection = (left, right) => {
        if (playerId) {
            sendJson({ type: "move", playerId, state: { left, right } });
        }
    };

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
                <h3 className="text-4xl font-medium mb-2">Welcome {name}.</h3>
                <p className="text-base">
                    Waiting for the host to start the game...
                </p>
            </div>
        );
    }

    return (
        <div className="h-screen text-white px-4 py-6 flex flex-col">
            {/* Top Bar */}
            <div className="flex justify-start">
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1 text-sm px-3 py-2 rounded-md hover:bg-gray-700 transition"
                >
                    <Undo2 className="w-4 h-4" />
                    <span>Back</span>
                </button>
            </div>

            {/* Centered Form */}
            <div className="flex flex-grow items-center justify-center">
                <div className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Join Game
                    </h2>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="mb-4 p-3 w-full rounded-md text-black focus:outline-none"
                    />
                    <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        placeholder="Enter room code"
                        className="mb-6 p-3 w-full rounded-md text-black focus:outline-none"
                    />
                    <button
                        onClick={handleJoin}
                        disabled={!name || !roomCode || hasJoined}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transform text-white text-lg font-medium py-3 px-6 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Join Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayerScreen;
