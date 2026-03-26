import { motion } from 'framer-motion';
import { AlertTriangle, Github, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

interface GapItem {
    skill: string;
    priority: 'Critical' | 'Medium' | 'Low';
    actionType: 'GitHub' | 'Course' | 'Micro-credential';
    actionText: string;
    actionLink?: string;
}

const MOCK_GAPS: GapItem[] = [
    {
        skill: 'Distributed Systems',
        priority: 'Critical',
        actionType: 'GitHub',
        actionText: 'Solve Issue #412 in apache/kafka to verify capability.',
        actionLink: 'https://github.com/apache/kafka/issues/412'
    },
    {
        skill: 'CUDA Programming',
        priority: 'Medium',
        actionType: 'Micro-credential',
        actionText: 'Earn NVIDIA Deep Learning Institute Certification.',
    },
    {
        skill: 'Advanced React Patterns',
        priority: 'Low',
        actionType: 'Course',
        actionText: 'Complete CS189 Module 4: State Machines.',
    }
];

export default function GapAnalysisPanel({ gaps = MOCK_GAPS }: { gaps?: GapItem[] }) {
    
    const getPriorityColor = (p: string) => {
        if (p === 'Critical') return 'text-red-600 bg-red-50 border-red-200';
        if (p === 'Medium') return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-slate-600 bg-slate-100 border-slate-200';
    };

    const getActionIcon = (type: string) => {
        if (type === 'GitHub') return <Github className="w-4 h-4" />;
        if (type === 'Course') return <GraduationCap className="w-4 h-4" />;
        return <ShieldCheck className="w-4 h-4" />;
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent-red" /> Deep Gap Analysis
                </h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Actionable steps to reach target requirements
                </p>
            </div>
            
            <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
                {gaps.map((gap, i) => (
                    <motion.div 
                        key={gap.skill}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col gap-3 hover:border-slate-300 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-slate-800">{gap.skill}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getPriorityColor(gap.priority)}`}>
                                {gap.priority}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg group hover:bg-red-50 hover:border-red-100 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 group-hover:text-accent-red">
                                {getActionIcon(gap.actionType)}
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                                    {gap.actionType} Action Item
                                </span>
                                <p className="text-xs font-medium text-slate-700 leading-tight">
                                    {gap.actionText}
                                </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-accent-red transition-colors shrink-0" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
