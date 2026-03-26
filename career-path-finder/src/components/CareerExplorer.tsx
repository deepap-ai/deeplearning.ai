import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ArrowRight, Database, TrendingUp, TrendingDown,
    Minus, Users, Clock, GraduationCap, Sparkles, ChevronDown, X
} from 'lucide-react';
import SubwayMap from './SubwayMap';
import RouteTimeline from './RouteTimeline';

import { exploreSearchRoles, exploreCareerPaths, exploreTransitions } from '../services/api';

// -------------------------------------------------------------------

interface RoleOption {
    label: string;
    code: string;
    outgoing_edges: number;
    total_transitions: number;
}

function RoleAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder,
    label,
}: {
    value: string;
    onChange: (val: string) => void;
    onSelect: (role: RoleOption) => void;
    placeholder: string;
    label: string;
}) {
    const [options, setOptions] = useState<RoleOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<number | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 2) { setOptions([]); return; }

        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            const data = await exploreSearchRoles(value);
            setOptions(data.results || []);
            setIsOpen(true);
            setLoading(false);
        }, 250);
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="flex-1 relative" ref={containerRef}>
            <label className="text-[9px] font-mono font-bold text-slate-400 tracking-widest uppercase mb-1 block">
                {label}
            </label>
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => options.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-8 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-accent-red focus:ring-1 focus:ring-accent-red/20 outline-none transition-colors placeholder:text-slate-400"
                />
                {value && (
                    <button onClick={() => { onChange(''); setOptions([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                    </button>
                )}
                {loading && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 rounded-full border-2 border-accent-red border-t-transparent animate-spin" />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && options.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.code}
                                onClick={() => {
                                    onSelect(opt);
                                    onChange(opt.label);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 border-b border-slate-100 last:border-b-0"
                            >
                                <div className="min-w-0">
                                    <div className="text-xs font-medium text-slate-900 truncate">{opt.label}</div>
                                    <div className="text-[9px] font-mono text-slate-400">{opt.code}</div>
                                </div>
                                <div className="text-[9px] font-mono text-slate-500 shrink-0">
                                    {opt.outgoing_edges} paths
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


// -------------------------------------------------------------------
// Mobility direction icons
// -------------------------------------------------------------------
function MobilityBadge({ direction }: { direction: string }) {
    if (direction === 'upward') return (
        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <TrendingUp className="w-2.5 h-2.5" /> Upward
        </span>
    );
    if (direction === 'downward') return (
        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <TrendingDown className="w-2.5 h-2.5" /> Downward
        </span>
    );
    return (
        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            <Minus className="w-2.5 h-2.5" /> Lateral
        </span>
    );
}


// -------------------------------------------------------------------
// Main Component
// -------------------------------------------------------------------
export default function CareerExplorer({
    onRoutesFound,
}: {
    onRoutesFound?: (data: any) => void;
}) {
    const [fromValue, setFromValue] = useState('');
    const [toValue, setToValue] = useState('');
    const [fromRole, setFromRole] = useState<RoleOption | null>(null);
    const [toRole, setToRole] = useState<RoleOption | null>(null);

    const [transitions, setTransitions] = useState<any>(null);
    const [pathResult, setPathResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showTransitions, setShowTransitions] = useState(true);
    const [activeRouteId, setActiveRouteId] = useState<string>('');

    // When a "from" role is selected, auto-load its top transitions
    const loadTransitions = useCallback(async (role: RoleOption) => {
        const data = await exploreTransitions(role.label);
        if (data) setTransitions(data);
    }, []);

    const handleFromSelect = useCallback((role: RoleOption) => {
        setFromRole(role);
        setPathResult(null);
        loadTransitions(role);
    }, [loadTransitions]);

    const handleToSelect = useCallback((role: RoleOption) => {
        setToRole(role);
    }, []);

    // Find paths
    const handleFindPaths = useCallback(async () => {
        if (!fromRole || !toRole) return;
        setLoading(true);
        setPathResult(null);

        const data = await exploreCareerPaths(fromRole.label, toRole.label);
        if (data) {
            setPathResult(data);
            if (data.routes && data.routes.length > 0) {
                setActiveRouteId(data.routes[0].id);
            }
            // Pass routes up to parent so SubwayMap can render them
            if (onRoutesFound && data.routes) {
                onRoutesFound(data);
            }
        }
        setLoading(false);
    }, [fromRole, toRole, onRoutesFound]);

    // Allow clicking a transition destination to set it as the "to" role
    const handleTransitionClick = useCallback((toLabel: string, toCode: string) => {
        setToValue(toLabel);
        setToRole({ label: toLabel, code: toCode, outgoing_edges: 0, total_transitions: 0 });
    }, []);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center">
                    <Database className="w-4 h-4 text-accent-red" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Career Path Explorer</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Powered by 800K+ real career trajectories</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] font-mono font-bold text-slate-400">LIVE DATA</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-5 py-4">
                <div className="flex items-end gap-3">
                    <RoleAutocomplete
                        value={fromValue}
                        onChange={setFromValue}
                        onSelect={handleFromSelect}
                        placeholder="e.g. warehouse worker"
                        label="I am currently a..."
                    />
                    <div className="pb-2">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <RoleAutocomplete
                        value={toValue}
                        onChange={setToValue}
                        onSelect={handleToSelect}
                        placeholder="e.g. software developer"
                        label="I want to become a..."
                    />
                    <button
                        onClick={handleFindPaths}
                        disabled={!fromRole || !toRole || loading}
                        className="px-4 py-2 bg-accent-red text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center gap-1.5"
                    >
                        {loading ? (
                            <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                            <Search className="w-3 h-3" />
                        )}
                        Find Paths
                    </button>
                </div>
            </div>

            {/* Transitions Panel (shown when a from_role is selected) */}
            {transitions && !pathResult && (
                <div className="px-5 pb-4">
                    <button
                        onClick={() => setShowTransitions(!showTransitions)}
                        className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase mb-3 hover:text-slate-700 transition-colors"
                    >
                        <ChevronDown className={`w-3 h-3 transition-transform ${showTransitions ? '' : '-rotate-90'}`} />
                        Most common next moves from {transitions.from_role}
                        <span className="text-slate-400">({transitions.total_outgoing_edges} total paths)</span>
                    </button>

                    <AnimatePresence>
                        {showTransitions && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {transitions.transitions?.slice(0, 9).map((t: any, i: number) => (
                                        <motion.button
                                            key={t.to_role}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={() => handleTransitionClick(t.to_role, t.to_code)}
                                            className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-accent-red/40 hover:bg-red-50/30 transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-1.5">
                                                <p className="text-xs font-medium text-slate-800 leading-tight group-hover:text-accent-red transition-colors">
                                                    {t.to_role}
                                                </p>
                                                <MobilityBadge direction={t.mobility_direction} />
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[9px] font-mono text-slate-500 flex items-center gap-0.5">
                                                    <Users className="w-2.5 h-2.5" /> {t.count.toLocaleString()}
                                                </span>
                                                <span className="text-[9px] font-mono text-slate-500 flex items-center gap-0.5">
                                                    <Clock className="w-2.5 h-2.5" /> {t.avg_time_in_current_years}yr avg
                                                </span>
                                                <span className="text-[9px] font-mono text-slate-500 flex items-center gap-0.5">
                                                    <GraduationCap className="w-2.5 h-2.5" /> {t.pct_university}% uni
                                                </span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Path Results Summary */}
            {pathResult && pathResult.routes && pathResult.routes.length > 0 && (
                <div className="px-5 pb-4">
                    <div className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase mb-3">
                        Found {pathResult.routes.length} path{pathResult.routes.length !== 1 ? 's' : ''} from{' '}
                        <span className="text-slate-800">{pathResult.from_role}</span> to{' '}
                        <span className="text-slate-800">{pathResult.to_role}</span>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-4 overflow-hidden">
                        <SubwayMap 
                            routes={pathResult.routes}
                            activeRouteId={activeRouteId || (pathResult.routes[0]?.id || '')}
                            onRouteSelect={setActiveRouteId}
                            startLabel={pathResult.from_role}
                            endLabel={pathResult.to_role}
                        />
                    </div>
                    
                    {pathResult.routes && pathResult.routes.find((r: any) => r.id === activeRouteId) && (
                        <div className="mt-4">
                            <RouteTimeline route={pathResult.routes.find((r: any) => r.id === activeRouteId)} />
                        </div>
                    )}
                </div>
            )}

            {/* No results */}
            {pathResult && (!pathResult.routes || pathResult.routes.length === 0) && (
                <div className="px-5 pb-4 text-center py-6">
                    <p className="text-sm text-slate-500">{pathResult.message || 'No paths found between these roles.'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Try broader role titles or increase the hop limit.</p>
                </div>
            )}
        </div>
    );
}
