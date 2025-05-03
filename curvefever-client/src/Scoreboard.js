import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Scoreboard = ({ players }) => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const maxScore = Math.max(...players.map((p) => p.score), 1);

    return (
        <motion.div
            layout
            className="w-64 bg-gray-900 p-4 rounded-lg space-y-4"
        >
            <h2 className="text-2xl font-bold text-white text-center">
                Scoreboard
            </h2>
            <p className="text-white text-center text-sm">
                First to {Math.max(10, 10 * (players.length - 1))} points
            </p>

            <AnimatePresence>
                {sortedPlayers.map((player) => {
                    const percent = (player.score / maxScore) * 100;

                    return (
                        <motion.div
                            key={player.id}
                            layout="position"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-1"
                        >
                            <div className="text-xl flex justify-between items-center mb-1">
                                <span className="font-semibold">
                                    {player.name}
                                </span>
                                <span className="text-sm text-gray-200">
                                    {player.score} pts
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-4">
                                <div
                                    className="h-4 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${percent}%`,
                                        backgroundColor: player.color,
                                    }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
};

export default Scoreboard;
