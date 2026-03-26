import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import JobSkillDAG from '../components/JobSkillDAG';
import CandidateModal from '../components/CandidateModal';
import type { CandidateProfile } from '../components/CandidateModal';
import fallbackJD from '../data/ideal_jd_vector.json';
import { Activity, Share2, Download, FileText, Users, TrendingUp } from 'lucide-react';

const CANDIDATE_STYLES: Record<string, { bar: string; avatarBg: string; avatarBorder: string; iconText: string; badgeText: string; badgeBg: string; badgeBorder: string }> = {
    'accent-green': {
        bar: 'bg-accent-green', avatarBg: 'bg-green-50', avatarBorder: 'border-accent-green/30',
        iconText: 'text-accent-green', badgeText: 'text-accent-green', badgeBg: 'bg-green-50', badgeBorder: 'border-accent-green/20',
    },
    'accent-blue': {
        bar: 'bg-accent-blue', avatarBg: 'bg-blue-50', avatarBorder: 'border-accent-blue/30',
        iconText: 'text-accent-blue', badgeText: 'text-accent-blue', badgeBg: 'bg-blue-50', badgeBorder: 'border-accent-blue/20',
    },
    'accent-purple': {
        bar: 'bg-accent-purple', avatarBg: 'bg-purple-50', avatarBorder: 'border-accent-purple/30',
        iconText: 'text-accent-purple', badgeText: 'text-accent-purple', badgeBg: 'bg-purple-50', badgeBorder: 'border-accent-purple/20',
    },
};



// Candidates dynamically loaded from API

export default function OrgDashboard() {
    const { company_id } = useParams();
    const [companyInfo, setCompanyInfo] = useState({ name: "OpenAI", rolesCount: 24, industry: "Artificial Intelligence" });
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
    const [candidates, setCandidates] = useState<CandidateProfile[]>([]);

    useEffect(() => {
        // Fetch all companies to find the requested one
        fetch('https://career-path-finder-ylyc.onrender.com/api/companies')
            .then(res => res.json())
            .then(data => {
                const targetCompany = data.find((c: any) => c.company_id === company_id) || data[0]; // fallback to first
                if (targetCompany) {
                    setCompanyInfo({
                        name: targetCompany.name,
                        rolesCount: targetCompany.open_roles?.length || 0,
                        industry: targetCompany.industry || "Technology Sector"
                    });
                }
            })
            .catch(err => console.error("Failed to fetch companies:", err));

        // Fetch candidates for Top Matched Candidates section
        fetch('https://career-path-finder-ylyc.onrender.com/api/candidates')
            .then(res => res.json())
            .then(data => {
                const mapped = data.map((c: any, index: number) => {
                    const outlines = ['accent-green', 'accent-blue', 'accent-purple'];
                    const roles = ['Staff ML Infrastructure', 'Alignment Researcher', 'Backend Data Systems'];

                    const sv: Record<string, number> = {};
                    if (c.verified_skill_vector) {
                        Object.keys(c.verified_skill_vector).forEach(k => {
                            sv[k] = c.verified_skill_vector[k].intensity || 0.5;
                        });
                    }

                    return {
                        name: c.name || "Unknown User",
                        role: roles[index % roles.length], // mock specific targeted role 
                        match: 80 + Math.floor(Math.random() * 15), // mock match score 80-95
                        outline: outlines[index % outlines.length],
                        email: `${c.user_id}@example.com`,
                        github: c.user_id,
                        skillVector: sv
                    };
                });

                // Sort by highest match
                const sorted = mapped.sort((a: any, b: any) => b.match - a.match).slice(0, 5);
                setCandidates(sorted);
            })
            .catch(err => console.error("Failed to fetch candidates:", err));
    }, [company_id]);



    return (
        <div className="flex flex-col gap-6 h-full max-w-[1600px] mx-auto">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-3">
                        {companyInfo.name} <span className="text-accent-red">spArc Profile</span>
                    </h1>
                    <p className="text-slate-500 font-mono text-xs tracking-wide font-medium">
                        The Demand View: Aggregating {companyInfo.industry} open requisitions to map organizational skill topography.
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

                {/* Left Panel: Job Listings (Span 1) */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent-red" /> Open Requisitions
                    </h2>

                    <div className="flex flex-col gap-3">
                        {/* Sample Job 1 */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 hover-red-outline cursor-pointer transition-colors group">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-accent-red transition-colors">Senior AI Agent Architect</h3>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">San Francisco, CA • Hybrid</p>
                            <div className="flex gap-2 mt-3">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">Python</span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">Multi-Agent Systems</span>
                            </div>
                        </div>

                        {/* Sample Job 2 */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 hover-red-outline cursor-pointer transition-colors group">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-accent-red transition-colors">Staff ML Infrastructure</h3>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">Remote • US</p>
                            <div className="flex gap-2 mt-3">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">C++</span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">Backend Architecture</span>
                            </div>
                        </div>

                        {/* Sample Job 3 */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 hover-red-outline cursor-pointer transition-colors group">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-accent-red transition-colors">Alignment Researcher</h3>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">San Francisco, CA • On-site</p>
                            <div className="flex gap-2 mt-3">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">Reinforcement Learning</span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">Systems Thinking</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Panel: The Arc Profile Graph (Span 2) */}
                <div className="lg:col-span-2 flex flex-col min-h-[500px]">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-900" /> spArc Profile Graph
                    </h2>
                    <div className="flex-1 bg-white shadow-sm rounded-xl border border-slate-200 hover-red-outline relative overflow-hidden flex flex-col group transition-colors">
                        <div className="absolute top-4 left-4 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-sm">
                                <div className="text-xs text-slate-900 mb-1">Open Roles: <span className="text-accent-red">{companyInfo.rolesCount}</span></div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-blue"></span> Core Infrastructure</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-green"></span> Research / Alignment</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-purple"></span> Product Engineering</div>
                            </div>
                        </div>
                        {/* The JobSkillDAG */}
                        <div className="absolute inset-0 saturate-150">
                            <JobSkillDAG />
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

                        {candidates.map((match, i) => {
                            const cs = CANDIDATE_STYLES[match.outline] || CANDIDATE_STYLES['accent-green'];
                            return (
                                <div key={i} onClick={() => setSelectedCandidate(match)} className="bg-white shadow-sm p-3 rounded-xl border border-slate-200 hover-red-outline transition-all cursor-pointer group flex items-center gap-3 relative overflow-hidden">

                                    <div className={`absolute top-0 right-0 bottom-0 w-1 ${cs.bar} rounded-r-xl opacity-50`}></div>

                                    <div className={`w-8 h-8 rounded-full ${cs.avatarBg} border ${cs.avatarBorder} flex items-center justify-center shrink-0 group-hover:border-accent-red transition-colors`}>
                                        <Users className={`w-4 h-4 ${cs.iconText} group-hover:text-accent-red transition-colors`} />
                                    </div>

                                    <div className="flex-1 relative z-10">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-accent-red transition-colors">{match.name}</h3>
                                            <div className={`${cs.badgeText} ${cs.badgeBg} border ${cs.badgeBorder} px-1 py-0.5 rounded font-mono font-bold text-[9px]`}>{match.match}% Match</div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium">{match.role}</p>
                                    </div>
                                </div>
                            );
                        })}

                        <button className="w-full mt-2 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider hover-red-outline hover:text-accent-red transition-colors shadow-sm">
                            View Full Pipeline
                        </button>
                    </div>
                </div>

            </div>

            <AnimatePresence>
                {selectedCandidate && (
                    <CandidateModal
                        candidate={selectedCandidate}
                        jdVector={fallbackJD}
                        onClose={() => setSelectedCandidate(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
