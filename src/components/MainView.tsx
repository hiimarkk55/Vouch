"use client";

import { usePrivy } from "@privy-io/react-auth";
import LandingPage from "./LandingPage";
import Dashboard from "../squads/Dashboard";
import Manifesto from "./Manifesto";

export default function MainView() {
    const { ready, authenticated } = usePrivy();

    if (!ready) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono">
                <div className="text-[var(--bio-blue)] animate-pulse">Initializing Neural Link...</div>
            </div>
        );
    }

    if (authenticated) {
        return <Dashboard />;
    }

    return (
        <>
            <LandingPage />
            <Manifesto />
        </>
    );
}
