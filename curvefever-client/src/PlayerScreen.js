import React, { useState, useEffect } from "react";
import PlayerControls from "./PlayerControls";

const PlayerScreen = ({
    ws: initialWs,
    playerId: initialPlayerId,
    playerName: initialName,
    roomCode: initialRoomCode,
    gameStarted: initialGameStarted,
}) => {
    const [name, setName] = useState(initialName || "");
    const [connected, setConnected] = useState(!!initialWs);
    const [gameStarted, setGameStarted] = useState(initialGameStarted || false);
    const [roomCode, setRoomCode] = useState(initialRoomCode || "");
    const [ws, setWs] = useState(initialWs || null);
    const [playerId, setPlayerId] = useState(initialPlayerId || null);
    const [eliminated, setEliminated] = useState(false);

    // useEffect(() => {
    //     if (!ws && connected) return;

    //     if (ws && !initialWs) {
    //         ws.onmessage = (event) => {
    //             const data = JSON.parse(event.data);
    //             if (data.type === "game_start") {
    //                 localStorage.setItem(
    //                     "playerInfo",
    //                     JSON.stringify({
    //                         playerId: playerId,
    //                         playerName: name,
    //                         roomCode: roomCode,
    //                     })
    //                 );
    //                 setGameStarted(true);
    //             } else if (data.type === "player_info") {
    //                 setPlayerId(data.playerId);
    //                 setConnected(true);
    //             } else if (data.type === "invalid_room_code") {
    //                 alert("The entered room code is invalid.");
    //             }
    //         };

    //         ws.onclose = () => {
    //             setConnected(false);
    //         };
    //     }
    // }, [ws, connected, name, roomCode, playerId, initialWs]);

    const connectWebSocket = () => {
        if (name.trim() === "" || roomCode.trim() === "") return;

        const newWs = new WebSocket(
            `ws://localhost:8000/ws/${roomCode}/player`
        );

        newWs.onopen = () => {
            newWs.send(
                JSON.stringify({
                    type: "join",
                    name: name,
                })
            );
        };

        newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "game_start") {
                localStorage.setItem(
                    "playerInfo",
                    JSON.stringify({
                        playerId: data.playerId,
                        playerName: name,
                        roomCode: roomCode,
                    })
                );
                setGameStarted(true);
            } else if (data.type === "player_info") {
                setPlayerId(data.playerId);
                setConnected(true);
            } else if (data.type === "eliminated") {
                setEliminated(true);
            } else if (data.type === "reset_round") {
                setEliminated(false);
            } else if (data.type === "invalid_room_code") {
                alert("The entered room code is invalid.");
            }
        };

        newWs.onclose = () => {
            setConnected(false);
        };

        setWs(newWs);
    };

    if (gameStarted) {
        return (
            <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
                <h2 className="text-2xl font-semibold mb-4">
                    {eliminated
                        ? "You crashed"
                        : "Game has started... Don't crash!"}
                </h2>
                <PlayerControls ws={ws} playerId={playerId} />
            </div>
        );
    }

    if (connected) {
        return (
            <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
                <h3 className="text-4xl font-medium mb-2">Welcome {name}.</h3>
                <p className="text-base">
                    Waiting for the host to start the game...
                </p>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col justify-center items-center text-white px-4">
            <h2 className="text-2xl font-bold mb-6">Join Game</h2>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mb-4 p-3 w-64 rounded-md text-black focus:outline-none"
            />
            <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                className="mb-4 p-3 w-64 rounded-md text-black focus:outline-none"
            />
            <button
                onClick={connectWebSocket}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-3 px-6 rounded-md transition duration-300"
            >
                Join Game
            </button>
        </div>
    );
};

export default PlayerScreen;
