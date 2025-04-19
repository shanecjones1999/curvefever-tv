import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket({ url, autoConnect = true }) {
    const wsRef = useRef(null);
    const [lastMessage, setLastMessage] = useState(null);
    const [readyState, setReadyState] = useState(WebSocket.CLOSED);

    const connect = useCallback(() => {
        if (!url) {
            return;
        }
        if (wsRef.current) wsRef.current.close();

        const socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onopen = () => setReadyState(socket.readyState);
        socket.onclose = () => setReadyState(socket.readyState);
        socket.onerror = () => setReadyState(socket.readyState);

        socket.onmessage = (event) => {
            try {
                setLastMessage(JSON.parse(event.data));
            } catch (err) {
                console.warn("Failed to parse message", err);
            }
        };
    }, [url]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    const sendJson = useCallback((msg) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        }
    }, []);

    useEffect(() => {
        if (autoConnect) connect();
        return () => disconnect();
    }, [autoConnect, connect, disconnect]);

    return {
        connect,
        disconnect,
        sendJson,
        lastMessage,
        readyState,
    };
}
