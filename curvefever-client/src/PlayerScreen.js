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

    // Handle messages only if ws is newly created here
    useEffect(() => {
        if (!ws && connected) return;

        if (ws && !initialWs) {
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "game_start") {
                    localStorage.setItem(
                        "playerInfo",
                        JSON.stringify({
                            playerId: playerId,
                            playerName: name,
                            roomCode: roomCode,
                        })
                    );
                    setGameStarted(true);
                } else if (data.type === "player_info") {
                    setPlayerId(data.playerId);
                }
            };

            ws.onclose = () => {
                setConnected(false);
            };
        }
    }, [ws, connected, name, roomCode, playerId, initialWs]);

    const connectWebSocket = () => {
        if (name.trim() === "" || roomCode.trim() === "") return;

        const newWs = new WebSocket(
            `ws://localhost:8000/ws/${roomCode}/player`
        );

        newWs.onopen = () => {
            newWs.send(
                JSON.stringify({
                    type: "join",
                    name: name,
                })
            );
            setConnected(true);
        };

        newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "game_start") {
                localStorage.setItem(
                    "playerInfo",
                    JSON.stringify({
                        playerId: data.playerId,
                        playerName: name,
                        roomCode: roomCode,
                    })
                );
                setGameStarted(true);
            } else if (data.type === "player_info") {
                setPlayerId(data.playerId);
            }
        };

        newWs.onclose = () => {
            setConnected(false);
        };

        setWs(newWs);
    };

    if (gameStarted) {
        return (
            <div>
                <h2>Game has started! Get ready...</h2>
                <PlayerControls ws={ws} playerId={playerId} />
            </div>
        );
    }

    if (connected) {
        return <h3>Connected as {name}</h3>;
    }

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
            />
            <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
            />
            <button onClick={connectWebSocket}>Join Game</button>
        </div>
    );
};

export default PlayerScreen;
