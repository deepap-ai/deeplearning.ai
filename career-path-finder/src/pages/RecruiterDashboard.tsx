import { useState } from 'react';
import { Search, UserCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import VerificationTraceModal from '../components/VerificationTraceModal';

export default function RecruiterDashboard() {
    const [searchQuery, setSearchQuery] = useState('Agent Architects, 2-3 years, open to SF');
    const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // New state for selected candidate
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [isTraceOpen, setIsTraceOpen] = useState(false);
    const [traceSkill, setTraceSkill] = useState('');

    const [hasSearched, setHasSearched] = useState(false);

    const fetchCandidates = async (query: string = '') => {
        setIsLoading(true);
        try {
            // Note: In MVP, calling the database endpoint running locally
            const res = await fetch(`http://localhost:8000/api/recruit/search?query=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setCandidates(data.results || []);
                if (data.results?.length > 0) {
                    setSelectedCandidateId(data.results[0].user_id);
                }
            }
        } catch (e) {
            console.error('Failed to fetch candidates:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const executeSearch = (query: string) => {
        setHasSearched(true);
        fetchCandidates(query);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        executeSearch(searchQuery);
    };

    // Helper to determine if a skill is "crypto-verified" based on the DB provenance strings
    const checkVerification = (provenance: string) => {
        const strongSignals = ['github', 'hackerrank', 'transcript', 'verified'];
        const provStr = (provenance || '').toLowerCase();
        return strongSignals.some(s => provStr.includes(s));
    };

    // Filter candidates based on the toggle (respecting backend sort order)
    const displayCandidates = [...candidates].filter(c => {
        // If toggle is ON, optionally hide people with 0 verified skills
        if (isVerifiedOnly) {
            const hasVerified = Object.values(c.verified_skill_vector || {}).some((s: any) => checkVerification(s.provenance));
            return hasVerified;
        }
        return true;
    });

    const selectedCandidate = displayCandidates.find(c => c.user_id === selectedCandidateId) || displayCandidates[0];

    const handleSkillClick = (skillName: string, provenance: string) => {
        if (checkVerification(provenance)) {
            setTraceSkill(skillName);
            setIsTraceOpen(true);
        }
    };

    const SAMPLE_QUERIES = [
        "Agent Architects, 2-3 years, open to SF",
        "Biotech data scientist",
        "Top 10 CS, Verified Distributed Systems"
    ];

    return (
        <div className="flex flex-col h-full bg-white font-mono text-slate-900 border-sharp mx-auto shadow-sm max-w-[1400px]">
            {/* Top Minimalist Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-sharp bg-white text-xs tracking-wider">
                <div className="flex items-center gap-2 font-bold">
                    <span className="text-accent-red">spArc AI</span>
                    <span className="text-slate-400">Recruiter Intelligence • Tier-1 Access</span>
                </div>
                <div className="text-slate-500">
                    Active pool: 847 candidates • Updated 4 min ago
                </div>
            </div>

            {/* Search Bar Area */}
            <div className="px-6 py-4 border-b border-sharp bg-slate-50 flex flex-col gap-3">
                <form onSubmit={handleSearch} className="relative w-full max-w-4xl mx-auto">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by role, skills, or natural language..."
                        className="w-full bg-white border border-sharp text-slate-900 px-12 py-3 rounded text-sm focus:ring-1 focus:ring-accent-red outline-none shadow-sm transition-all font-sans focus:border-accent-red"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="absolute inset-y-1.5 right-1.5 px-6 bg-slate-900 hover:bg-black text-white rounded font-bold text-xs transition-colors flex items-center justify-center min-w-[80px]"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                    </button>
                </form>

                {/* Sample Queries */}
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-wide uppercase text-slate-500 mt-1">
                    <span className="mr-2">Powerful Queries:</span>
                    {SAMPLE_QUERIES.map(q => (
                        <button 
                            key={q} 
                            onClick={() => { setSearchQuery(q); executeSearch(q); }} 
                            className="px-3 py-1.5 bg-white border border-sharp rounded hover:border-accent-red hover:text-accent-red transition-all shadow-sm"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {hasSearched ? (
                <div className="flex flex-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Left Column: List */}
                    <div className="w-[380px] border-r border-sharp flex flex-col bg-slate-50 z-10 shrink-0">
                    
                    {/* Search Params Summary */}
                    <div className="p-5 border-b border-sharp bg-white flex flex-col gap-3">
                        <div className="text-sm font-bold tracking-tight text-slate-800 line-clamp-2">
                            "{searchQuery}"
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-xs font-bold pt-3 border-t border-slate-100">
                            <span>Verified skills only</span>
                            <button 
                                onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
                                className={`w-8 h-4 rounded-full transition-colors relative ${isVerifiedOnly ? 'bg-verified' : 'bg-slate-300'}`}
                            >
                                <motion.div 
                                    className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                                    animate={{ x: isVerifiedOnly ? 16 : 0 }}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Candidates Scroll List */}
                    <div className="flex-1 overflow-y-auto w-full p-2 flex flex-col gap-2">
                        {displayCandidates.map((c) => {
                            const isSelected = selectedCandidate?.user_id === c.user_id;
                            const totalSkills = Object.keys(c.verified_skill_vector || {}).length || 1;
                            const verCount = Object.values(c.verified_skill_vector || {}).filter((s: any) => checkVerification(s.provenance)).length;
                            const claimCount = totalSkills - verCount;
                            
                            const verPct = Math.round((verCount / totalSkills) * 100) || 0;
                            const claimPct = Math.round((claimCount / totalSkills) * 100) || 0;

                            return (
                                <div 
                                    key={c.user_id}
                                    onClick={() => setSelectedCandidateId(c.user_id)}
                                    className={`p-4 border-sharp rounded transition-all cursor-pointer flex flex-col gap-3 ${isSelected ? 'bg-white shadow-sm hover-red-outline border-accent-red' : 'bg-white opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="flex flex-col">
                                        <div className="text-sm font-bold">{c.name}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">{c.headline || 'Engineer'}</div>
                                    </div>
                                    
                                    {/* Visual Bars */}
                                    <div className="flex flex-col gap-1.5 text-[10px] font-bold">
                                        <div className="flex items-center gap-2">
                                            <span className="w-16">Verified</span>
                                            <div className="flex-1 h-1.5 bg-slate-100">
                                                <div className="h-full bg-verified" style={{ width: `${verPct}%` }}></div>
                                            </div>
                                            <span className="w-8 text-right">{verPct}%</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-16">Claimed</span>
                                            <div className="flex-1 h-1.5 bg-slate-100">
                                                <div className="h-full bg-claimed" style={{ width: `${claimPct}%` }}></div>
                                            </div>
                                            <span className="w-8 text-right">{claimPct}%</span>
                                        </div>
                                    </div>

                                    {/* Top tags */}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.values(c.verified_skill_vector || {}).slice(0,3).map((s:any) => (
                                            <span key={s.name} className={`text-[9px] px-1.5 py-0.5 rounded ${checkVerification(s.provenance) ? 'bg-green-50 text-verified' : 'bg-orange-50 text-claimed'}`}>
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Right Column: Detail View */}
                <div className="flex-1 overflow-y-auto bg-white p-12 flex flex-col animate-in fade-in duration-500">
                    {selectedCandidate ? (
                        <>
                            {/* Candidate Header */}
                            <div className="flex justify-between items-start mb-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-800 border-sharp border-teal-200 flex items-center justify-center text-xl font-bold">
                                        {selectedCandidate.name?.charAt(0)}{selectedCandidate.name?.split(' ')?.[1]?.charAt(0) || ''}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold font-sans tracking-tight">{selectedCandidate.name}</h2>
                                        <div className="text-sm text-slate-500 mt-1">{selectedCandidate.headline || 'AI Systems · UC Berkeley \'26'}</div>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-teal-50 text-teal-800 font-bold text-sm tracking-wide rounded">
                                    {selectedCandidate.match_score || 94}% match
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-4 gap-4 mb-12 uppercase tracking-widest text-[10px] font-bold pb-8 border-b border-sharp text-slate-500">
                                <div className="flex flex-col gap-2">
                                    VERIFIED SKILLS
                                    <span className="text-4xl text-verified font-sans">
                                        {Object.values(selectedCandidate.verified_skill_vector || {}).filter((s:any) => checkVerification(s.provenance)).length}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    CLAIMED ONLY
                                    <span className="text-4xl text-claimed font-sans">
                                        {Object.values(selectedCandidate.verified_skill_vector || {}).filter((s:any) => !checkVerification(s.provenance)).length}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    SIGNAL QUALITY
                                    <span className="text-4xl text-verified font-sans">{selectedCandidate.signal_quality || 82}%</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    TRUST SCORE
                                    <span className="text-4xl text-slate-900 font-sans">{selectedCandidate.trust_score || 84} / 100</span>
                                </div>
                            </div>

                            {/* Skill Nodes Grid */}
                            <div className="flex flex-col gap-6 mb-16">
                                <div className="flex justify-between items-end">
                                    <div className="text-[10px] tracking-widest uppercase font-bold text-slate-500">
                                        SKILL NODES - CLICK VERIFIED NODE TO INSPECT ARTIFACT
                                    </div>
                                    <div className="flex gap-4 text-[10px] font-bold">
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-verified"></span> Verified</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-claimed"></span> Claimed</span>
                                        <span className="flex items-center gap-1.5 text-slate-400">Not assessed</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-5 gap-0 border-sharp bg-slate-50">
                                    {Object.values(selectedCandidate.verified_skill_vector || {}).map((s:any) => {
                                        const isVer = checkVerification(s.provenance);
                                        return (
                                            <div 
                                                key={s.name} 
                                                onClick={() => handleSkillClick(s.name, s.provenance)}
                                                className={`p-4 border-r border-b border-sharp flex flex-col gap-6 bg-white transition-all ${isVer ? 'cursor-pointer hover:bg-green-50/30' : ''}`}
                                                style={{ minHeight: '160px' }}
                                            >
                                                <div className="font-bold text-[13px] font-sans leading-tight">
                                                    {s.name}
                                                </div>
                                                <div className="mt-auto flex flex-col gap-1 text-[10px] font-bold">
                                                    <span className={`flex items-center gap-1.5 ${isVer ? 'text-verified' : 'text-claimed'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isVer ? 'bg-verified' : 'bg-claimed'}`}></span>
                                                        {isVer ? 'Verified' : 'Claimed'}
                                                    </span>
                                                    <span className="text-slate-500">
                                                        confidence: {Math.round((s.intensity || 0.5) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {/* Mock unassessed nodes for standard layout */}
                                    <div className="p-4 border-r border-b border-sharp flex flex-col gap-6 bg-white/50" style={{ minHeight: '160px' }}>
                                        <div className="font-bold text-[13px] font-sans leading-tight">Distributed Systems</div>
                                        <div className="mt-auto text-[10px] font-bold text-slate-400">Not assessed</div>
                                    </div>
                                    <div className="p-4 border-r border-b border-sharp flex flex-col gap-6 bg-white/50" style={{ minHeight: '160px' }}>
                                        <div className="font-bold text-[13px] font-sans leading-tight">Compilers</div>
                                        <div className="mt-auto text-[10px] font-bold text-slate-400">Not assessed</div>
                                    </div>
                                </div>
                            </div>

                            {/* LinkedIn Section */}
                            <div className="flex flex-col gap-4">
                                <div className="text-[10px] tracking-widest uppercase font-bold text-slate-500 mb-2">
                                    LINKEDIN EQUIVALENT VIEW
                                </div>
                                <div className="text-sm font-sans flex gap-8 font-medium">
                                    <span>React • 3 yrs • ****☆</span>
                                    <span>Python • 4 yrs • *****</span>
                                    <span>ML • 2 yrs • ***☆☆</span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-sans mt-2">
                                    Self-reported. No artifact. No audit trail. No signal.
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            Select a candidate to view deep verification data.
                        </div>
                    )}
                </div>
            </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400">
                    <div className="w-20 h-20 rounded-full bg-slate-100 border border-sharp flex items-center justify-center mb-6 shadow-sm">
                        <UserCheck className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 font-sans mb-2">Awaiting Intelligence Query</h3>
                    <p className="text-sm">Enter a role, specific verifiable skills, or utilize one of our powerful natural-language queries above.</p>
                </div>
            )}
            
            <VerificationTraceModal 
                isOpen={isTraceOpen} 
                onClose={() => setIsTraceOpen(false)} 
                skillName={traceSkill} 
                candidateName={selectedCandidate?.name || 'Candidate'} 
            />
        </div>
    );
}
