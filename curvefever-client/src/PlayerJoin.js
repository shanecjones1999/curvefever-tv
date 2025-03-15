import React, { useState, useEffect } from "react";

const PlayerJoin = () => {
    const [name, setName] = useState("");
    const [connected, setConnected] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [ws, setWs] = useState(null);

    const connectWebSocket = () => {
        if (name.trim() === "") return;
        const websocket = new WebSocket(
            `ws://localhost:8000/ws/player/${name}`
        );

        websocket.onopen = () => {
            setConnected(true);
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "game_start") {
                setGameStarted(true);
            }
        };

        websocket.onclose = () => {
            setConnected(false);
        };

        setWs(websocket);
    };

    if (gameStarted) {
        return <h2>Game has started! Get ready...</h2>;
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
                    <button onClick={connectWebSocket}>Join Game</button>
                </div>
            ) : (
                <h3>Connected as {name}</h3>
            )}
        </div>
    );
};

export default PlayerJoin;
