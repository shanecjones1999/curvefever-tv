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
                    Object.values(updatedPlayers).forEach((player) =>
                        player.reset()
                    );
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
            ws.send(JSON.stringify({ type: "start_game" }));
            setGameStarted(true);
        }
    };

    return (
        <div style={styles.container}>
            {gameStarted ? (
                <div style={styles.gameStarted}>
                    <h2 style={styles.title}>Game has started!</h2>
                    <GameCanvas players={Object.values(players)} />
                </div>
            ) : (
                <div style={styles.lobby}>
                    <h2 style={styles.title}>Lobby</h2>
                    <h3 style={styles.subheading}>
                        Room Code: <span style={styles.code}>{roomCode}</span>
                    </h3>
                    <h3 style={styles.waiting}>Waiting for players...</h3>
                    <ul style={styles.playerList}>
                        {Object.values(players).map((player) => (
                            <li key={player.name} style={styles.playerItem}>
                                {player.name}
                            </li>
                        ))}
                    </ul>
                    <button
                        style={{
                            ...styles.startButton,
                            opacity:
                                Object.keys(players).length === 0 ? 0.5 : 1,
                            cursor:
                                Object.keys(players).length === 0
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                        onClick={startGame}
                        disabled={Object.keys(players).length === 0}
                    >
                        Start Game
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        height: "100vh",
        background: "linear-gradient(135deg, #141e30, #243b55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#fff",
        padding: "20px",
        boxSizing: "border-box",
    },
    lobby: {
        textAlign: "center",
        maxWidth: "600px",
        width: "100%",
    },
    title: {
        fontSize: "32px",
        marginBottom: "10px",
    },
    subheading: {
        fontSize: "20px",
        margin: "10px 0",
    },
    code: {
        fontWeight: "bold",
        letterSpacing: "2px",
        backgroundColor: "#222",
        padding: "4px 8px",
        borderRadius: "6px",
    },
    waiting: {
        marginTop: "20px",
        fontStyle: "italic",
        color: "#ccc",
    },
    playerList: {
        listStyleType: "none",
        padding: 0,
        margin: "20px 0",
    },
    playerItem: {
        backgroundColor: "#ffffff22",
        marginBottom: "10px",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "18px",
    },
    startButton: {
        padding: "14px 28px",
        fontSize: "18px",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        transition: "background 0.3s",
    },
    gameStarted: {
        textAlign: "center",
        width: "100%",
    },
};

export default TVScreen;

// import React, { useState, useEffect } from "react";
// import GameCanvas from "./GameCanvas";
// import { Player } from "./models/Player";

// const TVScreen = ({ roomCode }) => {
//     const [players, setPlayers] = useState({});
//     const [gameStarted, setGameStarted] = useState(false);
//     const [ws, setWs] = useState(null);

//     useEffect(() => {
//         const ws = new WebSocket(`ws://localhost:8000/ws/${roomCode}/tv`);

//         ws.onopen = () => {
//             setWs(ws);
//         };

//         ws.onmessage = (event) => {
//             const data = JSON.parse(event.data);
//             if (data.type === "lobby") {
//                 const playerDict = {};
//                 Object.entries(data.players).forEach(([id, playerData]) => {
//                     playerDict[id] = new Player(
//                         id,
//                         playerData.name,
//                         playerData.radius,
//                         playerData.color,
//                         playerData.eliminated
//                     );
//                 });

//                 setPlayers(playerDict);
//             } else if (data.type === "game_update") {
//                 setPlayers((prevPlayers) => {
//                     const updatedPlayers = { ...prevPlayers };

//                     Object.entries(data.players).forEach(([id, playerData]) => {
//                         if (updatedPlayers[id]) {
//                             updatedPlayers[id].update(
//                                 playerData.x,
//                                 playerData.y,
//                                 playerData.is_floating
//                             );
//                         }
//                     });

//                     return updatedPlayers;
//                 });
//             } else if (data.type === "reset_round") {
//                 setPlayers((prevPlayers) => {
//                     const updatedPlayers = { ...prevPlayers };

//                     Object.values(updatedPlayers).forEach((player) => {
//                         player.reset();
//                     });

//                     return updatedPlayers;
//                 });
//             }
//         };

//         return () => {
//             console.log("Closing websocket");
//             ws.close();
//         };
//     }, []);

//     const startGame = () => {
//         if (ws) {
//             ws.send(
//                 JSON.stringify({
//                     type: "start_game",
//                 })
//             );
//             setGameStarted(true);
//         }
//     };

//     return (
//         <div style={{ textAlign: "center", marginTop: "50px" }}>
//             {gameStarted ? (
//                 <div>
//                     <h2>Game has started!</h2>
//                     <GameCanvas players={Object.values(players)} />
//                 </div>
//             ) : (
//                 <>
//                     <h2>Lobby</h2>
//                     <h3>Room code: {roomCode}</h3>
//                     <h3>Waiting for players...</h3>
//                     <ul>
//                         {Object.values(players).map((player) => (
//                             <li key={player.name}>{player.name}</li>
//                         ))}
//                     </ul>
//                     <button
//                         onClick={startGame}
//                         disabled={Object.keys(players).length === 0}
//                     >
//                         Start Game
//                     </button>
//                 </>
//             )}
//         </div>
//     );
// };

// export default TVScreen;
