import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProximityMapProps {
    currentSkills: Record<string, number>;
    targetRoleLabel: string;
    targetSkills: Record<string, number>;
}

export default function ProximityMap({ currentSkills, targetSkills, targetRoleLabel }: ProximityMapProps) {
    const [phase, setPhase] = useState<'init' | 'clustering' | 'bridging' | 'settled'>('init');

    // Extract skills from records into arrays for mapping
    const cSkills = Object.keys(currentSkills).slice(0, 8); // Limit for visual clarity
    const tSkills = Object.keys(targetSkills).slice(0, 8);

    useEffect(() => {
        // Animation sequence designed for the "Wow!" pitch demo effect
        const t1 = setTimeout(() => setPhase('clustering'), 800);
        const t2 = setTimeout(() => setPhase('bridging'), 2500);
        const t3 = setTimeout(() => setPhase('settled'), 4000);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    // Generate pseudo-random positions for the clusters
    const getPos = (i: number, total: number, radius: number, isLeft: boolean) => {
        const offset = isLeft ? -120 : 120; // X offset for Current (Left) vs Target (Right)
        
        // Arrange in a circle with noise
        const angle = (i / total) * Math.PI * 2;
        // Jitter for force-graph look
        const jitterX = Math.random() * 20 - 10;
        const jitterY = Math.random() * 20 - 10;

        return {
            x: offset + Math.cos(angle) * radius + jitterX,
            y: Math.sin(angle) * radius + jitterY,
        };
    };

    return (
        <div className="w-full h-full min-h-[400px] bg-slate-50 relative flex items-center justify-center overflow-hidden border border-slate-200 rounded-xl">
            
            {/* Background Narrative */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 w-full flex justify-center">
                <AnimatePresence mode="wait">
                    {phase === 'bridging' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-slate-200 z-50 transition-all"
                        >
                            <p className="text-sm font-bold text-slate-900 tracking-tight">
                                This is the gap, rendered as physics.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sub-labels */}
            <div className="absolute bottom-6 left-12 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-widest hidden md:block">
                VERIFIED SKILLS CLUSTER
            </div>
            <div className="absolute bottom-6 right-12 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-widest text-right hidden md:block">
                {targetRoleLabel} <br/> REQUIREMENTS CLUSTER
            </div>

            {/* Physics Connectors Layer */}
            <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center pointer-events-none">
                <svg className="w-full h-full absolute inset-0 overflow-visible" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <g transform="translate(50%, 50%) scale(1)">
                    {phase !== 'init' && phase !== 'clustering' && cSkills.map((cSkill, i) => {
                        const tIndex = tSkills.findIndex(ts => ts.toLowerCase() === cSkill.toLowerCase());
                        
                        // Pick a destination (either actual match, or random non-match for visual effect)
                        let matchIndex = tIndex;
                        if (tIndex === -1 && i < 3) matchIndex = i % tSkills.length; // Create false bridge visually

                        if (matchIndex === -1) return null;
                        
                        const fromPos = getPos(i, cSkills.length, 60, true);
                        const toPos = getPos(matchIndex, tSkills.length, 60, false);
                        
                        const isMatch = tIndex !== -1;
                        
                        return (
                            <motion.line
                                key={`bridge-${i}`}
                                initial={{ pathLength: 0, strokeOpacity: 0 }}
                                animate={{ pathLength: 1, strokeOpacity: isMatch ? 0.3 : 0.6 }}
                                transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
                                x1={fromPos.x} 
                                y1={fromPos.y}
                                x2={toPos.x}
                                y2={toPos.y}
                                stroke={isMatch ? "#059669" : "#ef4444"} // Green if matched, Red if gap
                                strokeWidth={isMatch ? "2" : "1.5"}
                                strokeDasharray={isMatch ? "0" : "4 4"} // Dashed for gaps
                            />
                        );
                    })}
                    </g>
                </svg>
            </div>

            {/* The Nodes Layer */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 pointer-events-none">
                
                {/* Current Skills Cluster (Left) */}
                {cSkills.map((skill, i) => {
                    const pos = getPos(i, cSkills.length, 60, true); // final positions
                    const isSettled = phase === 'settled';

                    return (
                        <motion.div
                            key={`c-${skill}`}
                            initial={{ x: -250, y: Math.random() * 200 - 100, opacity: 0 }}
                            animate={{
                                x: phase === 'init' ? -250 : pos.x - 50,
                                y: phase === 'init' ? Math.random() * 200 - 100 : pos.y,
                                opacity: 1,
                                scale: isSettled ? 1.05 : 1
                            }}
                            transition={{ type: 'spring', stiffness: 50, damping: 10, delay: i * 0.05 }}
                            className="absolute bg-white border border-accent-blue/40 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 pointer-events-auto"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                            <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{skill}</span>
                        </motion.div>
                    );
                })}

                {/* Target Skills Cluster (Right) */}
                {tSkills.map((skill, i) => {
                    const pos = getPos(i, tSkills.length, 60, false);
                    const isSettled = phase === 'settled';
                    
                    // Check if candidate has it
                    const hasSkill = cSkills.some(cs => cs.toLowerCase() === skill.toLowerCase());

                    return (
                        <motion.div
                            key={`t-${skill}`}
                            initial={{ x: 250, y: Math.random() * 200 - 100, opacity: 0 }}
                            animate={{
                                x: phase === 'init' ? 250 : pos.x + 50,
                                y: phase === 'init' ? Math.random() * 200 - 100 : pos.y,
                                opacity: 1,
                                scale: isSettled ? 1.05 : 1
                            }}
                            transition={{ type: 'spring', stiffness: 50, damping: 10, delay: i * 0.05 + 0.3 }}
                            className={`absolute bg-white border px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 pointer-events-auto ${hasSkill ? 'border-accent-green/40' : 'border-accent-red/60 bg-red-50/20'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${hasSkill ? 'bg-accent-green' : 'bg-accent-red animate-pulse'}`} />
                            <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{skill}</span>
                        </motion.div>
                    );
                })}
            </div>

        </div>
    );
}
