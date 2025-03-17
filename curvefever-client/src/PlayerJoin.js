import React, { useState } from "react";
import PlayerControls from "./PlayerControls";

const PlayerJoin = () => {
    const [name, setName] = useState("");
    const [connected, setConnected] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [ws, setWs] = useState(null);

    const connectWebSocket = () => {
        if (name.trim() === "") return;

        const ws = new WebSocket(
            `ws://localhost:8000/ws/${roomCode}/player/${name}`
        );

        ws.onopen = () => {
            setConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "game_start") {
                setGameStarted(true);
            }
        };

        ws.onclose = () => {
            setConnected(false);
        };

        setWs(ws);
    };

    if (gameStarted) {
        return (
            <div>
                <h2>Game has started! Get ready...</h2>
                <PlayerControls ws={ws} playerName={name} />
            </div>
        );
    }

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {!connected ? (
                <div>
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
            ) : (
                <h3>Connected as {name}</h3>
            )}
        </div>
    );
};

export default PlayerJoin;
