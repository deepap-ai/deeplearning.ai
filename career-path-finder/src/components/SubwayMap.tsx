import { motion } from 'framer-motion';
import { Target, Flag, CheckCircle2 } from 'lucide-react';

interface RouteStep {
    type: string;
    title: string;
    duration?: string;
    cost?: string;
    skills_gained?: Record<string, number>;
}

interface CareerRoute {
    id: string;
    label: string;
    steps: RouteStep[];
}

interface SubwayMapProps {
    routes: CareerRoute[];
    activeRouteId?: string;
    onRouteSelect?: (id: string) => void;
    startLabel?: string;
    endLabel?: string;
}

const LINE_COLORS = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-pink-500'
];
const BORDER_COLORS = [
    'border-blue-500', 'border-emerald-500', 'border-violet-500', 'border-amber-500', 'border-pink-500'
];
const SKILL_BADGE_COLORS = [
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'bg-violet-50 text-violet-700 border-violet-200',
    'bg-amber-50 text-amber-700 border-amber-200',
    'bg-pink-50 text-pink-700 border-pink-200',
];
const SKILL_MORE_COLORS = [
    'text-blue-400', 'text-emerald-400', 'text-violet-400', 'text-amber-400', 'text-pink-400'
];

export default function SubwayMap({
    routes,
    activeRouteId,
    onRouteSelect,
    startLabel = "Current State",
    endLabel = "Target Goal"
}: SubwayMapProps) {

    if (!routes || routes.length === 0) return null;



    return (
        <div className="w-full bg-white rounded-xl border border-slate-200 p-6 overflow-hidden relative shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent-red" />
                    Career Trajectory Map
                </h3>
            </div>

            <div className="relative pt-8 pb-16 overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px] flex items-stretch px-4 relative">

                    {/* Start Node Container */}
                    <div className="w-32 shrink-0 flex flex-col items-center justify-center relative z-20">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border-4 border-white flex items-center justify-center shadow-md relative z-20">
                            <Flag className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 absolute top-[calc(50%+20px)] whitespace-nowrap">{startLabel}</span>
                        {/* Right branching horizontal line */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-slate-200 z-0"></div>
                    </div>

                    {/* Routes Container */}
                    <div className="flex-1 flex flex-col gap-48 py-16 relative z-10 pl-8 pr-8">
                        {/* Vertical Connector Hubs behind the tracks */}
                        <div className="absolute left-8 top-[3rem] bottom-[3rem] w-1 bg-slate-200 z-0"></div>
                        <div className="absolute right-8 top-[3rem] bottom-[3rem] w-1 bg-slate-200 z-0"></div>

                        {routes.map((route, rIdx) => {
                            const lineColor = LINE_COLORS[rIdx % LINE_COLORS.length];
                            const borderColor = BORDER_COLORS[rIdx % BORDER_COLORS.length];
                            const skillBadgeColor = SKILL_BADGE_COLORS[rIdx % SKILL_BADGE_COLORS.length];
                            const skillMoreColor = SKILL_MORE_COLORS[rIdx % SKILL_MORE_COLORS.length];
                            const isActive = route.id === activeRouteId;

                            return (
                                <div
                                    key={route.id}
                                    className={`relative flex items-center justify-between cursor-pointer transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                    onClick={() => onRouteSelect?.(route.id)}
                                >
                                    {/* Route Track */}
                                    <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 ${lineColor} rounded-full z-0`}></div>

                                    {/* Connect to Vertical Hubs */}
                                    <div className={`absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-1.5 ${lineColor} z-0`}></div>
                                    <div className={`absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-1.5 ${lineColor} z-0`}></div>

                                    {/* Route Label (Left) */}
                                    <div className="absolute -top-6 left-0 text-[10px] font-bold font-mono tracking-widest uppercase text-slate-500">
                                        {route.label}
                                    </div>

                                    {/* Intermediate Stops with Edge Skill Labels */}
                                    {route.steps.map((step, idx) => (
                                        <div key={idx} className="relative z-10 flex flex-col items-center group">
                                            {/* Tooltip on Hover */}
                                            <div className="absolute bottom-full mb-2 flex-col items-center hidden group-hover:flex z-50 pointer-events-none w-max max-w-[240px]">
                                                <div className="bg-slate-900 text-white p-2.5 flex flex-col items-center justify-center rounded-lg shadow-xl text-center border border-slate-700">
                                                    {step.duration && <div className="text-[10px] font-mono text-slate-300">{step.duration}</div>}
                                                    {step.cost && <div className="text-[10px] font-mono font-bold text-emerald-400 mt-0.5">{step.cost}</div>}
                                                    {step.skills_gained && Object.keys(step.skills_gained).length > 0 && (
                                                        <div className="mt-1.5 pt-1.5 border-t border-slate-700 flex flex-wrap justify-center gap-1 w-full">
                                                            {Object.keys(step.skills_gained).map((skill, sIdx) => (
                                                                <span key={sIdx} className="text-[8px] px-1 py-0.5 rounded-sm bg-slate-800 text-slate-300 whitespace-nowrap">
                                                                    +{skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-2 h-2 bg-slate-900 border-b border-r border-slate-700 rotate-45 -mt-1 -mb-1"></div>
                                            </div>

                                            {/* Node Station */}
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 + (idx * 0.1) }}
                                                className={`w-4 h-4 rounded-full bg-white border-4 ${borderColor} shadow-sm ${isActive ? 'scale-110' : ''}`}
                                            />

                                            {/* Label + Skills below the stop */}
                                            <div className="absolute top-6 flex flex-col items-center w-40 text-center p-1 rounded z-20">
                                                <span className="text-[10px] font-bold text-slate-800 leading-tight">{step.title}</span>
                                                <span className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase">{step.type}</span>

                                                {/* Skills gained — shown as compact list below the role name */}
                                                {isActive && step.skills_gained && Object.keys(step.skills_gained).length > 0 && (
                                                    <div className="flex flex-wrap justify-center gap-0.5 mt-1.5">
                                                        {Object.keys(step.skills_gained).slice(0, 3).map((skill, sIdx) => (
                                                            <motion.span
                                                                key={sIdx}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.4 + (idx * 0.1) + (sIdx * 0.05) }}
                                                                className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full border ${skillBadgeColor}`}
                                                            >
                                                                +{skill}
                                                            </motion.span>
                                                        ))}
                                                        {Object.keys(step.skills_gained).length > 3 && (
                                                            <span className={`text-[8px] font-mono ${skillMoreColor} py-0.5`}>
                                                                +{Object.keys(step.skills_gained).length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>

                    {/* End Node Container */}
                    <div className="w-32 shrink-0 flex flex-col items-center justify-center relative z-20">
                        {/* Left branching horizontal line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-slate-200 z-0"></div>
                        <div className="w-10 h-10 rounded-full bg-accent-red border-4 border-white flex items-center justify-center shadow-md animate-pulse relative z-20">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 absolute top-[calc(50%+25px)] whitespace-nowrap">{endLabel}</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
