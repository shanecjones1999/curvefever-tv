import React, { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import { Player } from "./models/Player";

const TVScreen = ({ roomCode }) => {
    const [players, setPlayers] = useState({});
    const [gameStarted, setGameStarted] = useState(false);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/${roomCode}/tv`);

        ws.onopen = () => {
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
                        playerData.radius,
                        playerData.color,
                        playerData.eliminated
                    );
                });

                setPlayers(playerDict);
            } else if (data.type === "game_update") {
                setPlayers((prevPlayers) => {
                    const updatedPlayers = { ...prevPlayers };

                    Object.entries(data.players).forEach(([id, playerData]) => {
                        if (updatedPlayers[id]) {
                            updatedPlayers[id].update(
                                playerData.x,
                                playerData.y,
                                playerData.is_floating
                            );
                        }
                    });

                    return updatedPlayers;
                });
            } else if (data.type === "reset_round") {
                setPlayers((prevPlayers) => {
                    const updatedPlayers = { ...prevPlayers };

                    Object.values(updatedPlayers).forEach((player) => {
                        player.reset();
                    });

                    return updatedPlayers;
                });
            }
        };

        return () => {
            console.log("Closing websocket");
            ws.close();
        };
    }, []);

    const startGame = () => {
        if (ws) {
            ws.send(
                JSON.stringify({
                    type: "start_game",
                })
            );
            setGameStarted(true);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {gameStarted ? (
                <div>
                    <h2>Game has started!</h2>
                    <GameCanvas players={Object.values(players)} />
                </div>
            ) : (
                <>
                    <h2>Lobby</h2>
                    <h3>Room code: {roomCode}</h3>
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
