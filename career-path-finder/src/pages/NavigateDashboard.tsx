import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { getPersona, getPersonaRoutes, runGapAnalysis, getProfile } from '../services/api';

import TranscriptExplosion from '../components/TranscriptExplosion';
import SourceScanAnimation from '../components/SourceScanAnimation';
import CandidateSkillDAG from '../components/CandidateSkillDAG';
import MultiSourceVennDiagram from '../components/MultiSourceVennDiagram';
import RouteTimeline from '../components/RouteTimeline';
import GapAnalysisPanel from '../components/GapAnalysisPanel';
import AlternativeDestinations from '../components/AlternativeDestinations';
import SubwayMap from '../components/SubwayMap';
import { Activity } from 'lucide-react';

export default function NavigateDashboard() {
    const { persona_id } = useParams<{ persona_id: string }>();
    const [persona, setPersona] = useState<any>(null);
    const [routeData, setRouteData] = useState<any>(null);
    const [graphData, setGraphData] = useState<any>(null);

    const [phase, setPhase] = useState<'loading' | 'ingesting' | 'navigating'>('loading');
    const [activeRouteId, setActiveRouteId] = useState<string>('');
    const [gapItems, setGapItems] = useState<any[] | null>(null);
    const location = useLocation();

    const idToUse = persona_id || 'alex';

    // Fetch persona data
    useEffect(() => {
        setPhase('loading');

        const searchParams = new URLSearchParams(location.search);
        const targetRole = searchParams.get('role');
        const targetCompany = searchParams.get('company');

        Promise.all([
            getPersona(idToUse, targetRole, targetCompany).catch(() => null),
            getPersonaRoutes(idToUse, targetRole, targetCompany).catch(() => null),
            getProfile(idToUse).catch(() => null)
        ]).then(([personaData, routes, graph]) => {
            if (personaData && routes) {
                let mergedPersona = { ...personaData };
                if (graph) {
                    setGraphData(graph);
                    if (graph.persona_info) {
                        mergedPersona.name = graph.persona_info.name || mergedPersona.name;
                        mergedPersona.headline = graph.persona_info.headline || mergedPersona.headline;
                    }
                }
                setPersona(mergedPersona);
                setRouteData(routes);

                if (routes?.routes?.[0]) {
                    setActiveRouteId(routes.routes[0].id);
                }

                // For the demo: immediately go to navigating so we don't get stuck on the ingestion screen
                setPhase('navigating');
            } else {
                console.error('Failed to load critical persona data.');
                setPhase('navigating'); // fallback so UI isn't stuck
            }
        }).catch(err => {
            console.error('Failed to load persona:', err);
            setPhase('navigating');
        });
    }, [idToUse, location.search]);

    // Re-run gap analysis whenever the selected route changes
    useEffect(() => {
        if (!routeData?.current_skills || !routeData?.target_skills) return;

        // Find the active route and accumulate skills_gained from its steps
        const activeRoute = routeData.routes?.find((r: any) => r.id === activeRouteId);
        const augmentedSkills = { ...routeData.current_skills };

        if (activeRoute?.steps) {
            for (const step of activeRoute.steps) {
                if (step.skills_gained) {
                    for (const [skill, gain] of Object.entries(step.skills_gained)) {
                        augmentedSkills[skill] = Math.min(1.0, (augmentedSkills[skill] || 0) + (gain as number));
                    }
                }
            }
        }

        runGapAnalysis(augmentedSkills, routeData.target_skills)
            .then((gapResult: any) => {
                if (gapResult?.deltas) {
                    const newGaps = Object.entries(gapResult.deltas).map(([skill, delta]: [string, any]) => {
                        let priority = 'Low';
                        if (delta >= 0.6) priority = 'Critical';
                        else if (delta >= 0.3) priority = 'Medium';
                        
                        const rec = gapResult.upskilling_tasks?.[skill] || {};
                        let actionType = 'Course';
                        if (rec.repo) actionType = 'GitHub';
                        else if (rec.action?.includes('Micro-credential')) actionType = 'Micro-credential';
                        
                        let actionText = rec.issue || rec.details || rec.action || 'Recommended upskilling for this gap.';
                        
                        return {
                            skill,
                            priority,
                            actionType,
                            actionText,
                            actionLink: rec.repo ? `https://github.com/${rec.repo}` : undefined
                        };
                    });
                    setGapItems(newGaps);
                } else {
                    setGapItems([]);
                }
            })
            .catch(err => console.warn('Gap analysis failed:', err));
    }, [activeRouteId, routeData]);

    const handleIngestionComplete = useCallback(() => {
        setPhase('navigating');
    }, []);

    if (!persona || !routeData) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-accent-red flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">
                    <span className="w-4 h-4 rounded-full border-2 border-accent-red border-t-transparent animate-spin"></span>
                    Initializing GPS Engine...
                </div>
            </div>
        );
    }

    const activeRoute = routeData.routes?.find((r: any) => r.id === activeRouteId) || routeData.routes?.[0];

    return (
        <div className="flex flex-col gap-6 h-full max-w-[1600px] mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-3">
                        {persona.name}'s Navigation Paths
                    </h1>
                </div>
            </div>

            {/* Main Stacked Layout */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-12">

                {/* Top Row: Profile & Mission Control */}
                <div className={`grid grid-cols-1 ${phase === 'navigating' ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6 shrink-0`}>
                    {/* Left: Profile Card */}
                    <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200">
                        <div className="flex flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-accent-red/10 border border-accent-red/20 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold text-accent-red">{persona.avatar_initials || persona.name?.slice(0, 2)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-bold text-slate-900">{persona.name}</h3>
                                    <p className="text-[10px] text-slate-500 mb-2">
                                        {persona.headline || persona.school || 'Professional'}
                                        {persona.year || persona.major ? ` — ${persona.year || persona.major}` : ''}
                                    </p>

                                    <div className="text-[10px] text-slate-500 font-mono flex flex-col gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3 text-accent-red" />
                                            Navigating to: <span className="text-slate-800 font-bold">{routeData.target_role}</span>
                                            {routeData.target_company && <span className="text-slate-400">— {routeData.target_company}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Skills Summary */}
                            <div className="flex-1 max-w-2xl px-4 border-l border-slate-100 hidden md:flex flex-col">
                                <h4 className="text-[9px] font-mono font-bold text-slate-400 tracking-widest uppercase mb-2">Verified Skill Nodes</h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                                    {Object.entries(routeData.current_skills || {})
                                        .sort(([, a]: any, [, b]: any) => b - a)
                                        .slice(0, 6)
                                        .map(([skill, level]: [string, any]) => (
                                            <div key={skill} className="flex items-center gap-2">
                                                <span className="text-[9px] text-slate-600 truncate flex-1">{skill}</span>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                                    <div
                                                        className={`h-full rounded-full ${level >= 0.7 ? 'bg-accent-green' :
                                                            level >= 0.4 ? 'bg-amber-400' : 'bg-slate-300'
                                                            }`}
                                                        style={{ width: `${level * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Ingestion/Animation Area (Hidden when done) */}
                    {phase !== 'navigating' && (
                        <div className="lg:col-span-2 relative min-h-[200px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-center items-center">
                            <AnimatePresence mode="wait">
                                {phase === 'ingesting' && (
                                    <motion.div
                                        key="ingest"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center p-8 bg-white z-20"
                                    >
                                        {persona.ingestion_type === 'transcript' ? (
                                            <TranscriptExplosion
                                                courses={persona.courses || []}
                                                onComplete={handleIngestionComplete}
                                            />
                                        ) : (
                                            <SourceScanAnimation
                                                sources={(persona.sources || []).map((s: any) => ({
                                                    name: s.name,
                                                    details: s.name === 'GitHub'
                                                        ? `${s.repos} repos • ${s.top_languages?.join(', ')}`
                                                        : `${s.rank} • ${s.contests} contests`,
                                                }))}
                                                skills={Object.keys(routeData.current_skills || {})}
                                                onComplete={handleIngestionComplete}
                                            />
                                        )}
                                    </motion.div>
                                )}
                                {phase === 'loading' && (
                                    <motion.div
                                        key="loading"
                                        className="absolute inset-0 flex items-center justify-center bg-slate-50 z-20"
                                    >
                                        <div className="text-accent-red flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">
                                            <span className="w-4 h-4 rounded-full border-2 border-accent-red border-t-transparent animate-spin"></span>
                                            Calibrating GPS...
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Bottom Sequence: Skills Graph, Subway Map & Skill Evolution */}
                {phase === 'navigating' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex flex-col min-h-[400px]">
                            <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-900" /> Capabilities & Gaps Mapping
                            </h2>
                            <div className="flex-1 bg-white shadow-sm rounded-xl border border-slate-200 hover-red-outline transition-colors relative overflow-hidden flex flex-col group min-h-[500px]">
                                <div className="absolute top-4 left-4 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <div className="flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-sm">
                                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400"></span> Shared / Multi-Verified</div>
                                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Single Source</div>
                                    </div>
                                </div>
                                {graphData?.graph_intersections && Object.keys(graphData.graph_intersections).length > 0 ? (
                                    <MultiSourceVennDiagram persona={persona} graphData={graphData} />
                                ) : (
                                    <CandidateSkillDAG persona={persona} routeData={routeData} />
                                )}
                            </div>
                        </div>

                        {/* 1. Subway Map: How do we get there? (Persona pre-baked routes) */}
                        <SubwayMap
                            routes={routeData.routes || []}
                            activeRouteId={activeRouteId}
                            onRouteSelect={setActiveRouteId}
                            startLabel="Current Skills"
                            endLabel={routeData.target_role}
                        />

                        {/* 2. Route Details & Gap Analysis */}
                        {activeRoute && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                                <RouteTimeline route={activeRoute} />
                                <GapAnalysisPanel gaps={gapItems || undefined} />
                            </div>
                        )}

                        {/* 3. Alternatives */}
                        {routeData.alternatives && routeData.alternatives.length > 0 && (
                            <div className="mt-4">
                                <AlternativeDestinations alternatives={routeData.alternatives} personaId={persona_id!} />
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
