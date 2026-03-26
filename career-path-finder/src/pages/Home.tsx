
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, GraduationCap, Briefcase, Compass, User, Building2, Search, Map } from 'lucide-react';

const PERSONA_STYLES: Record<string, { avatarBg: string; avatarBorder: string; avatarText: string }> = {
    'accent-green': { avatarBg: 'bg-accent-green/10', avatarBorder: 'border-accent-green/20', avatarText: 'text-accent-green' },
    'accent-blue': { avatarBg: 'bg-accent-blue/10', avatarBorder: 'border-accent-blue/20', avatarText: 'text-accent-blue' },
};

const initialPersonas = [
    {
        id: 'sophia',
        name: 'Sophia Martinez',
        subtitle: '2nd-Year Biotech, UC Davis',
        goal: 'CVS Pharmacist',
        initials: 'SM',
        color: 'accent-green',
        primary: true,
    },
    {
        id: 'alex',
        name: 'Alex Chen',
        subtitle: '8th Grade Prodigy',
        goal: 'AI-Native Founder by 2034',
        initials: 'AC',
        color: 'accent-blue',
        primary: true,
    },
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white">



            {/* Background blurs */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-slate-200 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-red-100 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-14"
                >
                    <h1 className="text-4xl md:text-6xl text-slate-900 mb-4">
                        Map your strengths. <br className="hidden md:block" /> Design your <strong className="text-accent-red">Arc</strong>.<br className="hidden md:block" /> Build your future.
                    </h1>
                </motion.div>

                {/* Persona Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-4xl"
                >
                    <h2 className="text-center text-sm font-mono text-slate-500 tracking-widest uppercase font-bold mb-8">Select a Journey</h2>

                    {/* Primary Role Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {/* Individual / Candidate Journey */}
                        <motion.button
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            onClick={() => navigate('/build')}
                            className="flex flex-col items-center p-8 rounded-2xl border border-slate-200 bg-white hover-red-outline shadow-sm transition-all group cursor-pointer text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 group-hover:hidden flex flex-col items-center justify-center w-full h-full">
                                <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-accent-red group-hover:border-accent-red group-hover:bg-white transition-all shadow-sm mb-4">
                                    <User className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight transition-colors mb-2">Individual</h3>
                                <p className="text-sm text-slate-500 font-medium">Map your skills and navigate your career trajectory</p>
                            </div>

                            {/* Hover State: Individual Options */}
                            <div className="relative z-10 hidden group-hover:flex flex-col w-full h-full justify-center">
                                <div className="flex flex-col gap-3 w-full">
                                    <div
                                        onClick={(e) => { e.stopPropagation(); navigate('/build'); }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-accent-red hover:shadow-md transition-all text-left"
                                    >
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><User className="w-5 h-5" /></div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">Candidate Dashboard</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-mono">Build Profile</div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={(e) => { e.stopPropagation(); navigate('/recruiter'); }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-accent-red hover:shadow-md transition-all text-left"
                                    >
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><Search className="w-5 h-5" /></div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">Recruiter Dashboard</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-mono">Talent Search</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.button>

                        {/* Organization Journey */}
                        <motion.button
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            onClick={() => navigate('/org')}
                            className="flex flex-col items-center p-8 rounded-2xl border border-slate-200 bg-white hover-red-outline shadow-sm transition-all group cursor-pointer text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 group-hover:hidden flex flex-col items-center justify-center w-full h-full">
                                <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-accent-red group-hover:border-accent-red group-hover:bg-white transition-all shadow-sm mb-4">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight transition-colors mb-2">Organization</h3>
                                <p className="text-sm text-slate-500 font-medium">Find talent, analyze curriculum, or test capabilities</p>
                            </div>

                            {/* Hover State: Organization Options */}
                            <div className="relative z-10 hidden group-hover:flex flex-col w-full h-full h-full justify-center">
                                <div className="flex flex-col gap-3 w-full">
                                    <div
                                        onClick={(e) => { e.stopPropagation(); navigate('/org'); }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-accent-red hover:shadow-md transition-all text-left"
                                    >
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><Briefcase className="w-5 h-5" /></div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">Company Dashboard</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-mono">Recruit Talent</div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={(e) => { e.stopPropagation(); navigate('/college'); }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-accent-red hover:shadow-md transition-all text-left"
                                    >
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><GraduationCap className="w-5 h-5" /></div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">College Dashboard</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-mono">Curriculum Analytics</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    </div>
                    {/* Explore Career Paths — full width card */}
                    <motion.button
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        onClick={() => navigate('/explore')}
                        className="w-full flex items-center gap-6 p-6 rounded-2xl border border-slate-200 bg-white hover-red-outline shadow-sm transition-all group cursor-pointer text-left relative overflow-hidden mb-12"
                    >
                        <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 w-14 h-14 shrink-0 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-accent-red group-hover:border-accent-red group-hover:bg-white transition-all shadow-sm">
                            <Map className="w-7 h-7" />
                        </div>
                        <div className="relative z-10 flex-1">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-accent-red transition-colors mb-1">Explore Career Paths</h3>
                            <p className="text-sm text-slate-500 font-medium">Search 1,775 roles and discover real transition paths backed by 500K+ career trajectories</p>
                        </div>
                        <ChevronRight className="relative z-10 w-5 h-5 text-slate-300 group-hover:text-accent-red transition-colors shrink-0" />
                    </motion.button>

                    <div className="w-full h-px bg-slate-200 mb-12"></div>

                    <h3 className="text-center text-xs font-mono text-slate-400 tracking-widest uppercase font-bold mb-2">Example Journeys</h3>
                    <p className="text-center text-sm text-slate-500 mb-6 max-w-lg mx-auto">
                        This could be any student or job-seeker. Select a persona to see how spArc AI builds their profile.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <AnimatePresence>
                            {initialPersonas.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                                    className={`flex flex-col items-start p-6 rounded-xl border transition-all relative overflow-hidden shadow-sm border-slate-200 hover-red-outline bg-white group cursor-pointer`}
                                    onClick={() => {
                                        if (p.id === 'alex') navigate('/alex');
                                        else if (p.id === 'sophia') navigate('/sophia');
                                        else navigate(`/navigate/${p.id}`);
                                    }}
                                >
                                    <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex items-center gap-4 mb-4 relative z-10 w-full">
                                        {(() => {
                                            const s = PERSONA_STYLES[p.color] || PERSONA_STYLES['accent-blue']; return (
                                                <div className={`w-12 h-12 rounded-full ${s.avatarBg} border ${s.avatarBorder} flex items-center justify-center shrink-0`}>
                                                    <span className={`text-sm font-bold ${s.avatarText}`}>{p.initials}</span>
                                                </div>
                                            );
                                        })()}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-accent-red transition-colors">{p.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{p.subtitle}</p>
                                        </div>
                                    </div>

                                    <div className="relative z-10 mb-4 flex items-center gap-2 text-sm font-medium text-slate-700 w-full">
                                        <Compass className="w-4 h-4 text-accent-red shrink-0" />
                                        <span className="shrink-0">Goal: </span>
                                        <span className="font-bold truncate">{p.goal}</span>
                                    </div>

                                    <div className="mt-auto flex items-center gap-2 text-xs font-mono font-bold text-accent-red uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 relative z-10 w-full">
                                        See Routes <ChevronRight className="w-4 h-4 ml-auto" />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Build Your Own */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                        className="text-center"
                    >
                        <button
                            onClick={() => navigate('/build')}
                            className="text-xs font-mono font-bold text-slate-400 hover:text-accent-red uppercase tracking-widest transition-colors"
                        >
                            Or build your own spArc AI →
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
