import React, { useState, useEffect } from "react";
import TVScreen from "./TVScreen";
import JoinRoomForm from "./JoinRoomForm";
import PlayerScreenNew from "./PlayerScreenNew";
import CurveFeverBackground from "./CurveFeverBackground";
import { Home } from "lucide-react";

const HomeScreen = () => {
    const [view, setView] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [playerId, setPlayerId] = useState(null);
    const [name, setName] = useState();
    const [gameStarted, setGameStarted] = useState(false);

    const handleTVClick = async () => {
        try {
            const response = await fetch(
                "https://curvefever-tv.onrender.com/get_room_code"
            );
            const data = await response.json();
            setRoomCode(data.room_code);
            setView("tv");
        } catch (error) {
            alert("Failed to create a room. Please try again later.");
        }
    };

    const handleJoinSuccess = ({ player_id, room_code, name }) => {
        setPlayerId(player_id);
        setRoomCode(room_code);
        setName(name);

        setView("player");

        localStorage.setItem(
            "playerInfo",
            JSON.stringify({
                playerId: player_id,
                roomCode: room_code,
                name: name,
            })
        );
    };

    useEffect(() => {
        const tryAutoReconnect = async () => {
            const stored = localStorage.getItem("playerInfo");
            if (!stored) return;

            const { roomCode, playerId, name } = JSON.parse(stored);

            try {
                const response = await fetch(
                    `https://curvefever-tv.onrender.com/check_player?room_code=${roomCode}&player_id=${playerId}`
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
                    setName(name);
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
        <>
            {!gameStarted && <CurveFeverBackground />}

            <div
                className={`flex flex-col items-center justify-center min-h-screen p-8 text-center ${
                    gameStarted ? "bg-gray-700" : ""
                }`}
            >
                {!view ? (
                    <div className="space-y-6 max-w-md mx-auto p-6 bg-gray-800 shadow-lg rounded-xl ">
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
                                onClick={() => setView("join")}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
                            >
                                Join Room
                            </button>
                        </div>
                    </div>
                ) : view === "tv" ? (
                    <TVScreen
                        roomCode={roomCode}
                        handleBackClick={() => setView("")}
                        sgs={setGameStarted}
                    />
                ) : view === "join" ? (
                    <JoinRoomForm
                        onJoinSuccess={handleJoinSuccess}
                        handleBackClick={() => setView("")}
                    />
                ) : view === "player" ? (
                    <PlayerScreenNew
                        roomCode={roomCode}
                        playerId={playerId}
                        name={name}
                        sgs={setGameStarted}
                    />
                ) : (
                    <div>UNKNOWN</div>
                )}
            </div>
        </>
    );
};

export default HomeScreen;
