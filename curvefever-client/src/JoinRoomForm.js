import React, { useState } from "react";

function JoinRoomForm({ onJoinSuccess, handleBackClick }) {
    const [name, setName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:8000/join_room", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, room_code: roomCode }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to join room");
            }

            const data = await res.json();
            onJoinSuccess(data); // Pass back { player_id, room_code }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleJoin}
            className="max-w-md mx-auto p-6 bg-gray-800 shadow-lg rounded-xl space-y-4"
        >
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                    Name:
                </label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                    Room Code:
                </label>
                <input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex justify-between space-x-4">
                <button
                    className="w-1/3 py-2 px-4 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700"
                    onClick={handleBackClick}
                    type="button"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-2/3 py-2 px-4 rounded-lg text-white font-semibold whitespace-nowrap ${
                        loading
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {loading ? "Joining..." : "Join Room"}
                </button>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
    );
}

export default JoinRoomForm;
