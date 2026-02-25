import React from 'react';
import SkillGraphVisualizer from '../components/SkillGraphVisualizer';
import MissionControlTerminal from '../components/MissionControlTerminal';
import { Activity, Share2, Download, ShieldCheck, FileText, Link, UploadCloud, Users, TrendingUp } from 'lucide-react';

export default function OrgDashboard() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700 h-full max-w-[1600px] mx-auto">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-3">
                        OpenAI <span className="text-accent-red">Demand Vector</span>
                    </h1>
                    <p className="text-slate-500 font-mono text-xs tracking-wide font-medium">
                        The Demand View: Aggregating open requisitions to map organizational skill topography.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover-red-outline text-slate-600 font-bold text-sm flex items-center gap-2 transition-colors shadow-sm">
                        <Share2 className="w-4 h-4" /> Share Map
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-red-50 border-red-outline text-accent-red hover:bg-red-100 font-bold text-sm flex items-center gap-2 transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Export Requirements
                    </button>
                </div>
            </div>

            {/* Main 3-Column Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

                {/* Left Panel: JD Ingestion (Span 1) */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent-red" /> JD Ingestion
                    </h2>

                    <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 flex flex-col gap-4">
                        <p className="text-xs text-slate-500 font-medium">Target a Role or Vector space to update the Collective Demand Graph.</p>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ATS Integration Link</label>
                            <div className="flex group focus-within:border-accent-red transition-colors">
                                <div className="bg-slate-50 border border-r-0 border-slate-200 group-focus-within:border-accent-red rounded-l-lg px-3 py-2 flex items-center justify-center transition-colors">
                                    <Link className="w-4 h-4 text-slate-400 group-focus-within:text-accent-red" />
                                </div>
                                <input type="text" placeholder="Greenhouse/Lever URL..." className="bg-white border border-slate-200 group-focus-within:border-accent-red rounded-r-lg px-3 py-2 text-xs text-slate-900 w-full outline-none transition-colors" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-2">
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">OR</span>
                            <div className="flex-1 h-px bg-slate-200"></div>
                        </div>

                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover-red-outline hover:bg-red-50 transition-all cursor-pointer group bg-slate-50">
                            <div className="p-3 bg-white rounded-full text-slate-400 border border-slate-200 group-hover:text-accent-red group-hover:border-accent-red group-hover:scale-110 transition-all shadow-sm">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-700 group-hover:text-accent-red mb-1 transition-colors">Upload Raw Text</p>
                                <p className="text-[10px] text-slate-500 font-mono">PDF, TXT, or DOCX</p>
                            </div>
                        </div>

                        <button className="w-full mt-2 py-2 rounded-lg bg-white border-red-outline text-accent-red hover:bg-red-50 hover:text-red-700 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm">
                            Ingest & Map Demand
                        </button>
                    </div>

                    {/* Mission Control integrated for org view */}
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

                {/* Center Panel: The Collective Demand Graph (Span 2) */}
                <div className="lg:col-span-2 flex flex-col min-h-[500px]">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-900" /> Collective Demand Graph
                    </h2>
                    <div className="flex-1 bg-white shadow-sm rounded-xl border border-slate-200 hover-red-outline relative overflow-hidden flex flex-col group transition-colors">
                        <div className="absolute top-4 left-4 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-sm">
                                <div className="text-xs text-slate-900 mb-1">Open Roles: <span className="text-accent-red">24</span></div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-blue"></span> Core Infrastructure</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-green"></span> Research / Alignment</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-purple"></span> Product Engineering</div>
                            </div>
                        </div>
                        {/* The light-mode Visualizer mapping demand */}
                        <div className="absolute inset-0 saturate-150">
                            <SkillGraphVisualizer rootNodeId="Demand Vector" />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Student Outcome Velocity / Talent Resonance (Span 1) */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent-red" /> Talent Resonance
                    </h2>

                    <div className="flex flex-col gap-3">
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 mb-2">
                            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">Pipeline Velocity</h3>
                            <div className="flex items-end justify-between">
                                <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    142 <TrendingUp className="w-5 h-5 text-accent-green" />
                                </div>
                                <div className="text-xs text-slate-500 font-medium">Active High-Resonance Profiles</div>
                            </div>
                        </div>

                        <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-2">Top Matched Candidates</h3>

                        {[
                            { name: 'Alex Chen', role: 'Staff ML Infrastructure', match: 91, outline: 'accent-green', bg: 'green-50' },
                            { name: 'Maya Patel', role: 'Alignment Researcher', match: 88, outline: 'accent-blue', bg: 'blue-50' },
                            { name: 'David Kim', role: 'Backend Data Systems', match: 84, outline: 'accent-purple', bg: 'purple-50' },
                        ].map((match, i) => (
                            <div key={i} className={`bg-white shadow-sm p-3 rounded-xl border border-slate-200 hover-red-outline transition-all cursor-pointer group flex items-center gap-3 relative overflow-hidden`} >

                                <div className={`absolute top-0 right-0 bottom-0 w-1 bg-${match.outline} rounded-r-xl opacity-50`}></div>

                                <div className={`w-8 h-8 rounded-full bg-${match.bg} border border-${match.outline}/30 flex items-center justify-center shrink-0 group-hover:border-accent-red transition-colors`}>
                                    <Users className={`w-4 h-4 text-${match.outline} group-hover:text-accent-red transition-colors`} />
                                </div>

                                <div className="flex-1 relative z-10">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-accent-red transition-colors">{match.name}</h3>
                                        <div className={`text-${match.outline} bg-${match.bg} border border-${match.outline}/20 px-1 py-0.5 rounded font-mono font-bold text-[9px]`}>{match.match}% Match</div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium">{match.role}</p>
                                </div>
                            </div>
                        ))}

                        <button className="w-full mt-2 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider hover-red-outline hover:text-accent-red transition-colors shadow-sm">
                            View Full Pipeline
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
