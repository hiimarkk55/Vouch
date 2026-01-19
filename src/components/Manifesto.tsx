export default function Manifesto() {
    return (
        <section id="manifesto" className="bg-[#0a0a0a] border-t border-[var(--bio-blue)]/30 py-20 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                <h2 className="text-3xl font-bold font-mono text-[var(--bio-blue)] mb-12 border-b border-gray-800 pb-4">
          // THE MANIFESTO
                </h2>

                <div className="prose prose-invert prose-lg font-mono text-gray-300 space-y-6">
                    <p>
                        <strong className="text-white">1. REPUTATION IS STAKE.</strong><br />
                        Your streak is your word. Ghosting is not an option.
                    </p>

                    <p>
                        <strong className="text-white">2. COMMUNITY IS THE CURE.</strong><br />
                        Loneliness is inflammatory; the Squad is the medicine.
                    </p>

                    <p>
                        <strong className="text-white">3. TRAINER AS DM.</strong><br />
                        Our marketplace connects squads to professional 'Dungeon Masters' who enforce the mission.
                    </p>

                    <p>
                        <strong className="text-white">4. DATA IS SOVEREIGN.</strong><br />
                        Use ZK-Proofs to monetize your progress without selling your soul.
                    </p>
                </div>

                <div className="mt-12 p-4 border border-[var(--bio-blue)]/50 bg-[var(--bio-blue)]/5 rounded text-center">
                    <p className="text-sm uppercase tracking-widest text-[var(--bio-blue)]">End of Document // Initiate Protocol</p>
                </div>
            </div>
        </section>
    );
}
