import React, { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import { Player } from "./models/Player";

const TVScreen = () => {
    const [players, setPlayers] = useState({});
    const [gameStarted, setGameStarted] = useState(false);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/tv/lobby`);

        ws.onopen = () => {
            console.log("TV WebSocket Connected");
            setWs(ws);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "lobby") {
                const playerDict = {};
                Object.entries(data.players).forEach(([id, playerData]) => {
                    playerDict[id] = new Player(
                        id,
                        playerData.name,
                        playerData.x,
                        playerData.y,
                        playerData.radius,
                        playerData.color,
                        playerData.eliminated
                    );
                });

                setPlayers(playerDict);
            }
            if (data.type === "game_update") {
                setPlayers((prevPlayers) => {
                    // Copy the previous state
                    const updatedPlayers = { ...prevPlayers };

                    // Update existing players' positions
                    Object.entries(data.players).forEach(([id, playerData]) => {
                        if (updatedPlayers[id]) {
                            updatedPlayers[id].update(
                                playerData.x,
                                playerData.y
                            );
                        }
                    });

                    return updatedPlayers;
                });
            }
        };

        return () => ws.close();
    }, []);

    const startGame = () => {
        if (ws) {
            ws.send(
                JSON.stringify({
                    type: "start_game",
                })
            ); // Send message to start the game
            setGameStarted(true);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {gameStarted ? (
                <div>
                    <h2>Game has started!</h2>
                    <GameCanvas players={Object.values(players)} />
                </div> // Show game started message
            ) : (
                <>
                    <h2>Lobby</h2>
                    <h3>Waiting for players...</h3>
                    <ul>
                        {Object.values(players).map((player) => (
                            <li key={player.name}>{player.name}</li>
                        ))}
                    </ul>
                    <button
                        onClick={startGame}
                        disabled={Object.keys(players).length === 0}
                    >
                        Start Game
                    </button>
                </>
            )}
        </div>
    );
};

export default TVScreen;
