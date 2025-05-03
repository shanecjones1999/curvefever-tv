import React, { useEffect, useRef, useState } from "react";
import JoinRoomForm from "./JoinRoomForm";

function PlayerScreenNew() {
    const [name, setName] = useState("");
    const [playerId, setPlayerId] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);

    const handleJoinSuccess = ({ player_id, room_code, name }) => {
        setPlayerId(player_id);
        setRoomCode(room_code);
        setName(name);

        // Optional: store in localStorage for reconnect logic
        localStorage.setItem("playerId", player_id);
        localStorage.setItem("roomCode", room_code);
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

            {/* Add buttons to send messages if needed */}
            {/* <button onClick={() => socketRef.current.send("some message")}>Send</button> */}
        </div>
    );
}

export default PlayerScreenNew;
