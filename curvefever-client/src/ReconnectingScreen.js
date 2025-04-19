import { useEffect } from "react";
import { usePlayerSocket } from "./hooks/usePlayerSocket";

const ReconnectingScreen = ({ roomCode, onSuccess, onFailure }) => {
    const { hasReconnected, reconnectionAttempted } = usePlayerSocket(roomCode);

    useEffect(() => {
        // if (!reconnectionAttempted) return;
        if (hasReconnected) {
            onSuccess();
        } else {
            onFailure();
        }
    }, [hasReconnected, reconnectionAttempted, onSuccess, onFailure]);

    return (
        <div className="text-white text-lg animate-pulse">
            Reconnecting to your game...
        </div>
    );
};

export default ReconnectingScreen;
