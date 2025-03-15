import React, { useState, useEffect } from "react";

const TVScreen = () => {
    const [players, setPlayers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/tv/lobby");

        ws.onopen = () => {
            console.log("TV WebSocket Connected");
            setWs(ws);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "lobby") {
                setPlayers(data.players);
            }
        };

        return () => ws.close();
    }, []);

    const startGame = () => {
        if (ws) {
            ws.send("start_game"); // Send message to start the game
            setGameStarted(true);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {gameStarted ? (
                <h2>Game has started!</h2> // Show game started message
            ) : (
                <>
                    <h2>Lobby</h2>
                    <h3>Waiting for players...</h3>
                    <ul>
                        {players.map((player, idx) => (
                            <li key={idx}>{player}</li>
                        ))}
                    </ul>
                    <button
                        onClick={startGame}
                        disabled={players.length === 0} // Disable button if no players
                    >
                        Start Game
                    </button>
                </>
            )}
        </div>
    );
};

export default TVScreen;
