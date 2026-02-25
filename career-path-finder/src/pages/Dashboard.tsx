import React from 'react';
import SkillGraphVisualizer from '../components/SkillGraphVisualizer';
import MissionControlTerminal from '../components/MissionControlTerminal';
import { ShieldCheck, Activity, Target, Zap, GitMerge, Code2, Linkedin, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700 h-full max-w-[1600px] mx-auto">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-3">
                        Alex Chen's Arc<span className="text-accent-red">Profile</span>
                    </h1>
                    <p className="text-slate-500 font-mono text-xs tracking-wide font-medium">
                        The Presence View: Mapping individual capabilities to the global frontier.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-accent-green/30 text-accent-green text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm">
                    <ShieldCheck className="w-4 h-4" /> Verified by Presence Validator
                </div>
            </div>

            {/* Main 3-Column Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

                {/* Left Panel: Data Ingestion (Span 1) */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                        <Zap className="w-4 h-4 text-accent-red" /> Data Ingestion
                    </h2>

                    <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 flex flex-col gap-5">

                        {/* GitHub Sync */}
                        <div className="group hover-red-outline p-2 -m-2 rounded-lg transition-all cursor-pointer">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-accent-red transition-colors">
                                    <GitMerge className="w-4 h-4 text-slate-400 group-hover:text-accent-red" /> GitHub
                                    <span className="text-[9px] bg-green-50 border border-accent-green/20 text-accent-green px-1.5 py-0.5 rounded ml-1">Live</span>
                                </div>
                                <span className="text-xs font-mono text-slate-500 font-medium">100%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-accent-green w-full"></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 font-mono">52 Repositories vectorized.</p>
                        </div>

                        {/* HackerRank Sync */}
                        <div className="group hover-red-outline p-2 -m-2 rounded-lg transition-all cursor-pointer">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-accent-red transition-colors">
                                    <Code2 className="w-4 h-4 text-slate-400 group-hover:text-accent-red" /> HackerRank
                                    <span className="text-[9px] bg-blue-50 border border-accent-blue/20 text-accent-blue px-1.5 py-0.5 rounded ml-1">Syncing</span>
                                </div>
                                <span className="text-xs font-mono text-slate-500 font-medium">85%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-accent-blue w-[85%] animate-pulse"></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 font-mono">Parsing Algorithm scores...</p>
                        </div>

                        {/* LinkedIn Sync */}
                        <div className="group hover-red-outline p-2 -m-2 rounded-lg transition-all cursor-pointer">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-accent-red transition-colors">
                                    <Linkedin className="w-4 h-4 text-slate-400 group-hover:text-accent-red" /> LinkedIn
                                    <span className="text-[9px] bg-slate-100 border border-slate-300 text-slate-600 px-1.5 py-0.5 rounded ml-1">Cached</span>
                                </div>
                                <span className="text-xs font-mono text-slate-500 font-medium">100%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-400 w-full"></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 font-mono">Profile schema matched last sync.</p>
                        </div>
                    </div>

                    {/* Mission Control integrated into left panel for individual view */}
                    <div className="flex-1 min-h-[250px] bg-slate-900 shadow-sm rounded-xl border border-slate-800 overflow-hidden relative flex flex-col group">
                        <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 text-[10px] font-mono text-slate-400 tracking-widest uppercase font-bold flex justify-between items-center z-10">
                            <span>Mission Control</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse shadow-[0_0_5px_var(--color-accent-red)]"></span>
                        </div>
                        <div className="flex-1 relative">
                            <MissionControlTerminal />
                        </div>
                    </div>

                </div>

                {/* Center Panel: The ArcProfile Graph (Span 2) */}
                <div className="lg:col-span-2 flex flex-col min-h-[500px]">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-900" /> ArcProfile Visualization
                    </h2>
                    <div className="flex-1 bg-white shadow-sm rounded-xl border border-slate-200 hover-red-outline transition-colors relative overflow-hidden flex flex-col group">
                        <div className="absolute top-4 left-4 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-sm">
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-blue"></span> Technical / Execution</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-green"></span> Data Science / Logic</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-purple"></span> Design / Product</div>
                            </div>
                        </div>
                        <SkillGraphVisualizer />
                    </div>
                </div>

                {/* Right Panel: Resonance Matches (Span 1) */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent-red" /> Resonance Matches
                    </h2>

                    <div className="flex flex-col gap-3">
                        {[
                            { co: 'SpaceX', role: 'Avionics Tooling Eng.', match: 96, glow: 'accent-green' },
                            { co: 'OpenAI', role: 'Staff ML Infrastructure', match: 91, glow: 'accent-blue' },
                            { co: 'Stripe', role: 'Backend Data Systems', match: 88, glow: 'slate-500' },
                            { co: 'Anthropic', role: 'Alignment Researcher', match: 82, glow: 'accent-purple' },
                        ].map((match, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 hover-red-outline transition-all cursor-pointer group shadow-sm flex flex-col h-[88px] justify-center">

                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-accent-red transition-colors">{match.co}</h3>
                                    <div className={`px-2 py-0.5 bg-${match.glow}/10 border border-${match.glow}/20 text-${match.glow} rounded text-[10px] font-mono font-bold flex items-center gap-1`}>
                                        <CheckCircle2 className="w-3 h-3" /> {match.match}%
                                    </div>
                                </div>

                                <p className="text-xs text-slate-600 font-medium relative z-10">{match.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
