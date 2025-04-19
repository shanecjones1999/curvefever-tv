import React, { useState, useEffect } from "react";
import PlayerControls from "./PlayerControls";

const PlayerScreen = ({
    ws: initialWs,
    playerId: initialPlayerId,
    playerName: initialName,
    roomCode: initialRoomCode,
    gameStarted: initialGameStarted,
}) => {
    const [name, setName] = useState(initialName || "");
    const [connected, setConnected] = useState(!!initialWs);
    const [gameStarted, setGameStarted] = useState(initialGameStarted || false);
    const [roomCode, setRoomCode] = useState(initialRoomCode || "");
    const [ws, setWs] = useState(initialWs || null);
    const [playerId, setPlayerId] = useState(initialPlayerId || null);
    const [eliminated, setEliminated] = useState(false);
    const [shouldConnect, setShouldConnect] = useState(false);

    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        if (!shouldConnect || connected || ws || !name || !roomCode) return;

        const newWs = new WebSocket(
            `ws://localhost:8000/ws/${roomCode}/player`
        );

        newWs.onopen = () => {
            newWs.send(JSON.stringify({ type: "join", name }));
        };

        newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "game_start") {
                localStorage.setItem(
                    "playerInfo",
                    JSON.stringify({
                        playerId: data.playerId,
                        playerName: name,
                        roomCode,
                    })
                );
                setGameStarted(true);
            } else if (data.type === "player_info") {
                setPlayerId(data.playerId);
                setConnected(true);
            } else if (data.type === "eliminated") {
                setEliminated(true);
            } else if (data.type === "reset_round") {
                setEliminated(false);
            } else if (data.type === "invalid_room_code") {
                setShouldConnect(false);
                setWs(null);
                alert("The entered room code is invalid.");
            } else if (data.type === "tv_disconnect") {
                alert("The host (TV) has disconnected. The game will end.");
                window.location.href = "/";
            } else if (data.type === "countdown") {
                setCountdown(data.seconds);
            }
        };

        newWs.onclose = () => {
            setConnected(false);
        };

        setWs(newWs);
        setShouldConnect(false);
    }, [shouldConnect, name, roomCode, connected, ws]);

    const sendDirection = (left, right) => {
        if (ws && playerId) {
            ws.send(
                JSON.stringify({
                    type: "move",
                    playerId,
                    state: { left, right },
                })
            );
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

    if (connected) {
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
                onClick={() => setShouldConnect(true)}
                disabled={!name || !roomCode || connected}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 transform text-white text-lg font-medium py-3 px-6 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Join Game
            </button>
        </div>
    );
};

export default PlayerScreen;
