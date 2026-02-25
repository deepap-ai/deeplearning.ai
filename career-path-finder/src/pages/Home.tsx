import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, ChevronRight, GraduationCap, Code2, ShieldCheck, Microscope, Database, Beaker } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white">

            {/* Background Graphic elements to make it feel bright and clinical */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-slate-200 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-red-100 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">

                {/* Hero Section */}
                <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[10px] tracking-[0.2em] font-bold uppercase mb-8 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse"></span> Arc.ai Engine v2.0
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 mb-6">
                        Find your Arc <br className="hidden md:block" />
                        <span className="text-accent-red">to Possibilities.</span>
                    </h1>
                    <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        Track your skills. Track the market. We will match the rest.
                    </p>
                </div>

                {/* The "Who are you?" Modal */}
                <div className="glass-panel w-full max-w-3xl rounded-2xl p-8 border border-slate-200 shadow-xl animate-in zoom-in-95 duration-500 delay-200">
                    <h2 className="text-center text-sm font-mono text-slate-500 tracking-widest uppercase font-bold mb-8">Who are you?</h2>

                    <div className="flex flex-col md:flex-row gap-6">

                        {/* Button A: Individual */}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 flex flex-col items-start p-6 rounded-xl border border-slate-200 hover-red-outline bg-white transition-all group text-left relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-3 bg-slate-50 rounded-lg mb-4 text-slate-600 group-hover:text-accent-red group-hover:bg-red-50 group-hover:scale-110 transition-all border border-slate-200 shadow-sm relative z-10">
                                <User className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight relative z-10">Individual</h3>
                            <p className="text-sm text-slate-500 font-medium h-10 relative z-10">Discover your Arc and navigate the frontier.</p>

                            <div className="mt-6 flex items-center gap-2 text-xs font-mono font-bold text-accent-red uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 relative z-10">
                                Launch ArcProfile <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>

                        {/* Button B: Organization */}
                        <div className={`flex-1 flex flex-col items-start p-6 rounded-xl border transition-all group text-left relative overflow-hidden shadow-sm ${expanded ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200 hover-red-outline cursor-pointer'}`}
                            onClick={!expanded ? () => setExpanded(true) : undefined}
                        >
                            <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {!expanded ? (
                                // Collapsed State
                                <>
                                    <div className="p-3 bg-slate-50 rounded-lg mb-4 text-slate-600 group-hover:text-accent-red group-hover:bg-red-50 group-hover:scale-110 transition-all border border-slate-200 shadow-sm relative z-10">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight relative z-10">Organization</h3>
                                    <p className="text-sm text-slate-500 font-medium h-10 relative z-10">Define roles and identify verified talent.</p>

                                    <div className="mt-6 flex items-center gap-2 text-xs font-mono font-bold text-accent-red uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 relative z-10">
                                        Select Org Type <ChevronRight className="w-4 h-4" />
                                    </div>
                                </>
                            ) : (
                                // Expanded State (Grid Selection)
                                <div className="w-full flex flex-col h-full animate-in fade-in duration-300 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Organization Type</h3>
                                        <button onClick={(e) => { e.stopPropagation(); setExpanded(false); }} className="text-[10px] font-mono text-slate-500 hover:text-accent-red uppercase tracking-widest transition-colors border border-slate-200 px-2 py-1 rounded bg-white">Back</button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        <button onClick={() => navigate('/org')} className="p-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-accent-red rounded-lg flex flex-col items-center gap-2 text-center transition-colors shadow-sm group/item">
                                            <Building2 className="w-5 h-5 text-slate-500 group-hover/item:text-accent-red" />
                                            <span className="text-[11px] font-medium text-slate-700 group-hover/item:text-accent-red">Company (Hiring)</span>
                                        </button>
                                        <button onClick={() => navigate('/college')} className="p-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-accent-red rounded-lg flex flex-col items-center gap-2 text-center transition-colors shadow-sm group/item">
                                            <GraduationCap className="w-5 h-5 text-slate-500 group-hover/item:text-accent-red" />
                                            <span className="text-[11px] font-medium text-slate-700 group-hover/item:text-accent-red">College / Uni</span>
                                        </button>
                                        <button onClick={() => navigate('/org')} className="p-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-accent-red rounded-lg flex flex-col items-center gap-2 text-center transition-colors shadow-sm group/item">
                                            <Code2 className="w-5 h-5 text-slate-500 group-hover/item:text-accent-red" />
                                            <span className="text-[11px] font-medium text-slate-700 group-hover/item:text-accent-red">Bootcamp / Course</span>
                                        </button>
                                        <button onClick={() => navigate('/org')} className="p-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-accent-red rounded-lg flex flex-col items-center gap-2 text-center transition-colors shadow-sm group/item">
                                            <ShieldCheck className="w-5 h-5 text-slate-500 group-hover/item:text-accent-red" />
                                            <span className="text-[11px] font-medium text-slate-700 group-hover/item:text-accent-red">Credentialing</span>
                                        </button>
                                        <button onClick={() => navigate('/org')} className="p-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-accent-red rounded-lg flex flex-col items-center gap-2 text-center transition-colors shadow-sm group/item">
                                            <Microscope className="w-5 h-5 text-slate-500 group-hover/item:text-accent-red" />
                                            <span className="text-[11px] font-medium text-slate-700 group-hover/item:text-accent-red">Research Lab</span>
                                        </button>
                                        <button onClick={() => navigate('/org')} className="p-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-accent-red rounded-lg flex flex-col items-center gap-2 text-center transition-colors shadow-sm group/item">
                                            <Database className="w-5 h-5 text-slate-500 group-hover/item:text-accent-red" />
                                            <span className="text-[11px] font-medium text-slate-700 group-hover/item:text-accent-red">Test Provider</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
