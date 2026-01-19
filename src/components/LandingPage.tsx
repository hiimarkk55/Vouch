"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import SquadStatus from "./SquadStatus";

export default function LandingPage() {
    const { login, authenticated, user } = usePrivy();
    const [typedText, setTypedText] = useState("");
    const fullText = "> INITIALIZING VOUCH PROTOCOL...\n> SYNCING BIOMETRIC STREAKS...\n> SQUAD STATUS: ACTIVE.";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTypedText(fullText.slice(0, i + 1));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-mono p-8 max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-16 border-b border-white/20 pb-4">
                <h1 className="text-xl tracking-tighter">VOUCH // SYSTEM</h1>
                <div className="flex gap-4 items-center">
                    <span className="w-2 h-2 bg-[var(--bio-blue)] rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-400">STATUS: ONLINE</span>
                </div>
            </header>

            <main className="flex-grow space-y-12">
                {/* Terminal Intro */}
                <section className="bg-black/40 border border-white/10 p-6 rounded-lg backdrop-blur-sm">
                    <pre className="text-[var(--bio-blue)] whitespace-pre-wrap min-h-[5rem]">
                        {typedText}
                        <span className="animate-pulse">_</span>
                    </pre>
                </section>

                {/* Squad Status Preview */}
                <SquadStatus />

                {/* Hero Content */}
                <section className="space-y-6">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                        PROOF OF <span className="text-[var(--bio-blue)]">SWEAT</span>.
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        The accountability engine for high-agency squads. Friends poke. Chapters cheer. Trainers enforce. Sweat is the only currency.
                    </p>

                    <button
                        onClick={login}
                        className="mt-8 px-8 py-4 bg-[var(--bio-blue)] text-black font-bold text-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-[var(--bio-blue)] uppercase tracking-wider skew-x-[-10deg]"
                    >
                        <span className="skew-x-[10deg] inline-block">
                            {authenticated ? "ENTER DASHBOARD" : "INITIALIZE SQUAD_"}
                        </span>
                    </button>
                </section>

                {/* Manifesto Teaser */}
                <section className="border-l-2 border-[var(--bio-blue)] pl-6 space-y-4">
                    <h3 className="text-xl uppercase tracking-widest text-gray-500">Manifesto v1.0</h3>
                    <div className="prose prose-invert max-w-none text-gray-300">
                        <p>
                            We believe health is not a service to be purchased, but a sovereign right to be cultivated.
                            Through data ownership, collective bargaining, and cutting-edge science, we build the future of human longevity.
                        </p>
                    </div>
                    <a href="#manifesto" className="text-[var(--bio-blue)] hover:underline text-sm uppercase">Read Full Protocol &darr;</a>
                </section>
            </main>

            <footer className="mt-20 border-t border-white/10 pt-8 text-center text-xs text-gray-600 uppercase">
                <p>VOUCH © 2026 // All Systems Go</p>
            </footer>
        </div>
    );
}
