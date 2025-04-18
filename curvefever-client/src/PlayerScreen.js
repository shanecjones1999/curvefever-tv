import React, { useEffect, useState } from "react";
import PlayerControls from "./PlayerControls";
import { usePlayerSocket } from "./hooks/usePlayerSocket";

const PlayerScreen = () => {
    const [name, setName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [eliminated, setEliminated] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [hasJoined, setHasJoined] = useState(false);

    const {
        playerId,
        playerName,
        gameStarted,
        readyState,
        lastMessage,
        registerPlayer,
        sendJson,
    } = usePlayerSocket(roomCode);

    const connected = readyState === WebSocket.OPEN;

    // Handle incoming game state updates
    useEffect(() => {
        if (!lastMessage) return;

        switch (lastMessage.type) {
            case "player_info":
                registerPlayer(lastMessage.playerId, name);
                break;
            case "game_start":
                setEliminated(false);
                break;
            case "eliminated":
                setEliminated(true);
                break;
            case "reset_round":
                setEliminated(false);
                break;
            case "invalid_room_code":
                alert("The entered room code is invalid.");
                break;
            case "tv_disconnect":
                alert("The host (TV) has disconnected. The game will end.");
                window.location.href = "/";
                break;
            case "countdown":
                setCountdown(lastMessage.seconds);
                break;
            default:
                break;
        }
    }, [lastMessage, name, registerPlayer]);

    const handleJoin = () => {
        if (!connected || !name) return;
        sendJson({ type: "join", name });
        setHasJoined(true);
    };

    const sendDirection = (left, right) => {
        if (playerId) {
            sendJson({ type: "move", playerId, state: { left, right } });
        }
    };

    // --------------------------
    // UI render logic
    // --------------------------

    if (gameStarted) {
        return (
            <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
                <h2 className="text-2xl font-semibold mb-4">
                    {eliminated
                        ? "You crashed"
                        : "Game has started... Don't crash!"}
                </h2>
                <PlayerControls
                    sendDirection={sendDirection}
                    disabled={eliminated}
                />
            </div>
        );
    }

    if (connected && hasJoined) {
        return (
            <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
                {countdown !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 text-white text-8xl font-bold">
                        {countdown > 0 ? countdown : "GO!"}
                    </div>
                )}
                <h3 className="text-4xl font-medium mb-2">
                    Welcome {playerName || name}.
                </h3>
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
                onClick={handleJoin}
                disabled={!name || !roomCode || hasJoined}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 transform text-white text-lg font-medium py-3 px-6 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Join Game
            </button>
        </div>
    );
};

export default PlayerScreen;

// import React, { useState, useEffect } from "react";
// import PlayerControls from "./PlayerControls";
// import { useWebSocket } from "./hooks/useWebSocket";

// const PlayerScreen = ({
//     playerId: initialPlayerId,
//     playerName: initialName,
//     roomCode: initialRoomCode,
//     gameStarted: initialGameStarted,
// }) => {
//     const [name, setName] = useState(initialName || "");
//     const [roomCode, setRoomCode] = useState(initialRoomCode || "");
//     const [playerId, setPlayerId] = useState(initialPlayerId || null);
//     const [gameStarted, setGameStarted] = useState(initialGameStarted || false);
//     const [eliminated, setEliminated] = useState(false);
//     const [countdown, setCountdown] = useState(null);
//     const [shouldConnect, setShouldConnect] = useState(false);
//     const [connected, setConnected] = useState(false);

//     const url =
//         roomCode && name ? `ws://localhost:8000/ws/${roomCode}/player` : null;

//     const { sendJson, lastMessage, readyState, connect } = useWebSocket({
//         url,
//         autoConnect: false,
//     });

//     useEffect(() => {
//         if (shouldConnect && url) {
//             connect();
//             setShouldConnect(false);
//         }
//     }, [shouldConnect, url, connect]);

//     // watch readyState
//     useEffect(() => {
//         setConnected(readyState === WebSocket.OPEN);
//     }, [readyState]);

//     useEffect(() => {
//         if (!lastMessage) return;

//         const data = lastMessage;

//         switch (data.type) {
//             case "game_start":
//                 localStorage.setItem(
//                     "playerInfo",
//                     JSON.stringify({
//                         playerId: data.playerId,
//                         playerName: name,
//                         roomCode,
//                     })
//                 );
//                 setGameStarted(true);
//                 break;
//             case "player_info":
//                 setPlayerId(data.playerId);
//                 break;
//             case "eliminated":
//                 setEliminated(true);
//                 break;
//             case "reset_round":
//                 setEliminated(false);
//                 break;
//             case "invalid_room_code":
//                 alert("The entered room code is invalid.");
//                 break;
//             case "tv_disconnect":
//                 alert("The host (TV) has disconnected. The game will end.");
//                 window.location.href = "/";
//                 break;
//             case "countdown":
//                 setCountdown(data.seconds);
//                 break;
//             default:
//                 break;
//         }
//     }, [lastMessage]);

//     useEffect(() => {
//         if (connected && name) {
//             sendJson({ type: "join", name });
//         }
//     }, [connected, name, sendJson]);

//     const sendDirection = (left, right) => {
//         if (playerId) {
//             sendJson({ type: "move", playerId, state: { left, right } });
//         }
//     };

//     if (gameStarted) {
//         return (
//             <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
//                 <h2 className="text-2xl font-semibold mb-4">
//                     {eliminated
//                         ? "You crashed"
//                         : "Game has started... Don't crash!"}
//                 </h2>
//                 <PlayerControls
//                     sendDirection={sendDirection}
//                     disabled={eliminated}
//                 />
//             </div>
//         );
//     }

//     if (connected) {
//         return (
//             <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
//                 {countdown !== null && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 text-white text-8xl font-bold">
//                         {countdown > 0 ? countdown : "GO!"}
//                     </div>
//                 )}
//                 <h3 className="text-4xl font-medium mb-2">Welcome {name}.</h3>
//                 <p className="text-base">
//                     Waiting for the host to start the game...
//                 </p>
//             </div>
//         );
//     }

//     return (
//         <div className="h-screen flex flex-col justify-center items-center text-white px-4">
//             <h2 className="text-2xl font-bold mb-6">Join Game</h2>
//             <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Enter your name"
//                 className="mb-4 p-3 w-64 rounded-md text-black focus:outline-none"
//             />
//             <input
//                 type="text"
//                 value={roomCode}
//                 onChange={(e) => setRoomCode(e.target.value)}
//                 placeholder="Enter room code"
//                 className="mb-4 p-3 w-64 rounded-md text-black focus:outline-none"
//             />
//             <button
//                 onClick={() => setShouldConnect(true)}
//                 disabled={!name || !roomCode || connected}
//                 className="bg-blue-600 hover:bg-blue-700 active:scale-95 transform text-white text-lg font-medium py-3 px-6 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//                 Join Game
//             </button>
//         </div>
//     );
// };

// export default PlayerScreen;

// // import React, { useState, useEffect } from "react";
// // import PlayerControls from "./PlayerControls";
// // import { useWebSocket } from "./hooks/useWebSocket";

// // const PlayerScreen = ({
// //     ws: initialWs,
// //     playerId: initialPlayerId,
// //     playerName: initialName,
// //     roomCode: initialRoomCode,
// //     gameStarted: initialGameStarted,
// // }) => {
// //     const [name, setName] = useState(initialName || "");
// //     const [connected, setConnected] = useState(!!initialWs);
// //     const [gameStarted, setGameStarted] = useState(initialGameStarted || false);
// //     const [roomCode, setRoomCode] = useState(initialRoomCode || "");
// //     const [ws, setWs] = useState(initialWs || null);
// //     const [playerId, setPlayerId] = useState(initialPlayerId || null);
// //     const [eliminated, setEliminated] = useState(false);
// //     const [shouldConnect, setShouldConnect] = useState(false);

// //     const [countdown, setCountdown] = useState(null);

// //     useEffect(() => {
// //         if (!shouldConnect || connected || ws || !name || !roomCode) return;

// //         const newWs = new WebSocket(
// //             `ws://localhost:8000/ws/${roomCode}/player`
// //         );

// //         newWs.onopen = () => {
// //             newWs.send(JSON.stringify({ type: "join", name }));
// //         };

// //         newWs.onmessage = (event) => {
// //             const data = JSON.parse(event.data);

// //             if (data.type === "game_start") {
// //                 localStorage.setItem(
// //                     "playerInfo",
// //                     JSON.stringify({
// //                         playerId: data.playerId,
// //                         playerName: name,
// //                         roomCode,
// //                     })
// //                 );
// //                 setGameStarted(true);
// //             } else if (data.type === "player_info") {
// //                 setPlayerId(data.playerId);
// //                 setConnected(true);
// //             } else if (data.type === "eliminated") {
// //                 setEliminated(true);
// //             } else if (data.type === "reset_round") {
// //                 setEliminated(false);
// //             } else if (data.type === "invalid_room_code") {
// //                 setShouldConnect(false);
// //                 setWs(null);
// //                 alert("The entered room code is invalid.");
// //             } else if (data.type === "tv_disconnect") {
// //                 alert("The host (TV) has disconnected. The game will end.");
// //                 window.location.href = "/";
// //             } else if (data.type === "countdown") {
// //                 setCountdown(data.seconds);
// //             }
// //         };

// //         newWs.onclose = () => {
// //             setConnected(false);
// //         };

// //         setWs(newWs);
// //         setShouldConnect(false);
// //     }, [shouldConnect, name, roomCode, connected, ws]);

// //     const sendDirection = (left, right) => {
// //         if (ws && playerId) {
// //             ws.send(
// //                 JSON.stringify({
// //                     type: "move",
// //                     playerId,
// //                     state: { left, right },
// //                 })
// //             );
// //         }
// //     };

// //     if (gameStarted) {
// //         return (
// //             <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
// //                 <h2 className="text-2xl font-semibold mb-4">
// //                     {eliminated
// //                         ? "You crashed"
// //                         : "Game has started... Don't crash!"}
// //                 </h2>
// //                 <PlayerControls
// //                     sendDirection={sendDirection}
// //                     disabled={eliminated}
// //                 />
// //             </div>
// //         );
// //     }

// //     if (connected) {
// //         return (
// //             <div className="h-screen flex flex-col justify-center items-center text-white text-center px-4">
// //                 {countdown !== null && (
// //                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 text-white text-8xl font-bold">
// //                         {countdown > 0 ? countdown : "GO!"}
// //                     </div>
// //                 )}
// //                 <h3 className="text-4xl font-medium mb-2">Welcome {name}.</h3>
// //                 <p className="text-base">
// //                     Waiting for the host to start the game...
// //                 </p>
// //             </div>
// //         );
// //     }

// //     return (
// //         <div className="h-screen flex flex-col justify-center items-center text-white px-4">
// //             <h2 className="text-2xl font-bold mb-6">Join Game</h2>
// //             <input
// //                 type="text"
// //                 value={name}
// //                 onChange={(e) => setName(e.target.value)}
// //                 placeholder="Enter your name"
// //                 className="mb-4 p-3 w-64 rounded-md text-black focus:outline-none"
// //             />
// //             <input
// //                 type="text"
// //                 value={roomCode}
// //                 onChange={(e) => setRoomCode(e.target.value)}
// //                 placeholder="Enter room code"
// //                 className="mb-4 p-3 w-64 rounded-md text-black focus:outline-none"
// //             />
// //             <button
// //                 onClick={() => setShouldConnect(true)}
// //                 disabled={!name || !roomCode || connected}
// //                 className="bg-blue-600 hover:bg-blue-700 active:scale-95 transform text-white text-lg font-medium py-3 px-6 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
// //             >
// //                 Join Game
// //             </button>
// //         </div>
// //     );
// // };

// // export default PlayerScreen;
