import React, { useEffect, useRef, useState } from "react";
import JoinRoomForm from "./JoinRoomForm";
import PlayerControls from "./PlayerControls";

function PlayerScreenNew() {
    const [name, setName] = useState("");
    const [playerId, setPlayerId] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    const [connected, setConnected] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const socketRef = useRef(null);

    const handleJoinSuccess = ({ player_id, room_code, name }) => {
        setPlayerId(player_id);
        setRoomCode(room_code);
        setName(name);

        // Optional: store in localStorage for reconnect logic
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
                    playerId,
                    state: { left, right },
                })
            );
        }
        // if (playerId) {
        //     socketRef.send({ type: "move", playerId, state: { left, right } });
        // }
    };

    // Connect to WebSocket after joining
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
                    case "game_start":
                        setGameStarted(true);
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
                <h2>Join a Game</h2>
                <JoinRoomForm onJoinSuccess={handleJoinSuccess} />
            </div>
        );
    }

    return (
        <div>
            <h2>Welcome to Room {roomCode}</h2>
            <p>Your player ID: {playerId}</p>
            <p>WebSocket Status: {connected ? "Connected" : "Connecting..."}</p>

            {gameStarted ? (
                <PlayerControls
                    // playerId={playerId}
                    sendDirection={sendDirection} // or however you're handling control events
                />
            ) : (
                <p>Waiting for game to start...</p>
            )}
        </div>
    );
}

export default PlayerScreenNew;
