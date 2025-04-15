import React, { useState, useEffect } from "react";
import TVScreen from "./TVScreen";
import PlayerScreen from "./PlayerScreen";

const App = () => {
    const [view, setView] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [ws, setWs] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [playerName, setPlayerName] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);

    const handleTVClick = async () => {
        try {
            const response = await fetch("http://10.0.0.26:8000/get_room_code");
            const data = await response.json();
            setRoomCode(data.room_code);
            setView("tv");
        } catch (error) {
            alert("Failed to create a room. Please try again later.");
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem("playerInfo");
        if (stored) {
            const savedPlayer = JSON.parse(stored);
            const { roomCode, playerId, playerName } = savedPlayer;

            const newWs = new WebSocket(
                `ws://10.0.0.26:8000/ws/${roomCode}/player`
            );

            newWs.onopen = () => {
                newWs.send(
                    JSON.stringify({
                        type: "reconnect",
                        room_code: roomCode,
                        player_id: playerId,
                    })
                );
            };

            newWs.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "reconnect_success") {
                    console.log("Reconnected successfully:", data.player);
                    setView("player");
                    setRoomCode(roomCode);
                    setPlayerId(playerId);
                    setPlayerName(playerName);
                    setWs(newWs);
                    setGameStarted(true);
                } else if (data.type === "reconnect_failed") {
                    console.warn("Failed to reconnect. Clearing saved data.");
                    localStorage.removeItem("playerInfo");
                } else if (data.type === "game_start") {
                    setGameStarted(true);
                }
            };

            newWs.onerror = (e) => {
                console.error("WebSocket error:", e);
            };

            return () => {
                newWs.close();
            };
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 p-8 text-center">
            {!view ? (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-100">
                        curvefever.tv
                    </h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleTVClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
                        >
                            Create Room
                        </button>
                        <button
                            onClick={() => setView("player")}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
                        >
                            Join Room
                        </button>
                    </div>
                </div>
            ) : view === "tv" ? (
                <TVScreen roomCode={roomCode} />
            ) : (
                <PlayerScreen
                    ws={ws}
                    playerId={playerId}
                    playerName={playerName}
                    roomCode={roomCode}
                    gameStarted={gameStarted}
                />
            )}
        </div>
    );
};

export default App;

// import React, { useState, useEffect } from "react";
// import TVScreen from "./TVScreen";
// import PlayerScreen from "./PlayerScreen";

// const App = () => {
//     const [view, setView] = useState("");
//     const [roomCode, setRoomCode] = useState("");
//     const [ws, setWs] = useState(null);
//     const [playerId, setPlayerId] = useState(null);
//     const [playerName, setPlayerName] = useState(null);
//     const [gameStarted, setGameStarted] = useState(false);

//     const handleTVClick = async () => {
//         const response = await fetch("http://10.0.0.26:8000/get_room_code");
//         const data = await response.json();
//         setRoomCode(data.room_code);
//         setView("tv");
//     };

//     useEffect(() => {
//         const stored = localStorage.getItem("playerInfo");
//         if (stored) {
//             const savedPlayer = JSON.parse(stored);
//             const { roomCode, playerId, playerName } = savedPlayer;

//             const newWs = new WebSocket(
//                 `ws://10.0.0.26:8000/ws/${roomCode}/player`
//             );

//             newWs.onopen = () => {
//                 newWs.send(
//                     JSON.stringify({
//                         type: "reconnect",
//                         room_code: roomCode,
//                         player_id: playerId,
//                     })
//                 );
//             };

//             newWs.onmessage = (event) => {
//                 const data = JSON.parse(event.data);

//                 if (data.type === "reconnect_success") {
//                     console.log("Reconnected successfully:", data.player);
//                     setView("player");
//                     setRoomCode(roomCode);
//                     setPlayerId(playerId);
//                     setPlayerName(playerName);
//                     setWs(newWs);
//                     setGameStarted(true);
//                 } else if (data.type === "reconnect_failed") {
//                     console.warn("Failed to reconnect. Clearing saved data.");
//                     localStorage.removeItem("playerInfo");
//                 } else if (data.type === "game_start") {
//                     setGameStarted(true);
//                 }
//             };

//             newWs.onerror = (e) => {
//                 console.error("WebSocket error:", e);
//             };

//             return () => {
//                 newWs.close();
//             };
//         }
//     }, []);

//     return (
//         <div style={styles.container}>
//             <div className="text-red-500 text-3xl font-bold">
//                 If this is red and bold, Tailwind is working!
//             </div>

//             {!view ? (
//                 <div style={styles.buttonContainer}>
//                     <button style={styles.button} onClick={handleTVClick}>
//                         I'm the TV
//                     </button>
//                     <button
//                         style={{ ...styles.button, backgroundColor: "#28a745" }}
//                         onClick={() => setView("player")}
//                     >
//                         Join as Player
//                     </button>
//                 </div>
//             ) : view === "tv" ? (
//                 <TVScreen roomCode={roomCode} />
//             ) : (
//                 <PlayerScreen
//                     ws={ws}
//                     playerId={playerId}
//                     playerName={playerName}
//                     roomCode={roomCode}
//                     gameStarted={gameStarted}
//                 />
//             )}
//         </div>
//     );
// };

// const styles = {
//     container: {
//         height: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         background: "linear-gradient(135deg, #1e3c72, #2a5298)",
//         color: "#fff",
//         fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//     },
//     buttonContainer: {
//         display: "flex",
//         flexDirection: "column",
//         gap: "20px",
//     },
//     button: {
//         padding: "16px 32px",
//         fontSize: "18px",
//         fontWeight: "bold",
//         borderRadius: "10px",
//         border: "none",
//         backgroundColor: "#007bff",
//         color: "white",
//         cursor: "pointer",
//         transition: "background-color 0.3s ease, transform 0.2s ease",
//     },
// };

// export default App;
