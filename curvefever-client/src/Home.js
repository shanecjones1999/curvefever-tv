import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const [roomCode, setRoomCode] = useState("");
    const navigate = useNavigate();

    // Function to create a new room
    const createRoom = async () => {
        const response = await fetch("http://localhost:8000/create-room");
        const data = await response.json();
        navigate(`/game/${data.room_code}`); // Redirect to the new game URL
    };

    // Function to join an existing room
    const joinRoom = () => {
        if (roomCode.trim() !== "") {
            navigate(`/game/${roomCode}`); // Redirect to the specified room
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6">Curvefever Party Game</h1>
            <button
                onClick={createRoom}
                className="px-6 py-3 bg-blue-500 rounded-lg mb-4"
            >
                Create Game
            </button>
            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="Enter Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="p-2 text-black"
                />
                <button
                    onClick={joinRoom}
                    className="px-6 py-3 bg-green-500 rounded-lg"
                >
                    Join Game
                </button>
            </div>
        </div>
    );
}

export default Home;
