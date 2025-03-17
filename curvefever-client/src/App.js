import React, { useState } from "react";
import TVScreen from "./TVScreen";
import PlayerJoin from "./PlayerJoin";

const App = () => {
    const [view, setView] = useState(""); // "tv" or "player"
    const [roomCode, setRoomCode] = useState(""); // Store the room code

    const handleTVClick = async () => {
        const response = await fetch("http://localhost:8000/get_room_code");
        const data = await response.json();
        setRoomCode(data.room_code);
        setView("tv");
    };

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
