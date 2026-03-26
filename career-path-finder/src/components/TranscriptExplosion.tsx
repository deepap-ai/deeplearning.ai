import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Scan } from 'lucide-react';

interface Course {
    code: string;
    title: string;
    skills: string[];
}

interface TranscriptExplosionProps {
    courses: Course[];
    onComplete: () => void;
}

// Cluster positions for different skill domains
const DOMAIN_POSITIONS: Record<string, { x: number; y: number; color: string }> = {
    bio: { x: -160, y: -80, color: '#2563eb' },
    quant: { x: 140, y: -100, color: '#059669' },
    regulatory: { x: -120, y: 100, color: '#7e22ce' },
    missing: { x: 160, y: 90, color: '#ef4444' },
};

function getSkillDomain(skill: string): string {
    const s = skill.toLowerCase();
    if (['molecular biology', 'organic chemistry', 'lab techniques', 'pharmacology', 'clinical rotation hours'].some(k => s.includes(k.toLowerCase()))) return 'bio';
    if (['biostatistics', 'data reporting', 'quality assurance'].some(k => s.includes(k.toLowerCase()))) return 'quant';
    if (['regulatory', 'documentation', 'compliance', 'pharmd'].some(k => s.includes(k.toLowerCase()))) return 'regulatory';
    return 'bio';
}

export default function TranscriptExplosion({ courses, onComplete }: TranscriptExplosionProps) {
    const [phase, setPhase] = useState<'upload' | 'scan' | 'explode' | 'done'>('upload');
    const [scanIndex, setScanIndex] = useState(0);

    useEffect(() => {
        // Phase 1: Upload icon (1s)
        const t1 = setTimeout(() => setPhase('scan'), 1000);

        // Phase 2: Scan courses (2.5s)
        const t2 = setTimeout(() => setPhase('explode'), 3500);

        // Phase 3: Explode + settle (3s)
        const t3 = setTimeout(() => {
            setPhase('done');
            onComplete();
        }, 6500);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    // Scan animation ticks
    useEffect(() => {
        if (phase !== 'scan') return;
        const interval = setInterval(() => {
            setScanIndex(prev => Math.min(prev + 1, courses.length - 1));
        }, 180);
        return () => clearInterval(interval);
    }, [phase, courses.length]);

    // Collect unique skills from courses
    const allSkills = Array.from(new Set(courses.flatMap(c => c.skills)));

    return (
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
                {/* Phase 1: Upload Icon */}
                {phase === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-red-50 border border-accent-red/20 flex items-center justify-center animate-pulse">
                            <FileText className="w-10 h-10 text-accent-red" />
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Loading Transcript...</p>
                    </motion.div>
                )}

                {/* Phase 2: Scanning courses */}
                {phase === 'scan' && (
                    <motion.div
                        key="scan"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-3 w-full max-w-sm"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Scan className="w-4 h-4 text-accent-red animate-pulse" />
                            <span className="text-xs font-mono font-bold text-accent-red uppercase tracking-widest">Parsing Transcript</span>
                        </div>
                        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-[300px] overflow-hidden relative">
                            {/* Scan line */}
                            <motion.div
                                className="absolute left-0 right-0 h-0.5 bg-accent-red/60 z-10"
                                animate={{ top: `${(scanIndex / Math.max(courses.length - 1, 1)) * 100}%` }}
                                transition={{ duration: 0.15 }}
                            />
                            <div className="flex flex-col gap-1.5">
                                {courses.map((course, i) => (
                                    <div
                                        key={course.code}
                                        className={`flex items-center gap-3 py-1 px-2 rounded text-xs transition-all duration-200 ${
                                            i === scanIndex ? 'bg-red-50 text-accent-red font-bold' :
                                            i < scanIndex ? 'text-accent-green' : 'text-slate-400'
                                        }`}
                                    >
                                        <span className="font-mono font-bold w-16 shrink-0">{course.code}</span>
                                        <span className="truncate">{course.title}</span>
                                        {i < scanIndex && <span className="ml-auto text-[9px] text-accent-green font-mono">✓</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                            {scanIndex + 1}/{courses.length} courses parsed
                        </p>
                    </motion.div>
                )}

                {/* Phase 3: Explode into skill nodes */}
                {phase === 'explode' && (
                    <motion.div
                        key="explode"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative w-full h-full"
                    >
                        {/* Center label */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center"
                        >
                            <p className="text-[12px] font-bold text-slate-800 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-center max-w-[200px]">
                                We decompose coursework into verifiable skill atoms.
                            </p>
                        </motion.div>

                        {/* Skill nodes flying out */}
                        {allSkills.map((skill, i) => {
                            const domain = getSkillDomain(skill);
                            const pos = DOMAIN_POSITIONS[domain] || DOMAIN_POSITIONS.bio;
                            const angle = (i / allSkills.length) * Math.PI * 2;
                            const jitter = 30;
                            const offsetX = pos.x + Math.cos(angle) * jitter;
                            const offsetY = pos.y + Math.sin(angle) * jitter;

                            return (
                                <motion.div
                                    key={skill}
                                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                                    animate={{
                                        x: offsetX,
                                        y: offsetY,
                                        scale: 1,
                                        opacity: 1,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 100,
                                        damping: 12,
                                        delay: 0.1 + i * 0.08,
                                    }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                                        style={{
                                            borderColor: pos.color,
                                            backgroundColor: `${pos.color}15`,
                                        }}
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pos.color }}></div>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-700 whitespace-nowrap bg-white/90 px-1 rounded">
                                        {skill}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
