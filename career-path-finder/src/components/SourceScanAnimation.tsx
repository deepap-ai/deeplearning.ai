import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitMerge, Code2, CheckCircle2 } from 'lucide-react';

interface SourceScanProps {
    sources: Array<{ name: string; details: string }>;
    skills: string[];
    onComplete: () => void;
}

export default function SourceScanAnimation({ sources, skills, onComplete }: SourceScanProps) {
    const [phase, setPhase] = useState<'scanning' | 'extracting' | 'done'>('scanning');
    const [sourceIndex, setSourceIndex] = useState(0);
    const [percentages, setPercentages] = useState<number[]>(sources.map(() => 0));

    const icons = [GitMerge, Code2];

    // Progress animation for each source
    useEffect(() => {
        if (phase !== 'scanning') return;

        const interval = setInterval(() => {
            setPercentages(prev => {
                const next = [...prev];
                if (next[sourceIndex] < 100) {
                    next[sourceIndex] = Math.min(100, next[sourceIndex] + 3 + Math.random() * 4);
                } else if (sourceIndex < sources.length - 1) {
                    setSourceIndex(si => si + 1);
                }
                return next;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [phase, sourceIndex, sources.length]);

    // Detect when all sources are done
    useEffect(() => {
        if (percentages.every(p => p >= 100) && phase === 'scanning') {
            setTimeout(() => setPhase('extracting'), 500);
        }
    }, [percentages, phase]);

    // Extracting phase completes after skills animate in
    useEffect(() => {
        if (phase === 'extracting') {
            const delay = 800 + skills.length * 100;
            const t = setTimeout(() => {
                setPhase('done');
                onComplete();
            }, delay);
            return () => clearTimeout(t);
        }
    }, [phase, skills.length, onComplete]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
                {phase === 'scanning' && (
                    <motion.div
                        key="scan"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-sm flex flex-col gap-5"
                    >
                        <p className="text-xs font-mono font-bold text-accent-red uppercase tracking-widest text-center animate-pulse">
                            Scanning Data Sources
                        </p>
                        {sources.map((source, i) => {
                            const Icon = icons[i % icons.length];
                            const pct = Math.round(percentages[i]);
                            return (
                                <div key={source.name} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                            <Icon className="w-4 h-4 text-slate-400" /> {source.name}
                                            {pct >= 100 ? (
                                                <span className="text-[9px] bg-green-50 border border-accent-green/20 text-accent-green px-1.5 py-0.5 rounded ml-1">Complete</span>
                                            ) : i === sourceIndex ? (
                                                <span className="text-[9px] bg-red-50 border border-accent-red/20 text-accent-red px-1.5 py-0.5 rounded ml-1 animate-pulse">Scanning</span>
                                            ) : (
                                                <span className="text-[9px] bg-slate-100 border border-slate-300 text-slate-400 px-1.5 py-0.5 rounded ml-1">Queued</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-mono text-slate-500 font-medium">{pct}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-100 ease-out ${pct >= 100 ? 'bg-accent-green' : 'bg-accent-red'}`}
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 font-mono">{source.details}</p>
                                </div>
                            );
                        })}
                    </motion.div>
                )}

                {phase === 'extracting' && (
                    <motion.div
                        key="extract"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <p className="text-xs font-mono font-bold text-accent-green uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Extracting Skill Nodes
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-md">
                            {skills.map((skill, i) => (
                                <motion.span
                                    key={skill}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                                    className="px-2.5 py-1 rounded-full border border-accent-blue/30 bg-accent-blue/5 text-accent-blue text-[10px] font-bold"
                                >
                                    {skill}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
