import React, { useState, useEffect } from "react";
import TVScreen from "./TVScreen";
import PlayerScreen from "./PlayerScreen";

const App = () => {
    const [view, setView] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [playerId, setPlayerId] = useState(null);

    const handleTVClick = async () => {
        try {
            const response = await fetch("http://localhost:8000/get_room_code");
            const data = await response.json();
            setRoomCode(data.room_code);
            setView("tv");
        } catch (error) {
            alert("Failed to create a room. Please try again later.");
        }
    };

    useEffect(() => {
        const tryAutoReconnect = async () => {
            const stored = localStorage.getItem("playerInfo");
            if (!stored) return;

            const { roomCode, playerId } = JSON.parse(stored);

            try {
                const response = await fetch(
                    `http://localhost:8000/check_player?room_code=${roomCode}&player_id=${playerId}`
                );
                if (!response.ok) {
                    localStorage.removeItem("playerInfo");
                    // throw new Error("No active game found");
                }

                const data = await response.json();
                if (data.active) {
                    // Player is in a live game; proceed with reconnect
                    setRoomCode(roomCode);
                    setPlayerId(playerId);
                    setView("player");
                } else {
                    // Cleanup if game no longer exists
                    localStorage.removeItem("playerInfo");
                }
            } catch (err) {
                console.warn("Auto-reconnect failed:", err);
                localStorage.removeItem("playerInfo");
            }
        };

        tryAutoReconnect();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700 p-8 text-center">
            {!view ? (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-100">
                        curvefever.tv
                    </h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleTVClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
                        >
                            Create Room
                        </button>
                        <button
                            onClick={() => setView("player")}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
                        >
                            Join Room
                        </button>
                    </div>
                </div>
            ) : view === "tv" ? (
                <TVScreen roomCode={roomCode} />
            ) : (
                <PlayerScreen
                    cachedRoomCode={roomCode}
                    cachedPlayerId={playerId}
                />
            )}
        </div>
    );
};

export default App;
