import React, { useState, useEffect } from "react";
import TVScreen from "./TVScreen";
import PlayerScreen from "./PlayerScreen";

const App = () => {
    const [view, setView] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [ws, setWs] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [playerName, setPlayerName] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);

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
        const stored = localStorage.getItem("playerInfo");
        if (stored) {
            const savedPlayer = JSON.parse(stored);
            const { roomCode, playerId, playerName } = savedPlayer;

            const newWs = new WebSocket(
                `ws://localhost:8000/ws/${roomCode}/player`
            );

            newWs.onopen = () => {
                newWs.send(
                    JSON.stringify({
                        type: "reconnect",
                        room_code: roomCode,
                        player_id: playerId,
                    })
                );
            };

            newWs.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "reconnect_success") {
                    console.log("Reconnected successfully:", data.player);
                    setView("player");
                    setRoomCode(roomCode);
                    setPlayerId(playerId);
                    setPlayerName(playerName);
                    setWs(newWs);
                    setGameStarted(true);
                } else if (data.type === "reconnect_failed") {
                    console.warn("Failed to reconnect. Clearing saved data.");
                    localStorage.removeItem("playerInfo");
                } else if (data.type === "game_start") {
                    setGameStarted(true);
                }
            };

            newWs.onerror = (e) => {
                console.error("WebSocket error:", e);
            };

            return () => {
                newWs.close();
            };
        }
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
                    ws={ws}
                    playerId={playerId}
                    playerName={playerName}
                    roomCode={roomCode}
                    gameStarted={gameStarted}
                />
            )}
        </div>
    );
};

export default App;
