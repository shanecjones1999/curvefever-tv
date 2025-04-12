import React, { useState, useEffect } from "react";
import TVScreen from "./TVScreen";
import PlayerScreen from "./PlayerScreen";

const App = () => {
    const [view, setView] = useState("");
    const [roomCode, setRoomCode] = useState("");

    const handleTVClick = async () => {
        const response = await fetch("http://localhost:8000/get_room_code");
        const data = await response.json();
        setRoomCode(data.room_code);
        setView("tv");
    };

    useEffect(() => {
        const stored = localStorage.getItem("playerInfo");
        if (stored) {
            const savedPlayer = JSON.parse(stored);
            const { roomCode, playerId } = savedPlayer;

            const ws = new WebSocket(
                `ws://localhost:8000/ws/${roomCode}/player`
            );

            ws.onopen = () => {
                ws.send(
                    JSON.stringify({
                        type: "reconnect",
                        room_code: roomCode, // match server-side key
                        player_id: playerId, // match server-side key
                    })
                );
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "reconnect_success") {
                    console.log("Reconnected successfully:", data.player);

                    // Optionally update local state:
                    // setPlayer(data.player);
                    // setGameStarted(true); etc.
                } else if (data.type === "reconnect_failed") {
                    console.warn("Failed to reconnect. Clearing saved data.");
                    localStorage.removeItem("playerInfo");
                    // optionally redirect to join screen
                }
            };

            ws.onerror = (e) => {
                console.error("WebSocket error:", e);
            };

            // Optional cleanup
            return () => {
                ws.close();
            };
        }
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {!view ? (
                <div>
                    <button onClick={handleTVClick}>I'm the TV</button>
                    <button onClick={() => setView("player")}>
                        Join as Player
                    </button>
                </div>
            ) : view === "tv" ? (
                <TVScreen roomCode={roomCode} />
            ) : (
                <PlayerScreen />
            )}
        </div>
    );
};

export default App;
