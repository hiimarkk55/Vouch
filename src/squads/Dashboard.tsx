"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import RoastFeed from "../components/RoastFeed";
import TrainerMissionCard from "../components/TrainerMission";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_LEADERBOARD = [
    { rank: 1, user: "0x71...9A2", score: 9850, status: "ELITE" },
    { rank: 2, user: "0x3B...4C1", score: 9240, status: "VANGUARD" },
    { rank: 3, user: "0x9F...B2D", score: 8900, status: "VANGUARD" },
    { rank: 4, user: "You", score: 100, status: "INITIATE" },
    { rank: 5, user: "0xA1...EE4", score: 0, status: "NOVICE" },
];

export default function Dashboard() {
    const { logout, user, authenticated } = usePrivy();
    const [showSquadModal, setShowSquadModal] = useState(false);

    useEffect(() => {
        // Trigger modal after login
        if (authenticated) {
            const timer = setTimeout(() => setShowSquadModal(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [authenticated]);

    return (
        <div className="min-h-screen bg-[#050505] font-mono p-4 md:p-8">
            <nav className="flex justify-between items-center mb-12 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h1 className="text-lg font-bold">VOUCH_OS v1.4</h1>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-xs text-gray-500 hidden md:block">{user?.wallet?.address || user?.email?.address}</span>
                    <button
                        onClick={logout}
                        className="text-xs text-red-400 hover:text-red-300 uppercase underline"
                    >
                        Disconnect
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                {/* Main Status Panel */}
                <section className="col-span-2 space-y-8">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-2">Member Status</h2>
                                <div className="text-4xl text-[var(--bio-blue)] font-bold mb-1">VERIFIED</div>
                                <p className="text-green-500 text-xs tracking-wider">● CLEARANCE LEVEL 1 GRANTED</p>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-500 uppercase mb-1">Sweat Currency</div>
                                <div className="text-2xl font-mono">1,250 <span className="text-[var(--bio-blue)]">V</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <TrainerMissionCard
                            trainer="Vanguard"
                            cost={500}
                            requirement="HRV > 65ms"
                            title="Operation: Redline"
                        />
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Upcoming Mission</h3>
                                <p className="text-gray-400 text-sm italic">Connect your wearable to unlock personalized missions from Dungeon Masters.</p>
                            </div>
                            <button className="mt-8 text-[10px] border border-white/20 py-2 hover:bg-white/5 uppercase tracking-widest">Connect Device +</button>
                        </div>
                    </div>

                    <RoastFeed />
                </section>

                {/* Leaderboard */}
                <section className="space-y-6">
                    <div className="bg-black border border-[var(--bio-blue)]/30 rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-6 text-[var(--bio-blue)] flex justify-between items-center">
                            SQUAD RANK
                            <span className="text-xs text-white bg-[var(--bio-blue)]/20 px-2 py-1 rounded">WEEK 42</span>
                        </h3>

                        <ul className="space-y-4">
                            {MOCK_LEADERBOARD.map((entry) => (
                                <li key={entry.rank} className={`flex justify-between items-center p-2 rounded ${entry.rank === 4 ? 'bg-[var(--bio-blue)]/10 border border-[var(--bio-blue)]/30' : 'border-b border-white/5'}`}>
                                    <div className="flex gap-4">
                                        <span className="text-gray-500 w-4 font-bold">#{entry.rank}</span>
                                        <span className={entry.rank === 4 ? 'text-white font-bold' : 'text-gray-300'}>{entry.user}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[var(--bio-blue)] font-bold">{entry.score}</div>
                                        <div className="text-[10px] text-gray-600 tracking-widest">{entry.status}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-4 border border-dashed border-white/10 rounded text-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">More Squad Stats Coming Soon</p>
                    </div>
                </section>
            </main>

            {/* Squad Creation Modal */}
            <AnimatePresence>
                {showSquadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSquadModal(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-[#050505] border border-[var(--bio-blue)] p-8 max-w-md w-full font-mono"
                        >
                            <h2 className="text-2xl font-bold text-[var(--bio-blue)] mb-6 tracking-tighter uppercase">INITIALIZE_SQUAD_</h2>
                            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                Welcome to VOUCH. Before we begin the synchronization, define your role within the network.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowSquadModal(false)}
                                    className="w-full border border-[var(--bio-blue)] py-4 hover:bg-[var(--bio-blue)] hover:text-black transition-all group text-left px-6"
                                >
                                    <div className="text-xs text-[var(--bio-blue)] group-hover:text-black">ROLE_01</div>
                                    <div className="font-bold uppercase tracking-widest">Squad Leader</div>
                                </button>

                                <button
                                    onClick={() => setShowSquadModal(false)}
                                    className="w-full border border-white/10 py-4 hover:border-white transition-all group text-left px-6"
                                >
                                    <div className="text-xs text-gray-500">ROLE_02</div>
                                    <div className="font-bold uppercase tracking-widest">Drafted / Invite Only</div>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowSquadModal(false)}
                                className="mt-8 text-[10px] text-gray-500 hover:text-white uppercase tracking-[0.3em] w-full text-center"
                            >
                                [ Skip Initialization ]
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
