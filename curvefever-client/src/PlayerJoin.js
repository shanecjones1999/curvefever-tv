import React, { useState } from "react";
import PlayerControls from "./PlayerControls";

const PlayerJoin = () => {
    const [name, setName] = useState("");
    const [connected, setConnected] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [ws, setWs] = useState(null);
    const [playerId, setPlayerId] = useState(null);

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
                console.log(data.playerId);
                if (name && roomCode && data.playerId) {
                    localStorage.setItem(
                        "playerInfo",
                        JSON.stringify({
                            playerId: data.playerId,
                            playerName: name,
                            roomCode: roomCode,
                        })
                    );
                }

                setGameStarted(true);
            } else if (data.type === "player_info") {
                setPlayerId(data.playerId);
                console.log("name:", name);
                console.log("room code:", roomCode);
                console.log("playerId", playerId);
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
                <PlayerControls ws={ws} playerName={name} playerId={playerId} />
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
