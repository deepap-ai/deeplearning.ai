import { Clock, ShieldCheck, GraduationCap, Rocket, Building2 } from 'lucide-react';

interface Route {
    id: string;
    label: string;
    subtitle?: string;
    icon: string;
}

interface RouteFilterPanelProps {
    routes: Route[];
    activeRoute: string;
    onSelect: (id: string) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    'clock': Clock,
    'shield-dollar': ShieldCheck,
    'graduation-cap': GraduationCap,
    'rocket': Rocket,
    'building': Building2,
};

export default function RouteFilterPanel({ routes, activeRoute, onSelect }: RouteFilterPanelProps) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase mb-1">Route Options</h3>
            <div className="flex flex-col gap-1.5">
                {routes.map(route => {
                    const Icon = ICON_MAP[route.icon] || Clock;
                    const isActive = route.id === activeRoute;

                    return (
                        <button
                            key={route.id}
                            onClick={() => onSelect(route.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                                isActive
                                    ? 'border-accent-red bg-red-50 shadow-sm'
                                    : 'border-slate-200 bg-white hover-red-outline'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isActive ? 'bg-accent-red text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className={`text-xs font-bold truncate ${isActive ? 'text-accent-red' : 'text-slate-800'}`}>
                                    {route.label}
                                </div>
                                {route.subtitle && (
                                    <div className="text-[10px] text-slate-500 truncate">{route.subtitle}</div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
