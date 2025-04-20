import { useEffect, useState, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";

export function usePlayerSocket(roomCode, initialPlayerId) {
    const [playerId, setPlayerId] = useState(null);
    const [playerName, setPlayerName] = useState("");
    const [gameStarted, setGameStarted] = useState(false);
    const [hasReconnected, setHasReconnected] = useState(false);

    const shouldConnect = !!roomCode,
        url = shouldConnect
            ? `ws://localhost:8000/ws/${roomCode}/player`
            : null;
    const { lastMessage, readyState, sendJson, connect, disconnect } =
        useWebSocket({
            url: url,
            autoConnect: true,
        });

    // When the socket is open, try to reconnect using localStorage
    useEffect(() => {
        if (readyState !== WebSocket.OPEN) return;

        const stored = localStorage.getItem("playerInfo");
        if (stored) {
            const { roomCode: storedRoom, playerId: storedId } =
                JSON.parse(stored);
            if (storedRoom === roomCode) {
                sendJson({
                    type: "reconnect",
                    room_code: roomCode,
                    player_id: storedId,
                });
            }
        }
    }, [readyState, roomCode, sendJson]);

    // Handle incoming messages
    useEffect(() => {
        if (!lastMessage) return;

        switch (lastMessage.type) {
            case "reconnect_success":
                setPlayerId(lastMessage.player.id);
                setPlayerName(lastMessage.player.name);
                setGameStarted(true);
                setHasReconnected(true);
                break;
            case "reconnect_failed":
                console.warn("Reconnection failed");
                localStorage.removeItem("playerInfo");
                setPlayerId(null);
                setPlayerName("");
                setGameStarted(false);
                break;
            case "game_start":
                setGameStarted(true);
                break;
            default:
                break;
        }
    }, [lastMessage]);

    // When joining for the first time
    const registerPlayer = useCallback(
        (id, name) => {
            setPlayerId(id);
            setPlayerName(name);
            localStorage.setItem(
                "playerInfo",
                JSON.stringify({
                    playerId: id,
                    roomCode,
                })
            );
        },
        [roomCode]
    );

    return {
        playerId,
        playerName,
        gameStarted,
        lastMessage,
        readyState,
        hasReconnected,
        registerPlayer,
        sendJson,
        connect,
        disconnect,
    };
}
