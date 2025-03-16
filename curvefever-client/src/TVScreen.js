import React, { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import { Player } from "./models/Player";

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
                const playerList = [];
                for (let i = 0; i < data.players.length; i++) {
                    const plyr = new Player(
                        data.players[i].name,
                        data.players[i].x,
                        data.players[i].y
                    );
                    playerList.push(plyr);
                }
                //setPlayers(data.players);
                setPlayers(playerList);
            }
            if (data.type === "game_update") {
                setPlayers((prevPlayers) => {
                    // Now you're working with the latest state (`prevPlayers`)

                    // Update players' positions based on the incoming data
                    const updatedPlayers = prevPlayers.map((player) => {
                        const updatedPlayerData = data.players.find(
                            (p) => p.name === player.name
                        );

                        if (updatedPlayerData) {
                            player.x = updatedPlayerData.x;
                            player.y = updatedPlayerData.y;
                        }

                        return player;
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
                    <GameCanvas players={players} />
                </div> // Show game started message
            ) : (
                <>
                    <h2>Lobby</h2>
                    <h3>Waiting for players...</h3>
                    <ul>
                        {players.map((player, idx) => (
                            <li key={idx}>{player.name}</li>
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
