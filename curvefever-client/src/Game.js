import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Game() {
    const { roomCode } = useParams();
    const [role, setRole] = useState(null);
    const [playerCount, setPlayerCount] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const ws = React.useRef(null);

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8000/ws/${roomCode}`);

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.role) {
                setRole(message.role);
            }

            if (message.type === "update_players") {
                setPlayerCount(message.count);
            }

            if (message === "game_started") {
                setGameStarted(true);
            }
        };

        return () => {
            ws.current.close();
        };
    }, [roomCode]);

    const startGame = () => {
        if (ws.current && role === "tv") {
            ws.current.send("start_game");
        }
    };

    return (
        <div>
            <h1>Room Code: {roomCode}</h1>

            {role === "tv" && (
                <div>
                    <h2>Players: {playerCount}</h2>
                    {!gameStarted ? (
                        <button onClick={startGame}>Start Game</button>
                    ) : (
                        <h2>Game Started!</h2>
                    )}
                </div>
            )}

            {role === "player" && (
                <div>
                    <h2>Waiting for the game to start...</h2>
                    {gameStarted && <h2>The game has started!</h2>}
                </div>
            )}
        </div>
    );
}

export default Game;
