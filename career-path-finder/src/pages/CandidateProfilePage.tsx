import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Target, Activity, BookOpen, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import MultiSourceVennDiagram from '../components/MultiSourceVennDiagram';
import VerificationTraceModal from '../components/VerificationTraceModal';
import { getProfile } from '../services/api';

export default function CandidateProfilePage() {
    const { candidateName } = useParams<{ candidateName: string }>();
    const navigate = useNavigate();

    const [persona, setPersona] = useState<any>(null);
    const [graphData, setGraphData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isTraceOpen, setIsTraceOpen] = useState(false);
    const [traceSkill, setTraceSkill] = useState('');

    // New Goal Input State
    const [targetRole, setTargetRole] = useState('');
    const [targetCompany, setTargetCompany] = useState('');

    const idToUse = candidateName || 'alex';

    // Fetch the newly built persona and graph data from the backend
    useEffect(() => {
        setIsLoading(true);
        // Note: in a real app, you'd fetch the specific user by ID. We hit the profile endpoint.
        getProfile(idToUse)
            .then(graph => {
                if (graph) {
                    setGraphData(graph);
                    // Mock persona data based on the route or backend response
                    setPersona({
                        name: graph.persona_info?.name || idToUse.charAt(0).toUpperCase() + idToUse.slice(1),
                        headline: graph.persona_info?.headline || "Software Engineer",
                        school: graph.persona_info?.school || "",
                        year: graph.persona_info?.year || ""
                    });
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load persona metadata:', err);
                setIsLoading(false);
            });
    }, [idToUse]);

    const handleNavigate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetRole.trim()) return;

        // In a real app, you'd POST this goal to the backend to generate the route map.
        // For the demo, we transition them to the Navigator Dashboard which loads the mock routes.
        const queryParams = new URLSearchParams({
            role: targetRole,
            company: targetCompany
        }).toString();

        navigate(`/navigate/${idToUse}?${queryParams}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="text-accent-red flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">
                    <span className="w-4 h-4 rounded-full border-2 border-accent-red border-t-transparent animate-spin"></span>
                    Loading spArc Profile...
                </div>
            </div>
        );
    }

    if (!graphData) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <p className="text-slate-500 font-mono mb-4">No active profile found for {idToUse}.</p>
                <button onClick={() => navigate('/build')} className="px-4 py-2 bg-slate-900 text-white rounded-lg">Build Profile</button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 h-full max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-12">

            {/* Header */}
            <div className="flex flex-col justify-between items-start gap-4 shrink-0 mt-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-accent-red text-white flex items-center justify-center text-xl shadow-sm">
                            {persona?.name?.charAt(0) || 'A'}
                        </div>
                        {persona?.name}'s spArc Profile
                    </h1>
                    <p className="text-slate-500 font-mono text-sm tracking-wide font-medium flex items-center gap-2 ml-16">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        {persona?.headline} • {persona?.school}
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Graph Column (Takes up 2/3 space) */}
                <div className="lg:col-span-2 flex flex-col min-h-[500px]">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-900" /> Current Capabilities Extracted
                    </h2>
                    <div className="flex-1 bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-col group">
                        <div className="absolute top-4 left-4 z-10">
                            <div className="flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-sm">
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400"></span> Multi-Verified Skill </div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Unverified Node</div>
                            </div>
                        </div>
                        <MultiSourceVennDiagram persona={persona} graphData={graphData} />
                    </div>
                </div>

                {/* Right Goal Selection Column (Takes 1/3 space) */}
                <div className="flex flex-col gap-6">

                    {/* Top Skills Summary */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-accent-red" /> Top Verified Vectors
                        </h3>
                        <div className="flex flex-col gap-3">
                            {Object.entries(graphData.normalized_scores || {})
                                .sort(([, a]: any, [, b]: any) => b - a)
                                .slice(0, 5) // Show top 5
                                .map(([skill, score]: [string, any]) => {
                                    const sources = graphData.graph_intersections?.[skill] || [];
                                    const isTraceable = skill === 'Deterministic Eval Frameworks';
                                    return (
                                        <div 
                                            key={skill} 
                                            onClick={() => {
                                                if (isTraceable) {
                                                    setTraceSkill(skill);
                                                    setIsTraceOpen(true);
                                                }
                                            }}
                                            className={`flex flex-col gap-1.5 p-3 rounded-xl border ${isTraceable ? 'bg-green-50/50 border-green-200 cursor-pointer hover:shadow-md transition-all hover:border-green-400 group/trace' : 'bg-slate-50 border-slate-100'}`}
                                        >
                                            <div className="flex justify-between items-center text-sm">
                                                <span className={`font-bold ${isTraceable ? 'text-green-900 group-hover/trace:text-green-700' : 'text-slate-700'}`}>
                                                    {skill}
                                                    {isTraceable && <ShieldCheck className="w-3 h-3 inline ml-1 text-green-500" />}
                                                </span>
                                                <span className={`font-mono text-xs font-bold ${isTraceable ? 'text-green-600' : 'text-accent-red'}`}>{(score * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                                <div className={`h-full ${isTraceable ? 'bg-green-500' : 'bg-accent-red'}`} style={{ width: `${score * 100}%` }}></div>
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                {sources.slice(0, 3).map((s: string) => (
                                                    <span key={s} className="text-[8px] px-1.5 py-0.5 border border-slate-200 rounded bg-white font-mono uppercase text-slate-500 tracking-wider flex-shrink-0">
                                                        {s}
                                                    </span>
                                                ))}
                                                {sources.length > 3 && <span className="text-[8px] text-slate-400">+{sources.length - 3}</span>}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>

                    {/* Set Destination Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden"
                    >
                        {/* Decorative background tape */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent-red via-accent-blue to-accent-purple"></div>

                        <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                            <Target className="w-5 h-5 text-accent-red" /> Set Destination
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Where do you want to go next? Enter a target role to map the optimal skill routes.
                        </p>

                        <form onSubmit={handleNavigate} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500">Target Role</label>
                                <input
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    placeholder="e.g. Machine Learning Engineer"
                                    className="w-full bg-slate-800 border-none text-white px-4 py-3 rounded-xl focus:ring-1 focus:ring-accent-red outline-none placeholder:text-slate-600 font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500">Target Company (Optional)</label>
                                <input
                                    type="text"
                                    value={targetCompany}
                                    onChange={(e) => setTargetCompany(e.target.value)}
                                    placeholder="e.g. Anthropic"
                                    className="w-full bg-slate-800 border-none text-white px-4 py-3 rounded-xl focus:ring-1 focus:ring-accent-red outline-none placeholder:text-slate-600 font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!targetRole.trim()}
                                className="mt-2 w-full px-4 py-3 bg-accent-red hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md group"
                            >
                                Calculate Route <MapPin className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </motion.div>

                </div>
            </div>

            {/* The Verification Trace Modal for Drill-Down Demo */}
            <VerificationTraceModal 
                isOpen={isTraceOpen} 
                onClose={() => setIsTraceOpen(false)} 
                skillName={traceSkill} 
                candidateName={persona?.name || 'Candidate'} 
            />
        </div>
    );
}
