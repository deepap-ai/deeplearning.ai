import { useEffect } from 'react';
import { motion } from 'framer-motion';
import SkillRadarChart from './SkillRadarChart';
import { X, Calendar, UserPlus, Users } from 'lucide-react';

export interface CandidateProfile {
    name: string;
    role: string;
    match: number;
    outline: string;
    skillVector: Record<string, number>;
    email: string;
    github: string;
}

interface CandidateModalProps {
    candidate: CandidateProfile;
    jdVector: Record<string, number>;
    onClose: () => void;
}

export default function CandidateModal({ candidate, jdVector, onClose }: CandidateModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const skills = Object.keys(jdVector);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-accent-red transition-colors rounded-lg hover:bg-red-50 z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <Users className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{candidate.name}</h2>
                            <p className="text-xs text-slate-500 font-medium">{candidate.role}</p>
                        </div>
                        <div className="bg-green-50 text-accent-green border border-accent-green/20 px-2.5 py-1 rounded-lg text-sm font-mono font-bold">
                            {candidate.match}%
                        </div>
                    </div>

                    {/* Radar Chart */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 h-64 mb-6">
                        <SkillRadarChart candidateVector={candidate.skillVector} jdVector={jdVector} />
                    </div>

                    {/* Skill Breakdown */}
                    <div className="mb-6">
                        <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">Skill Breakdown</h3>
                        <div className="flex flex-col gap-2.5">
                            {skills.map(skill => {
                                const candidateVal = candidate.skillVector[skill] ?? 0;
                                const requiredVal = jdVector[skill] ?? 0;
                                const delta = requiredVal - candidateVal;
                                const status = delta <= 0 ? 'exceeds' : delta <= 0.15 ? 'ok' : 'gap';

                                return (
                                    <div key={skill} className="flex items-center gap-3">
                                        <span className="text-[11px] font-medium text-slate-700 w-32 truncate shrink-0">{skill}</span>
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-accent-blue/20 rounded-full"
                                                style={{ width: `${requiredVal * 100}%` }}
                                            />
                                            <div
                                                className={`absolute top-0 left-0 h-full rounded-full ${status === 'exceeds' ? 'bg-accent-green' : status === 'ok' ? 'bg-accent-blue' : 'bg-amber-400'}`}
                                                style={{ width: `${candidateVal * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono font-bold w-10 text-right text-slate-700">
                                            {(candidateVal * 100).toFixed(0)}%
                                        </span>
                                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                                            status === 'exceeds' ? 'bg-green-50 text-accent-green border border-accent-green/20'
                                            : status === 'ok' ? 'bg-blue-50 text-accent-blue border border-accent-blue/20'
                                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                                        }`}>
                                            {status === 'exceeds' ? 'Exceeds' : status === 'ok' ? 'OK' : 'Gap'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact info */}
                    <div className="flex items-center gap-4 mb-6 text-[10px] font-mono text-slate-500">
                        <span>{candidate.email}</span>
                        <span>github.com/{candidate.github}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button className="flex-1 py-2.5 rounded-lg bg-accent-red text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-sm">
                            <Calendar className="w-4 h-4" /> Schedule Interview
                        </button>
                        <button className="flex-1 py-2.5 rounded-lg bg-white border border-slate-200 hover-red-outline text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
                            <UserPlus className="w-4 h-4" /> Add to Shortlist
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
