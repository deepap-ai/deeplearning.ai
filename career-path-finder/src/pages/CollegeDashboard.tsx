import React, { useState } from 'react';
import SkillGraphVisualizer from '../components/SkillGraphVisualizer';
import MissionControlTerminal from '../components/MissionControlTerminal';
import { GraduationCap, Activity, FileText, UploadCloud, Link, BookOpen, Compass, Trophy, Users, DollarSign, Building2, MousePointerClick } from 'lucide-react';

export default function CollegeDashboard() {
    const [parsing, setParsing] = useState(false);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700 h-full max-w-[1600px] mx-auto">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-3">
                        MIT <span className="text-accent-red">Curriculum Vector</span>
                    </h1>
                    <p className="text-slate-500 font-mono text-xs tracking-wide font-medium">
                        Massachusetts Institute of Technology • Cambridge, MA • Private University
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-sm flex items-center gap-2 shadow-sm">
                        <Trophy className="w-4 h-4 text-accent-red" /> Rank: #1
                    </div>
                </div>
            </div>

            {/* Main 3-Column Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

                {/* Left Panel: Catalog Ingestion & Planner (Span 1) */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-accent-red" /> Catalog Ingestion
                    </h2>

                    <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 flex flex-col gap-4">
                        <p className="text-xs text-slate-500 font-medium">Upload syllabi or catalog links. The Agentic Planner will map course outcomes to the global skill graph.</p>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Course Catalog URL</label>
                            <div className="flex group focus-within:border-accent-red transition-colors">
                                <div className="bg-slate-50 border border-r-0 border-slate-200 group-focus-within:border-accent-red rounded-l-lg px-3 py-2 flex items-center justify-center transition-colors">
                                    <Link className="w-4 h-4 text-slate-400 group-focus-within:text-accent-red" />
                                </div>
                                <input type="text" placeholder="http://catalog.mit.edu/..." className="bg-white border border-slate-200 group-focus-within:border-accent-red rounded-r-lg px-3 py-2 text-xs text-slate-900 w-full outline-none transition-colors" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-2">
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">OR</span>
                            <div className="flex-1 h-px bg-slate-200"></div>
                        </div>

                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover-red-outline hover:bg-red-50 transition-all cursor-pointer group bg-slate-50 relative overflow-hidden">
                            <div className="p-3 bg-white rounded-full text-slate-400 border border-slate-200 group-hover:text-accent-red group-hover:border-accent-red group-hover:scale-110 transition-all shadow-sm relative z-10">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <div className="text-center relative z-10">
                                <p className="text-sm font-bold text-slate-700 group-hover:text-accent-red mb-1 transition-colors">Upload Syllabi PDF</p>
                                <p className="text-[10px] text-slate-500 font-mono">Course 6 (EECS) 2024-2025</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setParsing(true)}
                            className="w-full mt-2 py-2 rounded-lg bg-white border-red-outline text-accent-red hover:bg-red-50 hover:text-red-700 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            {parsing ? <><span className="w-2 h-2 rounded-full bg-accent-red animate-ping"></span> Parsing Catalog...</> : <><MousePointerClick className="w-4 h-4" /> Run Agentic Planner</>}
                        </button>
                    </div>

                    {/* Mission Control integrated for parsing view */}
                    <div className="flex-1 min-h-[250px] bg-slate-900 shadow-sm rounded-xl border border-slate-800 overflow-hidden relative flex flex-col group">
                        <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 text-[10px] font-mono text-slate-400 tracking-widest uppercase font-bold flex justify-between items-center z-10">
                            <span>Agentic Planner Log</span>
                            <span className={`w-1.5 h-1.5 rounded-full bg-accent-red shadow-[0_0_5px_var(--color-accent-red)] ${parsing ? 'animate-pulse' : ''}`}></span>
                        </div>
                        <div className="flex-1 relative">
                            <MissionControlTerminal />
                        </div>
                    </div>

                </div>

                {/* Center Panel: The Curriculum Coverage Graph (Span 2) */}
                <div className="lg:col-span-2 flex flex-col min-h-[500px]">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-900" /> Curriculum Coverage Graph
                    </h2>
                    <div className="flex-1 bg-white shadow-sm rounded-xl border border-slate-200 hover-red-outline relative overflow-hidden flex flex-col group transition-colors">
                        <div className="absolute top-4 left-4 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-sm">
                                <div className="text-xs text-slate-900 mb-1">Parsed Courses: <span className="text-accent-red">142</span></div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-blue"></span> EECS Base</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-green"></span> AI / Decision Making</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-purple"></span> Physics / Math</div>
                            </div>
                        </div>
                        {/* The light-mode Visualizer mapping curriculum */}
                        <div className="absolute inset-0 saturate-150">
                            <SkillGraphVisualizer rootNodeId="MIT" />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Institution Meta Data (Span 1) */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                        <Compass className="w-4 h-4 text-accent-red" /> Institution Meta Data
                    </h2>

                    <div className="flex flex-col gap-3">

                        {/* General & Admissions */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Admissions</h3>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium flex items-center gap-2"><Users className="w-3.5 h-3.5 text-slate-400" /> Acceptance Rate</span>
                                <span className="text-sm font-bold text-slate-900">4.5%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-400" /> Median SAT</span>
                                <span className="text-sm font-bold text-slate-900">1550</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Yield Rate</span>
                                <span className="text-sm font-bold text-slate-900">86%</span>
                            </div>
                        </div>

                        {/* Demographics & Academics */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Demographics</h3>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Total Students</span>
                                <span className="text-sm font-bold text-slate-900">11,706</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Undergraduates</span>
                                <span className="text-sm font-bold text-slate-900">4,543</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Student:Faculty</span>
                                <span className="text-sm font-bold text-slate-900">3:1</span>
                            </div>
                        </div>

                        {/* Financials & Outcomes */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Outcomes</h3>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-slate-400" /> Tuition</span>
                                <span className="text-sm font-bold text-slate-900">$64,310</span>
                            </div>
                            <div className="flex justify-between items-center text-accent-green">
                                <span className="text-xs font-bold flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> Median Earnings</span>
                                <span className="text-sm font-bold">$129,392</span>
                            </div>
                        </div>

                        {/* Top Majors */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 hover-red-outline transition-colors group cursor-pointer">
                            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">Top Majors Taught</h3>

                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent-blue"></span> Engineering</span>
                                        <span className="font-mono text-slate-500">33%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full"><div className="h-full bg-accent-blue rounded-full w-[33%]"></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span> Comp Sci / AI</span>
                                        <span className="font-mono text-slate-500">31%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full"><div className="h-full bg-accent-green rounded-full w-[31%]"></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent-purple"></span> Mathematics</span>
                                        <span className="font-mono text-slate-500">14%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full"><div className="h-full bg-accent-purple rounded-full w-[14%]"></div></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
