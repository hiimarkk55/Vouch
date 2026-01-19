"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_ROASTS = [
    { id: 1, user: "@User_01", msg: "Your HRV is high but your activity is 0. Log 20 mins or lose your ante.", timestamp: "2m ago" },
    { id: 2, user: "@Slayer_X", msg: "Ghosting the 6AM session again? The Squad ledger never forgets.", timestamp: "15m ago" },
    { id: 3, user: "@Coach_V", msg: "Rest is for the dead. Your sleep data shows 9 hours. Over-optimized. Get moving.", timestamp: "1h ago" },
    { id: 4, user: "@Anon_99", msg: "Ante increased by 50 credits due to missed check-in. Ouch.", timestamp: "2h ago" },
];

export default function RoastFeed() {
    const [roasts, setRoasts] = useState(MOCK_ROASTS);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [roasts]);

    return (
        <div className="bg-black/80 border border-red-900/30 rounded-lg p-4 font-mono text-sm h-64 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-red-900/20 pb-2">
                <h3 className="text-red-500 uppercase tracking-tighter font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    AI_ROAST_FEED
                </h3>
                <span className="text-[10px] text-gray-600">THREAT_LEVEL: MODERATE</span>
            </div>

            <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2">
                <AnimatePresence initial={false}>
                    {roasts.map((roast) => (
                        <motion.div
                            key={roast.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="border-l border-red-500/20 pl-3 py-1"
                        >
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="text-red-400">{roast.user}</span>
                                <span className="text-gray-600">{roast.timestamp}</span>
                            </div>
                            <p className="text-gray-300 leading-tight">
                                {roast.msg}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-4 pt-2 border-t border-red-900/20 text-[10px] text-gray-700 italic">
                // System monitoring active...
            </div>
        </div>
    );
}
