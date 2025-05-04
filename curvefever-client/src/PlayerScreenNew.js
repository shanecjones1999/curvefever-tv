import React, { useEffect, useRef, useState } from "react";
import JoinRoomForm from "./JoinRoomForm";
import PlayerControls from "./PlayerControls";

function PlayerScreenNew() {
    const [name, setName] = useState("");
    const [playerId, setPlayerId] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    const [connected, setConnected] = useState(false);
    const [playerState, setPlayerState] = useState({
        gameStarted: false,
        eliminated: false,
        gameStarting: false,
        countdown: null,
    });
    const socketRef = useRef(null);

    const handleJoinSuccess = ({ player_id, room_code, name }) => {
        setPlayerId(player_id);
        setRoomCode(room_code);
        setName(name);

        localStorage.setItem("playerId", player_id);
        localStorage.setItem("roomCode", room_code);
    };

    const sendDirection = (left, right) => {
        if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
        ) {
            socketRef.current.send(
                JSON.stringify({
                    type: "move",
                    state: { left, right },
                })
            );
        }
    };

    useEffect(() => {
        if (playerId && roomCode) {
            const wsUrl = `ws://localhost:8000/ws/${roomCode}/player/${playerId}`;
            const socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                console.log("WebSocket connected");
                setConnected(true);
                socket.send(JSON.stringify({ type: "join", name: name }));
            };

            socket.onmessage = (event) => {
                console.log("Received:", event.data);
                const eventData = JSON.parse(event.data);
                switch (eventData.type) {
                    case "tv_disconnect":
                        alert("The host has disconnected. The game will end.");
                        window.location.href = "/";
                        break;
                    case "player_state_update":
                        setPlayerState((prev) => ({
                            ...prev,
                            ...eventData.playerState,
                        }));
                        break;
                    case "eliminated":
                        setPlayerState(() => ({
                            eliminated: true,
                        }));
                        break;
                    default:
                        break;
                }
            };

            socket.onclose = () => {
                console.log("WebSocket disconnected");
                setConnected(false);
            };

            socket.onerror = (err) => {
                console.error("WebSocket error:", err);
            };

            socketRef.current = socket;

            return () => {
                console.log("Cleaning up WebSocket");
                socket.close();
            };
        }
    }, [playerId, roomCode]);

    if (!playerId || !roomCode) {
        return (
            <div>
                <JoinRoomForm onJoinSuccess={handleJoinSuccess} />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 shadow-xl rounded-xl text-center space-y-4 text-gray-100">
            <h2 className="text-2xl font-bold text-white">
                {playerState.gameStarted ? (
                    playerState.eliminated ? (
                        "You crashed!"
                    ) : (
                        "Don't crash!"
                    )
                ) : (
                    <>
                        Welcome, <span className="text-blue-400">{name}</span>
                    </>
                )}
            </h2>

            <p className="text-sm text-gray-300">
                You are in room:{" "}
                <span className="font-mono text-white">{roomCode}</span>
            </p>

            {/* Animated "Get Ready..." message */}
            {!playerState.gameStarted && playerState.gameStarting && (
                <p className="text-2xl font-semibold animate-bounce">
                    Get ready...
                </p>
            )}

            {playerState.gameStarted ? (
                <PlayerControls
                    sendDirection={sendDirection}
                    disabled={playerState.eliminated}
                />
            ) : (
                !playerState.gameStarting && (
                    <p className="text-lg text-gray-200 italic">
                        Waiting for game to start...
                    </p>
                )
            )}
        </div>
    );
}

export default PlayerScreenNew;
