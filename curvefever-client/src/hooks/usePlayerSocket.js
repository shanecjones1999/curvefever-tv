import { useEffect, useRef, useState } from "react";

export function usePlayerSocket(wsUrl) {
    const [readyState, setReadyState] = useState(WebSocket.CLOSED);
    const [playerId, setPlayerId] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);

    const socketRef = useRef(null);
    const messageQueue = useRef([]);

    useEffect(() => {
        if (!wsUrl) return;

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            setReadyState(WebSocket.OPEN);

            // Flush any queued messages
            messageQueue.current.forEach((msg) =>
                socket.send(JSON.stringify(msg))
            );
            messageQueue.current = [];
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLastMessage(data);
            if (data.type === "game_start") {
                setGameStarted(true);
            }
        };

        socket.onclose = () => setReadyState(WebSocket.CLOSED);
        socket.onerror = () => setReadyState(WebSocket.CLOSED);

        return () => {
            socket.close();
        };
    }, [wsUrl]);

    const sendJson = (data) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        } else {
            messageQueue.current.push(data);
        }
    };

    const registerPlayer = (id) => {
        setPlayerId(id);
        localStorage.setItem(
            "playerInfo",
            JSON.stringify({
                playerId: id,
                roomCode: wsUrl?.split("/")[4],
            })
        );
    };

    return {
        playerId,
        gameStarted,
        readyState,
        lastMessage,
        registerPlayer,
        sendJson,
    };
}
