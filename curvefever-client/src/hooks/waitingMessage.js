import { useEffect, useState } from "react";

const WaitingMessage = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length < 3 ? prev + "." : ""));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <h3 className="mt-4 text-white text-lg animate-pulse">
            <span>Waiting for players</span>
            <span className="inline-block w-6 text-left">{dots}</span>
        </h3>
    );
};

export default WaitingMessage;
