import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

const useGameWebSocket = (roomCode) => {
    const [messages, setMessages] = useState([]);
    const socketUrl = `ws://localhost:8000/ws/${roomCode}`;

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
        shouldReconnect: () => true,
    });

    useEffect(() => {
        if (lastMessage !== null) {
            setMessages((prev) => [...prev, lastMessage.data]);
        }
    }, [lastMessage]);

    return { sendMessage, messages, readyState };
};

export default useGameWebSocket;
