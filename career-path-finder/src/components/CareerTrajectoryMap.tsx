import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, Search, X, ArrowRight, Loader2, ChevronDown } from 'lucide-react';
import { exploreSearchRoles, exploreCareerPaths } from '../services/api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface RoleOption {
    label: string;
    code: string;
    outgoing_edges: number;
    total_transitions: number;
}

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

// ─────────────────────────────────────────────
// Dimension definitions
// ─────────────────────────────────────────────

interface Dimension {
    id: string;
    label: string;
    description: string;
    /** Y-axis: high score (top) → low score (bottom) */
    bandLabels: string[];
    /** X-axis: low score (left) → high score (right) */
    xLabels: string[];
    scoreStep: (step: RouteStep, idx: number, cumulativeMonths: number, totalRouteMonths: number) => number;
    scoreRole: (role: string) => number;
}

function parseDurationMonths(dur?: string): number {
    if (!dur) return 0;
    const m = dur.match(/(\d+)\s*mo/i);
    if (m) return parseInt(m[1], 10);
    const y = dur.match(/(\d+)\s*yr/i);
    if (y) return parseInt(y[1], 10) * 12;
    return 0;
}

function scopeScore(title: string): number {
    const t = title.toLowerCase();
    if (t.match(/\b(chief|ceo|coo|cfo|cto|cpo|cao|ciso|cro|cmo)\b/)) return 0.9;
    if (t.match(/\b(founder|co-founder|president|owner)\b/)) return 0.85;
    if (t.match(/\b(evp|svp|vp|vice president)\b/)) return 0.72;
    if (t.match(/\b(director|head of|gm|general manager)\b/)) return 0.60;
    if (t.match(/\b(manager|lead|principal)\b/)) return 0.48;
    if (t.match(/\b(senior|sr\.|staff|specialist)\b/)) return 0.35;
    if (t.match(/\b(analyst|associate|coordinator)\b/)) return 0.22;
    return 0.30;
}

function craftScore(step: RouteStep, idx: number): number {
    const t = step.title.toLowerCase();
    const type = step.type.toLowerCase();
    if (type === 'certification' || type === 'course' || type === 'degree') return 0.45 + idx * 0.08;
    if (t.match(/\b(architect|principal|staff|fellow|distinguished)\b/)) return 0.85;
    if (t.match(/\b(senior|lead|expert)\b/)) return 0.68;
    if (t.match(/\b(manager|director)\b/)) return 0.50;
    if (t.match(/\b(analyst|associate|junior|entry)\b/)) return 0.25;
    return 0.30 + idx * 0.08;
}

function orgScore(title: string): number {
    const t = title.toLowerCase();
    if (t.match(/\b(fortune|public|ipo|nyse|nasdaq|enterprise)\b/)) return 0.88;
    if (t.match(/\b(series [cd]|late stage|growth stage)\b/)) return 0.65;
    if (t.match(/\b(series [ab]|startup|early stage)\b/)) return 0.22;
    if (t.match(/\b(scale.?up|series b)\b/)) return 0.45;
    if (t.match(/\b(corporation|inc\.|corp\.)\b/)) return 0.75;
    return 0.50;
}

function riskScore(step: RouteStep): number {
    const t = step.title.toLowerCase();
    const type = step.type.toLowerCase();
    if (t.match(/\b(founder|co-founder|ceo)\b/)) return 0.95;
    if (t.match(/\b(startup|early stage|series a)\b/)) return 0.72;
    if (type === 'degree' || type === 'certification') return 0.15;
    if (t.match(/\b(vp|svp|director)\b/)) return 0.45;
    if (t.match(/\b(senior|lead)\b/)) return 0.32;
    return 0.28;
}

const DIMENSIONS: Dimension[] = [
    {
        id: 'time',
        label: 'Time Horizon',
        description: 'Career progression over time',
        bandLabels: ['Further out', 'Mid-term', 'Near-term'],
        xLabels: ['Now', 'Mid-term', 'Further out'],
        scoreStep: (_step, _idx, cumMonths, totalMonths) =>
            totalMonths > 0 ? Math.min(cumMonths / Math.max(totalMonths, 1), 1) : 0.5,
        scoreRole: () => 0.05,
    },
    {
        id: 'scope',
        label: 'Scope of Impact',
        description: 'Individual → Industry-wide influence',
        bandLabels: ['Industry / Org-wide', 'Team / Dept', 'Individual'],
        xLabels: ['Individual', 'Team / Dept', 'Industry-wide'],
        scoreStep: (step) => scopeScore(step.title),
        scoreRole: (role) => scopeScore(role),
    },
    {
        id: 'craft',
        label: 'Craft Depth',
        description: 'Generalist → Deep domain expert',
        bandLabels: ['Thought Leader', 'Expert', 'Generalist'],
        xLabels: ['Generalist', 'Expert', 'Thought Leader'],
        scoreStep: (step, idx) => craftScore(step, idx),
        scoreRole: () => 0.25,
    },
    {
        id: 'org',
        label: 'Org Context',
        description: 'Startup → Enterprise / Public Co',
        bandLabels: ['Public / Enterprise', 'Scale-up', 'Startup'],
        xLabels: ['Startup', 'Scale-up', 'Enterprise'],
        scoreStep: (step) => orgScore(step.title),
        scoreRole: (role) => orgScore(role),
    },
    {
        id: 'risk',
        label: 'Economic Risk',
        description: 'Stable salary → Founder equity upside',
        bandLabels: ['Founder / Equity', 'Mixed comp', 'Stable salary'],
        xLabels: ['Stable salary', 'Mixed comp', 'Founder / Equity'],
        scoreStep: (step) => riskScore(step),
        scoreRole: (role) => (role.toLowerCase().includes('founder') ? 0.92 : 0.25),
    },
    {
        id: 'pay',
        label: 'Pay / Comp',
        description: 'Entry-level pay → Top-of-market comp',
        bandLabels: ['Top of market', 'Mid-market', 'Entry-level pay'],
        xLabels: ['Entry-level', 'Mid-market', 'Top of market'],
        scoreStep: (step) => {
            const t = step.title.toLowerCase();
            if (t.match(/\b(chief|ceo|coo|cfo|cto|cpo|cao)\b/)) return 0.92;
            if (t.match(/\b(founder|president)\b/)) return 0.85;
            if (t.match(/\b(vp|svp|evp|vice president)\b/)) return 0.75;
            if (t.match(/\b(director|head of)\b/)) return 0.65;
            if (t.match(/\b(manager|lead|principal)\b/)) return 0.52;
            if (t.match(/\b(senior|sr\.)\b/)) return 0.42;
            if (t.match(/\b(analyst|associate|coordinator|junior|entry)\b/)) return 0.22;
            return 0.35;
        },
        scoreRole: (role) => {
            const t = role.toLowerCase();
            if (t.match(/\b(chief|ceo|coo|cto|cpo)\b/)) return 0.92;
            if (t.match(/\b(founder)\b/)) return 0.85;
            if (t.match(/\b(vp|director)\b/)) return 0.72;
            if (t.match(/\b(manager|lead)\b/)) return 0.52;
            if (t.match(/\b(senior)\b/)) return 0.40;
            return 0.28;
        },
    },
];

// ─────────────────────────────────────────────
// Route color palette
// ─────────────────────────────────────────────

const ROUTE_STYLES = [
    { color: '#1a6b3c', dash: undefined, monthsColor: 'text-slate-700' },
    { color: '#c2720a', dash: '9 5', monthsColor: 'text-orange-500' },
    { color: '#6366f1', dash: '6 5', monthsColor: 'text-indigo-500' },
    { color: '#0284c7', dash: '8 4', monthsColor: 'text-sky-600' },
    { color: '#be185d', dash: '7 4', monthsColor: 'text-pink-700' },
];

// ─────────────────────────────────────────────
// Short label helper
// ─────────────────────────────────────────────

function shortLabel(title: string): string {
    const abbrevs: Record<string, string> = {
        'software developer': 'SW Dev', 'software engineer': 'SWE',
        'product manager': 'PM', 'project manager': 'Proj Mgr',
        'data scientist': 'Data Sci', 'data analyst': 'Analyst',
        'machine learning': 'ML Eng', 'warehouse worker': 'WH Wkr',
        'help desk': 'Help Desk', 'ict help desk': 'ICT HD',
        'front end': 'Frontend', 'back end': 'Backend',
        'full stack': 'Full Stack', 'devops': 'DevOps',
    };
    const lower = title.toLowerCase();
    for (const [k, v] of Object.entries(abbrevs)) {
        if (lower.includes(k)) return v;
    }
    const words = title.replace(/\(.*?\)/g, '').trim().split(/\s+/);
    if (words.length <= 2) return words.join(' ').slice(0, 12);
    return (words[0] + ' ' + words[1]).slice(0, 12);
}

// ─────────────────────────────────────────────
// Computed route types
// ─────────────────────────────────────────────

interface ComputedNode {
    id: string;
    label: string;
    sublabel: string;
    xScore: number; // 0-1
    yScore: number; // 0-1 (higher = higher on map)
    color: string;
    size: number;
    isDashedEnd?: boolean;
    step: RouteStep;
}

interface ComputedRoute {
    id: string;
    label: string;
    color: string;
    dash?: string;
    monthsColor: string;
    nodes: ComputedNode[];
    steps: RouteStep[];
    durationMonths: number;
}

// SVG layout constants
const MAP = { x0: 90, x1: 610, y0: 55, y1: 495 };

function scoreToX(score: number) { return MAP.x0 + score * (MAP.x1 - MAP.x0); }
function scoreToY(score: number) { return MAP.y1 - score * (MAP.y1 - MAP.y0); }

// Spread overlapping routes vertically so paths don't stack
const ROUTE_Y_OFFSETS = [0, 0.12, -0.12, 0.22, -0.22];

function buildRoutes(
    apiRoutes: CareerRoute[],
    fromRole: string,
    xDim: Dimension,
    yDim: Dimension,
): ComputedRoute[] {
    return apiRoutes.map((route, rIdx) => {
        const style = ROUTE_STYLES[rIdx % ROUTE_STYLES.length];
        const yOffset = apiRoutes.length > 1 ? ROUTE_Y_OFFSETS[rIdx % ROUTE_Y_OFFSETS.length] : 0;

        let cumulativeMonths = 0;
        const totalRouteMonths = route.steps.reduce((s, st) => s + parseDurationMonths(st.duration), 0);

        const nodes: ComputedNode[] = route.steps.map((step, idx) => {
            cumulativeMonths += parseDurationMonths(step.duration);
            const rawY = yDim.scoreStep(step, idx, cumulativeMonths, totalRouteMonths);
            const rawX = xDim.scoreStep(step, idx, cumulativeMonths, totalRouteMonths);
            return {
                id: `${route.id}-${idx}`,
                label: shortLabel(step.title),
                sublabel: step.title.length > 18 ? step.title.slice(0, 16) + '…' : step.title,
                xScore: Math.max(0.15, Math.min(0.98, rawX)),
                yScore: Math.max(0.05, Math.min(0.95, rawY + yOffset)),
                color: style.color,
                size: 22,
                isDashedEnd: route.label.toLowerCase().includes('founder') && idx === route.steps.length - 1,
                step,
            };
        });

        return {
            id: route.id,
            label: route.label,
            color: style.color,
            dash: style.dash,
            monthsColor: style.monthsColor,
            nodes,
            steps: route.steps,
            durationMonths: totalRouteMonths,
        };
    });
}

function buildPath(youX: number, youY: number, nodes: ComputedNode[]): string {
    const pts = [{ x: youX, y: youY }, ...nodes.map((n) => ({ x: scoreToX(n.xScore), y: scoreToY(n.yScore) }))];
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const cx = a.x + (b.x - a.x) * 0.5;
        d += ` C ${cx} ${a.y} ${cx} ${b.y} ${b.x} ${b.y}`;
    }
    return d;
}

// ─────────────────────────────────────────────
// Axis selector dropdown
// ─────────────────────────────────────────────

function AxisSelector({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (id: string) => void;
    options: Dimension[];
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = options.find((d) => d.id === value)!;

    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-0.5 text-center">{label}</div>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-300 shadow-sm transition-colors"
            >
                {selected.label}
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-1.5 left-0 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                        style={{ zIndex: 9999 }}
                    >
                        {options.map((dim) => (
                            <button
                                key={dim.id}
                                onClick={() => { onChange(dim.id); setOpen(false); }}
                                className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${dim.id === value ? 'bg-blue-50/60' : ''}`}
                            >
                                <div className={`text-xs font-semibold ${dim.id === value ? 'text-blue-600' : 'text-slate-800'}`}>
                                    {dim.label}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{dim.description}</div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────
// Role Autocomplete
// ─────────────────────────────────────────────

function RoleAutocomplete({
    value, onChange, onSelect, placeholder, label,
}: {
    value: string; onChange: (v: string) => void; onSelect: (r: RoleOption) => void;
    placeholder: string; label: string;
}) {
    const [options, setOptions] = useState<RoleOption[]>([]);
    const [open, setOpen] = useState(false);
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
            setOpen(true);
            setLoading(false);
        }, 250);
    }, [value]);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">{label}</p>
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                    type="text" value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => options.length > 0 && setOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 placeholder:text-slate-400"
                />
                {value && (
                    <button onClick={() => { onChange(''); setOptions([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                    </button>
                )}
                {loading && <div className="absolute right-7 top-1/2 -translate-y-1/2"><Loader2 className="w-3 h-3 text-blue-400 animate-spin" /></div>}
            </div>
            <AnimatePresence>
                {open && options.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {options.map((opt) => (
                            <button key={opt.code}
                                onClick={() => { onSelect(opt); onChange(opt.label); setOpen(false); }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-800 truncate">{opt.label}</span>
                                <span className="text-[9px] font-mono text-slate-400 shrink-0 ml-2">{opt.outgoing_edges} paths</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────
// Route card
// ─────────────────────────────────────────────

function RouteCard({ route, active, onClick }: { route: ComputedRoute; active: boolean; onClick: () => void }) {
    return (
        <motion.button onClick={onClick} whileTap={{ scale: 0.98 }}
            className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all ${active ? 'border-blue-300 bg-blue-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: route.color }} />
                        <p className={`text-sm font-semibold leading-tight truncate ${active ? 'text-blue-600' : 'text-slate-800'}`}>{route.label}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-4">
                        {route.steps.length} step{route.steps.length !== 1 ? 's' : ''}
                        {route.steps[0] && ` · via ${route.steps[0].title.slice(0, 22)}`}
                    </p>
                </div>
                {route.durationMonths > 0 && (
                    <div className="shrink-0 text-right">
                        <span className={`text-sm font-bold ${route.monthsColor}`}>{route.durationMonths}</span>
                        <span className="text-[11px] text-slate-400 block -mt-0.5">mo</span>
                    </div>
                )}
            </div>
        </motion.button>
    );
}

// ─────────────────────────────────────────────
// SVG Map
// ─────────────────────────────────────────────

function TrajectoryMapSVG({
    routes,
    activeRouteId,
    xDim,
    yDim,
    fromRole,
    onRouteClick,
}: {
    routes: ComputedRoute[];
    activeRouteId: string;
    xDim: Dimension;
    yDim: Dimension;
    fromRole: string;
    onRouteClick: (id: string) => void;
}) {
    const containerRef = useRef<SVGSVGElement>(null);
    const [size, setSize] = useState({ w: 700, h: 500 });

    useEffect(() => {
        const update = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    setSize({ w: rect.width, h: rect.height });
                }
            }
        };
        update();
        const ro = new ResizeObserver(update);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const W = size.w, H = size.h;
    // Dynamic map boundaries based on container size
    const dynMAP = { x0: 110, x1: W - 30, y0: 30, y1: H - 40 };

    function dScoreToX(score: number) { return dynMAP.x0 + score * (dynMAP.x1 - dynMAP.x0); }
    function dScoreToY(score: number) { return dynMAP.y1 - score * (dynMAP.y1 - dynMAP.y0); }
    function dBuildPath(youX: number, youY: number, nodes: ComputedNode[]) {
        const pts = [{ x: youX, y: youY }, ...nodes.map((n) => ({ x: dScoreToX(n.xScore), y: dScoreToY(n.yScore) }))];
        if (pts.length < 2) return '';
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1], b = pts[i];
            const cx = a.x + (b.x - a.x) * 0.5;
            d += ` C ${cx} ${a.y} ${cx} ${b.y} ${b.x} ${b.y}`;
        }
        return d;
    }

    const youXScore = fromRole ? xDim.scoreRole(fromRole) : 0.05;
    const youYScore = fromRole ? yDim.scoreRole(fromRole) : 0.5;
    const youX = dScoreToX(youXScore);
    const youY = dScoreToY(youYScore);

    const yBands = yDim.bandLabels;
    const bandHeight = (dynMAP.y1 - dynMAP.y0) / yBands.length;
    const xCols = xDim.xLabels;  // low→high, left→right
    const colWidth = (dynMAP.x1 - dynMAP.x0) / xCols.length;

    return (
        <svg ref={containerRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ fontFamily: 'system-ui, sans-serif' }}>
            <defs>
                <filter id="node-shadow" x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000018" />
                </filter>
                <filter id="glow" x="-20%" y="-60%" width="140%" height="220%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {/* Map background */}
            <rect width={W} height={H} fill="#f0ebe0" />

            {/* Y-axis bands */}
            {yBands.map((band, i) => (
                <g key={band}>
                    <rect x={0} y={dynMAP.y0 + i * bandHeight} width={W} height={bandHeight}
                        fill={i % 2 === 0 ? '#e8e3d8' : '#f0ebe0'} />
                    <text x={14} y={dynMAP.y0 + i * bandHeight + bandHeight / 2 + 4}
                        fontSize="11" fill="#9e9689" fontWeight="600">{band}</text>
                    {i > 0 && <line x1={0} y1={dynMAP.y0 + i * bandHeight} x2={W} y2={dynMAP.y0 + i * bandHeight}
                        stroke="#cdc6b8" strokeWidth="1.5" />}
                </g>
            ))}
            <line x1={0} y1={dynMAP.y0} x2={W} y2={dynMAP.y0} stroke="#cdc6b8" strokeWidth="1" />
            <line x1={0} y1={dynMAP.y1} x2={W} y2={dynMAP.y1} stroke="#cdc6b8" strokeWidth="1" />

            {/* X-axis column guides */}
            {xCols.map((col, i) => {
                const cx = dynMAP.x0 + (i + 0.5) * colWidth;
                return (
                    <g key={col}>
                        {i > 0 && <line x1={dynMAP.x0 + i * colWidth} y1={dynMAP.y0}
                            x2={dynMAP.x0 + i * colWidth} y2={dynMAP.y1}
                            stroke="#cdc6b8" strokeWidth="1" strokeDasharray="5 5" />}
                        <text x={cx} y={H - 8} fontSize="11" fill="#9e9689" textAnchor="middle" fontWeight="500">{col}</text>
                    </g>
                );
            })}

            {/* Empty state */}
            {routes.length === 0 && (
                <text x={W / 2} y={H / 2} fontSize="14" fill="#b5ada3" textAnchor="middle" fontWeight="500">
                    {fromRole ? 'Select a target role to explore paths' : 'Search for roles to see your career map'}
                </text>
            )}

            {/* Road-style paths: white casing first */}
            {routes.map((route) => {
                const pathD = dBuildPath(youX, youY, route.nodes);
                const isActive = route.id === activeRouteId;
                return <path key={`casing-${route.id}`} d={pathD}
                    stroke="white" strokeWidth={isActive ? 9 : 6} fill="none"
                    strokeLinecap="round" opacity={isActive ? 0.85 : 0.45} />;
            })}

            {/* Inactive colored paths */}
            {routes.filter((r) => r.id !== activeRouteId).map((route) => {
                const pathD = dBuildPath(youX, youY, route.nodes);
                return (
                    <g key={`path-${route.id}`} style={{ cursor: 'pointer' }} onClick={() => onRouteClick(route.id)}>
                        <path d={pathD} stroke={route.color} strokeWidth={4}
                            strokeDasharray={route.dash} fill="none" opacity={0.3} strokeLinecap="round" />
                        <path d={pathD} stroke="transparent" strokeWidth={22} fill="none" />
                    </g>
                );
            })}

            {/* Active route with glow */}
            {routes.filter((r) => r.id === activeRouteId).map((route) => {
                const pathD = dBuildPath(youX, youY, route.nodes);
                return (
                    <g key={`path-active-${route.id}`}>
                        <path d={pathD} stroke={route.color} strokeWidth={9} fill="none"
                            opacity={0.2} strokeLinecap="round" filter="url(#glow)" />
                        <path d={pathD} stroke={route.color} strokeWidth={4.5}
                            strokeDasharray={route.dash} fill="none" opacity={1} strokeLinecap="round" />
                    </g>
                );
            })}

            {/* Waypoint nodes */}
            {routes.map((route) => {
                const isActive = route.id === activeRouteId;
                return (
                    <g key={`nodes-${route.id}`} opacity={isActive ? 1 : 0.38}>
                        {route.nodes.map((node, idx) => {
                            const nx = dScoreToX(node.xScore);
                            const ny = dScoreToY(node.yScore);
                            return (
                                <g key={node.id}>
                                    <circle cx={nx} cy={ny + 2} r={node.size + 1} fill="#00000012" />
                                    <circle cx={nx} cy={ny} r={node.size} fill="white"
                                        stroke={node.color} strokeWidth="2.5"
                                        strokeDasharray={node.isDashedEnd ? '5 3' : undefined} />
                                    <text x={nx} y={ny + 4} fontSize="9.5" fontWeight="700"
                                        fill={node.color} textAnchor="middle">{node.label}</text>
                                    <text x={nx} y={ny + node.size + 14} fontSize="9"
                                        fill="#6b7280" textAnchor="middle" fontWeight="500">{node.sublabel}</text>
                                    {isActive && idx === 0 && (
                                        <g transform={`translate(${nx - 40}, ${ny + node.size + 26})`}>
                                            <rect rx="9" ry="9" width="84" height="18" fill="white" stroke="#d1d5db" strokeWidth="1" />
                                            <text x="42" y="13" fontSize="8.5" fill="#374151" textAnchor="middle" fontWeight="600">Day in the life ✏</text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </g>
                );
            })}

            {/* YOU node */}
            {fromRole && (
                <g>
                    <circle cx={youX} cy={youY + 3} r={27} fill="#00000018" />
                    <circle cx={youX} cy={youY} r={26} fill="#1a6b3c" stroke="white" strokeWidth="3.5" />
                    <text x={youX} y={youY + 4} fontSize="11" fontWeight="800" fill="white" textAnchor="middle">YOU</text>
                    <text x={youX} y={youY + 42} fontSize="9.5" fill="#4b5563" textAnchor="middle" fontWeight="500">
                        {fromRole.length > 20 ? fromRole.slice(0, 18) + '…' : fromRole}
                    </text>
                </g>
            )}
        </svg>
    );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const SKILL_GAPS_PLACEHOLDER = [
    { name: 'Enterprise sales', pct: 72, color: '#22c55e' },
    { name: 'Board management', pct: 44, color: '#f59e0b' },
];

export default function CareerTrajectoryMap() {
    const [fromValue, setFromValue] = useState('');
    const [toValue, setToValue] = useState('');
    const [fromRole, setFromRole] = useState<RoleOption | null>(null);
    const [toRole, setToRole] = useState<RoleOption | null>(null);
    const [routes, setRoutes] = useState<ComputedRoute[]>([]);
    const [activeRouteId, setActiveRouteId] = useState('');
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(1);

    // Dynamic axes — default: X = time, Y = scope of impact
    const [xDimId, setXDimId] = useState('time');
    const [yDimId, setYDimId] = useState('scope');

    const xDim = DIMENSIONS.find((d) => d.id === xDimId)!;
    const yDim = DIMENSIONS.find((d) => d.id === yDimId)!;

    // Recompute routes whenever axes change
    const computedRoutes = routes.length > 0 && fromRole
        ? buildRoutes(
            routes.map((r) => ({ id: r.id, label: r.label, steps: r.steps })),
            fromRole.label,
            xDim,
            yDim,
          ).map((cr, i) => ({ ...cr, color: routes[i]?.color ?? cr.color, dash: routes[i]?.dash, monthsColor: routes[i]?.monthsColor ?? cr.monthsColor, durationMonths: routes[i]?.durationMonths ?? cr.durationMonths }))
        : routes;

    const handleFindPaths = useCallback(async () => {
        if (!fromRole || !toRole) return;
        setLoading(true);
        setRoutes([]);
        const data = await exploreCareerPaths(fromRole.label, toRole.label);
        if (data?.routes?.length) {
            const computed = buildRoutes(data.routes, fromRole.label, xDim, yDim);
            // Attach original API data for axis switching
            const withApi = computed.map((cr, i) => ({
                ...cr,
                _apiRoute: data.routes[i],
            }));
            setRoutes(withApi as any);
            setActiveRouteId(computed[0].id);
        }
        setLoading(false);
    }, [fromRole, toRole, xDim, yDim]);

    // Rebuild on axis change
    const displayRoutes = routes.length > 0 && fromRole
        ? buildRoutes(
            (routes as any[]).map((r) => r._apiRoute ?? { id: r.id, label: r.label, steps: r.steps }),
            fromRole.label,
            xDim,
            yDim,
          ).map((cr, i) => ({
              ...cr,
              color: ROUTE_STYLES[i % ROUTE_STYLES.length].color,
              dash: ROUTE_STYLES[i % ROUTE_STYLES.length].dash,
              monthsColor: ROUTE_STYLES[i % ROUTE_STYLES.length].monthsColor,
              durationMonths: (routes as any[])[i]?.durationMonths ?? cr.durationMonths,
          }))
        : [];

    return (
        <div className="flex bg-white overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>

            {/* ── Left Sidebar ── */}
            <div className="w-[300px] shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-y-auto">

                {/* Mini nav */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-wrap">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">SpArc AI</span>
                    </div>
                    <div className="flex gap-1 flex-wrap ml-auto">
                        {['Demand signals', 'Salary bands', 'Bridge skills'].map((label, i) => (
                            <button key={label} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                i === 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500'
                            }`}>{label}</button>
                        ))}
                    </div>
                </div>

                {/* Role search */}
                <div className="px-4 py-4 border-b border-slate-100 flex flex-col gap-3">
                    <RoleAutocomplete
                        value={fromValue} onChange={setFromValue}
                        onSelect={(r) => { setFromRole(r); setRoutes([]); }}
                        placeholder="e.g. Warehouse worker" label="I am currently a..." />
                    <div className="flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                    <RoleAutocomplete
                        value={toValue} onChange={setToValue} onSelect={setToRole}
                        placeholder="e.g. Software developer" label="I want to become a..." />
                    <button
                        onClick={handleFindPaths}
                        disabled={!fromRole || !toRole || loading}
                        className="w-full py-2 bg-[#1a6b3c] text-white text-xs font-bold rounded-lg hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        {loading ? 'Finding paths…' : 'Explore career paths'}
                    </button>
                </div>

                {/* Routes */}
                {displayRoutes.length > 0 && (
                    <div className="px-4 py-4 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">
                            {displayRoutes.length} Route{displayRoutes.length !== 1 ? 's' : ''} Found
                        </p>
                        <div className="flex flex-col gap-2">
                            {displayRoutes.map((route) => (
                                <RouteCard key={route.id} route={route}
                                    active={activeRouteId === route.id}
                                    onClick={() => setActiveRouteId(route.id)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Skill gaps */}
                {displayRoutes.length > 0 && (
                    <div className="px-4 py-4 mt-auto">
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">Skill Gaps To Close</p>
                        <div className="flex flex-col gap-3">
                            {SKILL_GAPS_PLACEHOLDER.map((sg) => (
                                <div key={sg.name}>
                                    <p className="text-[12px] font-medium text-slate-700 mb-1">{sg.name}</p>
                                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${sg.pct}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className="h-full rounded-full" style={{ backgroundColor: sg.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Map Panel ── */}
            <div className="flex-1 relative bg-[#f0ebe0] flex flex-col" style={{ minWidth: 0 }}>

                {/* Axis selectors bar */}
                <div className="flex items-center justify-center gap-6 px-6 py-2.5 bg-white/70 backdrop-blur-sm border-b border-slate-200 shrink-0" style={{ overflow: 'visible', position: 'relative', zIndex: 100 }}>
                    <AxisSelector label="Y Axis" value={yDimId} onChange={setYDimId} options={DIMENSIONS} />
                    <div className="text-xs text-slate-300 font-medium">vs</div>
                    <AxisSelector label="X Axis" value={xDimId} onChange={setXDimId} options={DIMENSIONS} />
                    <div className="ml-4 text-[10px] text-slate-400 italic max-w-[200px] leading-tight hidden lg:block">
                        The 2D map is a projection — change axes to explore different dimensions of career space
                    </div>
                </div>

                {/* Map SVG */}
                <div className="flex-1 relative overflow-hidden">
                    <motion.div
                        key={`${xDimId}-${yDimId}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                    >
                        <TrajectoryMapSVG
                            routes={displayRoutes}
                            activeRouteId={activeRouteId}
                            xDim={xDim}
                            yDim={yDim}
                            fromRole={fromRole?.label ?? ''}
                            onRouteClick={setActiveRouteId}
                        />
                    </motion.div>

                    {/* Zoom controls */}
                    <div className="absolute bottom-5 right-5 flex flex-col gap-1.5">
                        {[
                            { icon: <Plus className="w-4 h-4" />, action: () => setZoom((z) => Math.min(z + 0.2, 2.5)) },
                            { icon: <Minus className="w-4 h-4" />, action: () => setZoom((z) => Math.max(z - 0.2, 0.5)) },
                            { icon: <RotateCcw className="w-3.5 h-3.5" />, action: () => setZoom(1) },
                        ].map((btn, i) => (
                            <button key={i} onClick={btn.action}
                                className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
                                {btn.icon}
                            </button>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-5 left-4 flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                        {[
                            { label: 'Active route', dot: <span className="w-3 h-3 rounded-full bg-[#1a6b3c]" /> },
                            { label: 'Alternate', dot: <span className="w-3 h-3 rounded-full border-2 border-[#c2720a] bg-white" /> },
                            { label: 'Founder path', dot: <span className="w-3 h-3 rounded-full border-2 border-indigo-500 bg-white" style={{ borderStyle: 'dashed' }} /> },
                        ].map(({ label, dot }) => (
                            <div key={label} className="flex items-center gap-1.5">
                                {dot}
                                <span className="text-[11px] text-slate-600">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
