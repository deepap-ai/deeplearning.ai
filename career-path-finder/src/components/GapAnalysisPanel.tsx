import React from 'react';
import gapData from '../data/gap_analysis.json';
import { Target, Code2, BookOpen, GitMerge, ArrowRight } from 'lucide-react';

export default function GapAnalysisPanel() {
    const { deltas, upskilling_tasks } = gapData;
    const gaps = Object.entries(deltas).sort((a, b) => (b[1] as number) - (a[1] as number));

    const getIcon = (action: string) => {
        if (action.includes('GitHub')) return <GitMerge className="w-4 h-4 text-accent-red" />;
        if (action.includes('Prompt')) return <Code2 className="w-4 h-4 text-accent-blue" />;
        return <BookOpen className="w-4 h-4 text-accent-green" />;
    };

    return (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {gaps.map(([skill, delta], idx) => {
                const task = (upskilling_tasks as any)[skill];
                const gapPct = (delta as number) * 100;

                return (
                    <div key={skill} className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover-red-outline transition-all group">

                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                                <div className="bg-white p-1 rounded-md border border-slate-200 group-hover:border-accent-red transition-colors shadow-sm">{getIcon(task.action)}</div>
                                {skill}
                            </h4>
                            <div className="bg-red-50 text-accent-red px-2 py-0.5 border border-accent-red/20 rounded text-[10px] font-mono font-bold tracking-widest uppercase">
                                {gapPct.toFixed(0)}% Gap
                            </div>
                        </div>

                        <div className="pl-9">
                            <p className="text-xs text-slate-600 mb-2 font-medium leading-relaxed">{task.action}</p>
                            {task.repo && (
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-mono bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">{task.repo}</span>
                                    <ArrowRight className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] font-mono text-accent-red font-bold tracking-wide">{task.issue}</span>
                                </div>
                            )}

                            <button className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-accent-red flex items-center gap-1 transition-colors mt-2">
                                Initiate Upskill Action <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                    </div>
                );
            })}
        </div>
    );
}
