import { motion } from 'framer-motion';
import { Clock, DollarSign, Briefcase, TrendingUp } from 'lucide-react';

interface RouteTimelineProps {
    route: any; // Using the activeRoute object from SubwayMap/NavigateDashboard
}

export default function RouteTimeline({ route }: RouteTimelineProps) {
    if (!route || !route.steps) return null;

    const totalSteps = route.steps.length;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header / Summary Metrics */}
            <div className="bg-slate-50 border-b border-slate-100 p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">{route.label || 'Selected Route'}</h3>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                            {route.subtitle || 'Trajectory Details'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5 whitespace-nowrap"><Clock className="w-3 h-3 text-accent-blue" /> Duration</span>
                        <span className="text-lg font-bold text-slate-800">{route.total_time || '18 mos'}</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5 whitespace-nowrap"><DollarSign className="w-3 h-3 text-red-500" /> Investment</span>
                        <span className="text-lg font-bold text-slate-800">{route.total_cost || '$4,500'}</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5 whitespace-nowrap"><TrendingUp className="w-3 h-3 text-accent-green" /> Salary Path</span>
                        <span className="text-lg font-bold text-accent-green">{route.steps?.[totalSteps - 1]?.salary || '+$45k / yr'}</span>
                    </div>
                </div>
            </div>

            {/* Vertical Timeline */}
            <div className="p-5 flex-1 overflow-y-auto relative">
                {/* Timeline background line */}
                <div className="absolute left-[35px] top-8 bottom-8 w-0.5 bg-slate-100" />

                <div className="flex flex-col gap-6">
                    {route.steps.map((step: any, i: number) => {
                        const isFirst = i === 0;
                        const isLast = i === totalSteps - 1;

                        return (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="relative flex items-start gap-4 z-10"
                            >
                                {/* Timeline Dot */}
                                <div className="flex flex-col items-center mt-1 shrink-0">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white shadow-sm ${isLast ? 'border-accent-green text-accent-green' : isFirst ? 'border-slate-300 text-slate-400' : 'border-accent-blue text-accent-blue'}`}>
                                        {isLast ? <TrendingUp className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 p-4 rounded-xl border ${isLast ? 'border-accent-green/30 bg-green-50/10 hover-red-outline' : 'border-slate-200 bg-white hover-red-outline'} transition-all group`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-bold text-slate-800">{step.title}</h4>
                                        {step.duration && (
                                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                {step.duration}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 mb-3">{step.desc || step.description}</p>
                                    
                                    {isLast && (
                                        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-100">
                                            <span className="text-[10px] font-bold text-accent-green uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> Target Achieved</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
