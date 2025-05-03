import React, { useState } from "react";

function JoinRoomForm({ onJoinSuccess }) {
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
        <form onSubmit={handleJoin}>
            <div>
                <label>Name:</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Room Code:</label>
                <input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? "Joining..." : "Join Room"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    );
}

export default JoinRoomForm;
