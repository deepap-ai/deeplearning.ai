import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface RouteStep {
    title: string;
    skills_gained?: Record<string, number>;
}

interface SkillEvolutionProps {
    currentSkills: Record<string, number>;
    targetSkills: Record<string, number>;
    activeRouteSteps: RouteStep[];
}

export default function SkillEvolution({ currentSkills, targetSkills, activeRouteSteps }: SkillEvolutionProps) {
    // If no data, render empty
    if (!currentSkills || !targetSkills || !activeRouteSteps) return null;

    // We want a consolidated list of all skills that matter for this journey
    const allSkillsSet = new Set([
        ...Object.keys(currentSkills),
        ...Object.keys(targetSkills)
    ]);
    const allSkills = Array.from(allSkillsSet).sort();

    return (
        <div className="w-full bg-white rounded-xl border border-slate-200 p-6 overflow-hidden relative shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accent-red" />
                    Skill Delta Bubble Graph
                </h3>
            </div>

            <div className="space-y-3">
                {/* Header Row */}
                <div className="flex text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-[140px] mb-2">
                    <div className="w-16 text-center shrink-0">Current</div>
                    {/* Render Milestones as Columns */}
                    <div className="flex-1 flex justify-between px-4">
                        {activeRouteSteps.map((step, i) => (
                            <div key={i} className="flex-1 text-center px-1 text-slate-500 flex items-center justify-center break-words leading-tight text-[8px]" title={step.title}>
                                {step.title}
                            </div>
                        ))}
                    </div>
                    <div className="w-16 text-center text-accent-red shrink-0">Target</div>
                </div>

                {/* Skill Rows */}
                {allSkills.map(skill => {
                    const currentVal = currentSkills[skill] || 0;
                    const targetVal = targetSkills[skill] || 0;

                    // Does the route provide this skill?
                    let accumulated = currentVal;
                    const milestoneGains = activeRouteSteps.map(step => {
                        const gain = step.skills_gained?.[skill] || 0;
                        accumulated = Math.min(1.0, accumulated + gain);
                        return { gain, totalAfter: accumulated };
                    });

                    // Determine final status
                    const finalVal = milestoneGains.length > 0 ? milestoneGains[milestoneGains.length - 1].totalAfter : currentVal;
                    const isMet = finalVal >= targetVal;

                    return (
                        <div key={skill} className="flex items-center text-sm py-1 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded">
                            {/* Skill Name */}
                            <div className="w-[140px] font-mono text-[10px] text-slate-600 truncate pr-4 pl-2 shrink-0">
                                {skill}
                            </div>

                            {/* Current State */}
                            <div className="w-16 shrink-0 flex justify-center items-center">
                                <div
                                    className={`rounded-full flex items-center justify-center text-[7px] font-bold ${currentVal > 0 ? 'bg-slate-200 text-slate-600' : 'bg-slate-50 border border-slate-100 text-transparent'}`}
                                    style={{ width: `${12 + currentVal * 20}px`, height: `${12 + currentVal * 20}px` }}
                                >
                                    {currentVal > 0 && Math.round(currentVal * 100)}
                                </div>
                            </div>

                            {/* Journey / Milestones */}
                            <div className="flex-1 flex justify-between px-4 relative">
                                {milestoneGains.map((mg, i) => (
                                    <div key={i} className="flex-1 flex justify-center items-center z-10">
                                        {mg.gain > 0 ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="rounded-full bg-accent-green/20 border border-accent-green/50 flex items-center justify-center text-[7px] font-mono text-emerald-700 font-bold"
                                                style={{ width: `${12 + mg.gain * 20}px`, height: `${12 + mg.gain * 20}px` }}
                                                title={`Gained +${Math.round(mg.gain * 100)} from this step`}
                                            >
                                                +{Math.round(mg.gain * 100)}
                                            </motion.div>
                                        ) : (
                                            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Target State */}
                            <div className="w-16 shrink-0 flex justify-center items-center">
                                <div
                                    className={`rounded-full flex items-center justify-center font-mono text-[7px] font-bold ${isMet
                                        ? 'bg-accent-green/20 border-accent-green/50 text-emerald-700 border'
                                        : 'bg-red-50 text-accent-red border border-red-200'
                                        }`}
                                    style={{ width: `${12 + targetVal * 20}px`, height: `${12 + targetVal * 20}px` }}
                                >
                                    {Math.round(targetVal * 100)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Summary */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[9px] font-mono text-slate-400">
                <span>The journey bridges the <span className="text-accent-red font-bold">Skills Gap</span> sequentially. Bubble size = intensity.</span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-200 rounded-full"></span> Current</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-green/30 border border-accent-green/50"></span> Gained</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-50 border border-red-200 rounded-full"></span> Target</span>
                </div>
            </div>
        </div>
    );
}
