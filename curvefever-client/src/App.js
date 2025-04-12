import React, { useState, useEffect } from "react";
import TVScreen from "./TVScreen";
import PlayerJoin from "./PlayerJoin";

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
            const playerInfo = JSON.parse(stored);
            // e.g., auto-reconnect or prefill input
            console.log("Restoring player:", playerInfo);
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
                <PlayerJoin />
            )}
        </div>
    );
};

export default App;
