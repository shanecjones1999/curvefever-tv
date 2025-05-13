import React, { useEffect, useRef, useState } from "react";
import PlayerControls from "./PlayerControls";
import PlayerGameOver from "./PlayerGameOver";
import PlayerGameStarting from "./PlayerGameStarting";
import PlayerWelcome from "./PlayerWelcome";

function PlayerScreenNew({ name, playerId, roomCode, sgs }) {
    const [playerState, setPlayerState] = useState({
        gameStarted: false,
        eliminated: false,
        gameStarting: false,
        countdown: null,
        color: null,
    });

    const [placement, setPlacement] = useState(false);
    const socketRef = useRef(null);

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
        const wsUrl = `ws://localhost:8000/ws/${roomCode}/player/${playerId}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
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
                    if (
                        !playerState.gameStarted &&
                        eventData.playerState.gameStarted
                    ) {
                        setPlacement(false);
                    } else if (
                        !playerState.gameStarting &&
                        eventData.playerState.gameStarting
                    ) {
                        setPlacement(false);
                    }
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
                case "game_over":
                    setPlayerState((prev) => ({
                        ...prev,
                        gameStarted: false,
                        gameStarting: false,
                    }));
                    setPlacement(eventData.placement);
                    break;
                case "invalid_room_code":
                    if (socketRef.current) {
                        socketRef.current.close();
                    }
                    break;
                default:
                    console.warn("Unhandled message type:", eventData);
                    break;
            }
        };

        socket.onclose = () => {
            console.log("WebSocket disconnected");
        };

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        socketRef.current = socket;

        return () => {
            console.log("Cleaning up WebSocket");
            socket.close();
        };
    }, []);

    useEffect(() => {
        if (playerState.gameStarted) {
            sgs(true);
        } else {
            sgs(false);
        }
    }, [playerState, sgs]);

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 shadow-xl rounded-xl text-center space-y-4 text-gray-100">
            {playerState.gameStarted ? (
                playerState.eliminated ? (
                    <h2 className="text-2xl font-bold text-white">
                        You crashed!
                    </h2>
                ) : (
                    <h2 className="text-2xl font-bold text-white">
                        Don't crash!
                    </h2>
                )
            ) : (
                <>
                    {playerState.gameStarting ? (
                        <PlayerGameStarting />
                    ) : (
                        <PlayerWelcome
                            name={name}
                            roomCode={roomCode}
                            color={playerState.color}
                        />
                    )}
                </>
            )}

            {placement && (
                <PlayerGameOver
                    placement={placement}
                    onClose={() => setPlacement(false)}
                />
            )}

            {playerState.gameStarted && (
                <PlayerControls
                    sendDirection={sendDirection}
                    disabled={playerState.eliminated}
                />
            )}

            {!playerState.gameStarted && !playerState.gameStarting && (
                <p className="text-lg text-gray-200 italic">
                    Waiting for game to start...
                </p>
            )}
        </div>
    );
}

export default PlayerScreenNew;
