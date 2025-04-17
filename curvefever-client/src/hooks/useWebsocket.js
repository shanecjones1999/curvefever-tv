import { useEffect, useRef, useState, useCallback } from "react";

export const useWebSocket = (url, { shouldConnect, onMessage }) => {
    const wsRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const reconnectTimeout = useRef(null);

    const connect = useCallback(() => {
        if (!shouldConnect || wsRef.current) return;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected");
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage?.(data);
            } catch (err) {
                console.error("Error parsing WebSocket message", err);
            }
        };

        ws.onerror = (err) => {
            console.error("WebSocket error", err);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setConnected(false);
            wsRef.current = null;

            if (shouldConnect) {
                reconnectTimeout.current = setTimeout(connect, 2000);
            }
        };
    }, [url, onMessage, shouldConnect]);

    useEffect(() => {
        if (shouldConnect) connect();

        return () => {
            clearTimeout(reconnectTimeout.current);
            wsRef.current?.close();
        };
    }, [connect, shouldConnect]);

    const send = useCallback((data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        } else {
            console.warn("WebSocket is not open. Message not sent.");
        }
    }, []);

    return { connected, send };
};
