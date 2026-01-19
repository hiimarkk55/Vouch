"use client";

import { motion } from "framer-motion";

interface TrainerMissionProps {
    trainer: string;
    cost: number;
    requirement: string;
    title: string;
}

export default function TrainerMissionCard({ trainer, cost, requirement, title }: TrainerMissionProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#0a0a0a] border-2 border-[var(--bio-blue)] p-6 rounded-none relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 bg-[var(--bio-blue)] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest skew-x-[-15deg] translate-x-2">
                Active Mission
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h4>
                    <p className="text-[10px] text-[var(--bio-blue)] uppercase tracking-[0.2em] mt-1">
                        Assigned by: DM_{trainer.toUpperCase()}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-4 my-4">
                    <div>
                        <span className="text-[8px] text-gray-500 uppercase block mb-1">Entry Cost</span>
                        <span className="text-white font-mono">{cost} CREDITS</span>
                    </div>
                    <div>
                        <span className="text-[8px] text-gray-500 uppercase block mb-1">Requirement</span>
                        <span className="text-white font-mono">{requirement}</span>
                    </div>
                </div>

                <button className="w-full bg-white text-black font-bold py-3 text-sm uppercase tracking-widest hover:bg-[var(--bio-blue)] transition-colors duration-200">
                    Join Mission_
                </button>
            </div>

            {/* Decorative background element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[var(--bio-blue)]/5 rounded-full blur-2xl group-hover:bg-[var(--bio-blue)]/10 transition-colors"></div>
        </motion.div>
    );
}
