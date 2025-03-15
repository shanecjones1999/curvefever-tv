import React, { useState } from "react";
import TVScreen from "./TVScreen";
import PlayerJoin from "./PlayerJoin";

const App = () => {
    const [view, setView] = useState(""); // "tv" or "player"

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {!view ? (
                <div>
                    <button onClick={() => setView("tv")}>I'm the TV</button>
                    <button onClick={() => setView("player")}>
                        Join as Player
                    </button>
                </div>
            ) : view === "tv" ? (
                <TVScreen />
            ) : (
                <PlayerJoin />
            )}
        </div>
    );
};

export default App;
