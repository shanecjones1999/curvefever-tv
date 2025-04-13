import React, { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import { Player } from "./models/Player";

const TVScreen = ({ roomCode }) => {
    const [players, setPlayers] = useState({});
    const [gameStarted, setGameStarted] = useState(false);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/${roomCode}/tv`);
        ws.onopen = () => setWs(ws);

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
                setPlayers((prev) => {
                    const updated = { ...prev };
                    Object.entries(data.players).forEach(([id, playerData]) => {
                        if (updated[id]) {
                            updated[id].update(
                                playerData.x,
                                playerData.y,
                                playerData.is_floating
                            );
                        }
                    });
                    return updated;
                });
            } else if (data.type === "reset_round") {
                setPlayers((prev) => {
                    const updated = { ...prev };
                    Object.values(updated).forEach((p) => p.reset());
                    return updated;
                });
            }
        };

        return () => {
            ws.close();
        };
    }, [roomCode]);

    const startGame = () => {
        if (ws) {
            ws.send(JSON.stringify({ type: "start_game" }));
            setGameStarted(true);
        }
    };

    return (
        <div className="h-screen overflow-hidden flex items-center justify-center text-white px-4">
            {gameStarted ? (
                <div className="text-center w-full">
                    <h2 className="text-3xl font-bold mb-6">
                        Game has started!
                    </h2>
                    <GameCanvas players={Object.values(players)} />
                </div>
            ) : (
                <div className="text-center max-w-xl w-full">
                    <h2 className="text-3xl font-bold mb-2">Lobby</h2>
                    <h3 className="text-xl mb-1">
                        Room Code:{" "}
                        <span className="font-mono tracking-widest bg-gray-800 px-3 py-1 rounded-md inline-block">
                            {roomCode}
                        </span>
                    </h3>
                    <h3 className="mt-4 text-gray-400 italic">
                        Waiting for players...
                    </h3>
                    <ul className="my-6 space-y-2">
                        {Object.values(players).map((player) => (
                            <li
                                key={player.name}
                                className="bg-white/10 rounded-md py-2 text-lg"
                            >
                                {player.name}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={startGame}
                        disabled={Object.keys(players).length === 0}
                        className={`px-6 py-3 text-lg rounded-lg font-semibold transition ${
                            Object.keys(players).length === 0
                                ? "bg-green-700 opacity-50 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                        }`}
                    >
                        Start Game
                    </button>
                </div>
            )}
        </div>
    );
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
//                     Object.values(updatedPlayers).forEach((player) =>
//                         player.reset()
//                     );
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
//             ws.send(JSON.stringify({ type: "start_game" }));
//             setGameStarted(true);
//         }
//     };

//     return (
//         <div style={styles.container}>
//             {gameStarted ? (
//                 <div style={styles.gameStarted}>
//                     <h2 style={styles.title}>Game has started!</h2>
//                     <GameCanvas players={Object.values(players)} />
//                 </div>
//             ) : (
//                 <div style={styles.lobby}>
//                     <h2 style={styles.title}>Lobby</h2>
//                     <h3 style={styles.subheading}>
//                         Room Code: <span style={styles.code}>{roomCode}</span>
//                     </h3>
//                     <h3 style={styles.waiting}>Waiting for players...</h3>
//                     <ul style={styles.playerList}>
//                         {Object.values(players).map((player) => (
//                             <li key={player.name} style={styles.playerItem}>
//                                 {player.name}
//                             </li>
//                         ))}
//                     </ul>
//                     <button
//                         style={{
//                             ...styles.startButton,
//                             opacity:
//                                 Object.keys(players).length === 0 ? 0.5 : 1,
//                             cursor:
//                                 Object.keys(players).length === 0
//                                     ? "not-allowed"
//                                     : "pointer",
//                         }}
//                         onClick={startGame}
//                         disabled={Object.keys(players).length === 0}
//                     >
//                         Start Game
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// const styles = {
//     container: {
//         height: "100vh",
//         background: "linear-gradient(135deg, #141e30, #243b55)",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//         color: "#fff",
//         padding: "20px",
//         boxSizing: "border-box",
//     },
//     lobby: {
//         textAlign: "center",
//         maxWidth: "600px",
//         width: "100%",
//     },
//     title: {
//         fontSize: "32px",
//         marginBottom: "10px",
//     },
//     subheading: {
//         fontSize: "20px",
//         margin: "10px 0",
//     },
//     code: {
//         fontWeight: "bold",
//         letterSpacing: "2px",
//         backgroundColor: "#222",
//         padding: "4px 8px",
//         borderRadius: "6px",
//     },
//     waiting: {
//         marginTop: "20px",
//         fontStyle: "italic",
//         color: "#ccc",
//     },
//     playerList: {
//         listStyleType: "none",
//         padding: 0,
//         margin: "20px 0",
//     },
//     playerItem: {
//         backgroundColor: "#ffffff22",
//         marginBottom: "10px",
//         padding: "10px",
//         borderRadius: "8px",
//         fontSize: "18px",
//     },
//     startButton: {
//         padding: "14px 28px",
//         fontSize: "18px",
//         backgroundColor: "#28a745",
//         color: "#fff",
//         border: "none",
//         borderRadius: "10px",
//         transition: "background 0.3s",
//     },
//     gameStarted: {
//         textAlign: "center",
//         width: "100%",
//     },
// };

// export default TVScreen;
