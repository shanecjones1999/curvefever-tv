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

    useEffect(() => {
        if (!ws && connected) return;

        if (ws && !initialWs) {
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "game_start") {
                    localStorage.setItem(
                        "playerInfo",
                        JSON.stringify({
                            playerId: playerId,
                            playerName: name,
                            roomCode: roomCode,
                        })
                    );
                    setGameStarted(true);
                } else if (data.type === "player_info") {
                    setPlayerId(data.playerId);
                    setConnected(true);
                } else if (data.type === "invalid_room_code") {
                    alert("The entered room code is invalid.");
                }
            };

            ws.onclose = () => {
                setConnected(false);
            };
        }
    }, [ws, connected, name, roomCode, playerId, initialWs]);

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
            }
        };

        newWs.onclose = () => {
            setConnected(false);
        };

        setWs(newWs);
    };

    if (gameStarted) {
        return (
            <div style={styles.gameContainer}>
                <h2>Game has started! Get ready...</h2>
                <PlayerControls ws={ws} playerId={playerId} />
            </div>
        );
    }

    if (connected) {
        return (
            <div style={styles.gameContainer}>
                <h3>Connected as {name}</h3>
                <p>Waiting for the host to start the game...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Join Game</h2>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                style={styles.input}
            />
            <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                style={styles.input}
            />
            <button style={styles.button} onClick={connectWebSocket}>
                Join Game
            </button>
        </div>
    );
};

const styles = {
    container: {
        height: "100vh",
        background: "linear-gradient(135deg, #1f4037, #99f2c8)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#fff",
    },
    gameContainer: {
        textAlign: "center",
        padding: "40px",
        color: "#fff",
    },
    heading: {
        marginBottom: "30px",
        fontSize: "28px",
        fontWeight: "bold",
    },
    input: {
        padding: "12px 16px",
        marginBottom: "20px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        width: "250px",
        outline: "none",
    },
    button: {
        padding: "14px 28px",
        fontSize: "18px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
};

export default PlayerScreen;

// import React, { useState, useEffect } from "react";
// import PlayerControls from "./PlayerControls";

// const PlayerScreen = ({
//     ws: initialWs,
//     playerId: initialPlayerId,
//     playerName: initialName,
//     roomCode: initialRoomCode,
//     gameStarted: initialGameStarted,
// }) => {
//     const [name, setName] = useState(initialName || "");
//     const [connected, setConnected] = useState(!!initialWs);
//     const [gameStarted, setGameStarted] = useState(initialGameStarted || false);
//     const [roomCode, setRoomCode] = useState(initialRoomCode || "");
//     const [ws, setWs] = useState(initialWs || null);
//     const [playerId, setPlayerId] = useState(initialPlayerId || null);

//     // Handle messages only if ws is newly created here
//     useEffect(() => {
//         if (!ws && connected) return;

//         if (ws && !initialWs) {
//             ws.onmessage = (event) => {
//                 const data = JSON.parse(event.data);
//                 if (data.type === "game_start") {
//                     localStorage.setItem(
//                         "playerInfo",
//                         JSON.stringify({
//                             playerId: playerId,
//                             playerName: name,
//                             roomCode: roomCode,
//                         })
//                     );
//                     setGameStarted(true);
//                 } else if (data.type === "player_info") {
//                     setPlayerId(data.playerId);
//                     setConnected(true);
//                 } else if (data.type === "invalid_room_code") {
//                     alert("The entered room code is invalid.");
//                 }
//             };

//             ws.onclose = () => {
//                 setConnected(false);
//             };
//         }
//     }, [ws, connected, name, roomCode, playerId, initialWs]);

//     const connectWebSocket = () => {
//         if (name.trim() === "" || roomCode.trim() === "") return;

//         const newWs = new WebSocket(
//             `ws://localhost:8000/ws/${roomCode}/player`
//         );

//         newWs.onopen = () => {
//             newWs.send(
//                 JSON.stringify({
//                     type: "join",
//                     name: name,
//                 })
//             );
//         };

//         newWs.onmessage = (event) => {
//             const data = JSON.parse(event.data);
//             if (data.type === "game_start") {
//                 localStorage.setItem(
//                     "playerInfo",
//                     JSON.stringify({
//                         playerId: data.playerId,
//                         playerName: name,
//                         roomCode: roomCode,
//                     })
//                 );
//                 setGameStarted(true);
//             } else if (data.type === "player_info") {
//                 setPlayerId(data.playerId);
//                 setConnected(true);
//             }
//         };

//         newWs.onclose = () => {
//             setConnected(false);
//         };

//         setWs(newWs);
//     };

//     if (gameStarted) {
//         return (
//             <div>
//                 <h2>Game has started! Get ready...</h2>
//                 <PlayerControls ws={ws} playerId={playerId} />
//             </div>
//         );
//     }

//     if (connected) {
//         return <h3>Connected as {name}</h3>;
//     }

//     return (
//         <div style={{ textAlign: "center", marginTop: "50px" }}>
//             <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Enter your name"
//             />
//             <input
//                 type="text"
//                 value={roomCode}
//                 onChange={(e) => setRoomCode(e.target.value)}
//                 placeholder="Enter room code"
//             />
//             <button onClick={connectWebSocket}>Join Game</button>
//         </div>
//     );
// };

// export default PlayerScreen;
