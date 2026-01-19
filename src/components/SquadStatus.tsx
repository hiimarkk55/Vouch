"use client";

import { motion } from "framer-motion";

export default function SquadStatus() {
    const slots = [
        { id: 1, filled: true, avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=user1" },
        { id: 2, filled: true, avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=user2" },
        { id: 3, filled: true, avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=user3" },
        { id: 4, filled: false },
        { id: 5, filled: false },
    ];

    return (
        <section className="py-12 border-y border-white/5 space-y-6">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-mono">
                {">"} SQUAD_STATUS: ACTIVE
            </h3>
            <div className="flex gap-4">
                {slots.map((slot) => (
                    <div key={slot.id} className="relative">
                        {slot.filled ? (
                            <div className="w-12 h-12 rounded-full border border-[var(--bio-blue)]/50 overflow-hidden bg-black flex items-center justify-center p-1">
                                <img src={slot.avatar} alt="Avatar" className="w-full h-full opacity-80" />
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-12 h-12 rounded-full border border-[var(--bio-blue)] border-dashed flex items-center justify-center text-[var(--bio-blue)] bg-[var(--bio-blue)]/5"
                                animate={{
                                    boxShadow: [
                                        "0 0 0px rgba(0, 255, 255, 0)",
                                        "0 0 10px rgba(0, 255, 255, 0.4)",
                                        "0 0 0px rgba(0, 255, 255, 0)",
                                    ],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <span className="text-xl font-light">+</span>
                            </motion.button>
                        )}
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                Invite 2 more to unlock Full-Squad multiplier
            </p>
        </section>
    );
}
