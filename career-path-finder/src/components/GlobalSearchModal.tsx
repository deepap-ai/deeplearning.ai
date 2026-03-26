import { useState, useEffect } from 'react';
import { Search, Building2, User, GraduationCap, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import candidatesData from '../data/mock_data/candidates.json';
import companiesData from '../data/mock_data/companies.json';
import collegesData from '../data/mock_data/colleges.json';

interface GlobalSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    // Live Data State
    const [candidates] = useState<any[]>(candidatesData);
    const [companies] = useState<any[]>(companiesData);
    const [colleges] = useState<any[]>(collegesData);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 150);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
        setQuery('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 sm:pt-48 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">

            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">

                {/* Search Input Area */}
                <div className="flex items-center px-4 py-4 border-b border-slate-100 relative group">
                    <Search className="w-6 h-6 text-accent-red group-focus-within:animate-pulse" />
                    <input
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for skills, profiles, or organizations..."
                        className="flex-1 w-full bg-transparent border-none outline-none px-4 text-lg text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    {/* Glowing bottom border effect */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-accent-red to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                </div>

                {/* Results / Navigation Suggestions */}
                <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">

                    {/* Default View (when no query) */}
                    {!query && (
                        <div className="py-2">
                            <h3 className="px-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">Quick Navigation</h3>

                            <button
                                onClick={() => handleNavigation('/navigate/alex')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover-red-outline group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-50 text-accent-red flex items-center justify-center border border-red-100 group-hover:bg-accent-red group-hover:text-white transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-900">My spArc AI</div>
                                        <div className="text-xs text-slate-500 font-medium">View your verified SkillGraph & resonance matches</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent-red transition-colors" />
                            </button>

                            <button
                                onClick={() => handleNavigation('/org')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover-red-outline group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 group-hover:border-accent-red group-hover:text-accent-red transition-colors">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-900">Organization Dashboard</div>
                                        <div className="text-xs text-slate-500 font-medium">Ingest Job Descriptions and view the demand pipeline</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent-red transition-colors" />
                            </button>

                            <button
                                onClick={() => handleNavigation('/college')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover-red-outline group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 group-hover:border-accent-red group-hover:text-accent-red transition-colors">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-900">College Dashboard</div>
                                        <div className="text-xs text-slate-500 font-medium">Analyze curriculum coverage and institution outcomes</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent-red transition-colors" />
                            </button>
                        </div>
                    )}

                    {/* Simulated Search Results (when querying) */}
                    {query && (
                        <div className="py-2">
                            <h3 className="px-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">Live Matches for "{query}"</h3>

                            {isLoading ? (
                                <div className="p-4 text-center text-xs font-mono text-slate-500 animate-pulse">Syncing semantic index...</div>
                            ) : (
                                <>
                                    {/* Candidates */}
                                    {candidates.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || (c.headline && c.headline.toLowerCase().includes(query.toLowerCase()))).map(c => (
                                        <button
                                            key={c.user_id}
                                            onClick={() => handleNavigation(`/navigate/${c.user_id}`)}
                                            className="w-full flex items-center p-3 rounded-xl hover:bg-slate-50 hover-red-outline group transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-accent-red/10 text-accent-red flex items-center justify-center mr-3 shrink-0">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-sm font-bold text-slate-900">{c.name} <span className="text-xs font-mono text-slate-400 font-normal ml-2">Candidate</span></div>
                                                <div className="text-xs text-slate-500 line-clamp-1">{c.headline}</div>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 group-hover:text-accent-red tracking-widest uppercase">View</div>
                                        </button>
                                    ))}

                                    {/* Companies */}
                                    {companies.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || (c.industry && c.industry.toLowerCase().includes(query.toLowerCase()))).map(c => (
                                        <button
                                            key={c.company_id}
                                            onClick={() => handleNavigation(`/org/${c.company_id}`)}
                                            className="w-full flex items-center p-3 rounded-xl hover:bg-slate-50 hover-red-outline group transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center mr-3 shrink-0">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-sm font-bold text-slate-900">{c.name} <span className="text-xs font-mono text-slate-400 font-normal ml-2">Organization</span></div>
                                                <div className="text-xs text-slate-500 line-clamp-1">{c.industry} &bull; {c.open_roles?.length || 0} Open Roles</div>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 group-hover:text-accent-red tracking-widest uppercase">View</div>
                                        </button>
                                    ))}

                                    {/* Colleges */}
                                    {colleges.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => (
                                        <button
                                            key={c.institution_id}
                                            onClick={() => handleNavigation(`/college/${c.institution_id}`)}
                                            className="w-full flex items-center p-3 rounded-xl hover:bg-slate-50 hover-red-outline group transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-accent-purple/10 text-accent-purple flex items-center justify-center mr-3 shrink-0">
                                                <GraduationCap className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-sm font-bold text-slate-900">{c.name} <span className="text-xs font-mono text-slate-400 font-normal ml-2">Institution</span></div>
                                                <div className="text-xs text-slate-500 line-clamp-1">Rank #{c.national_rank} &bull; {c.student_count} Students</div>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 group-hover:text-accent-red tracking-widest uppercase">View</div>
                                        </button>
                                    ))}

                                    {/* Empty State */}
                                    {!isLoading && candidates.every(c => !c.name.toLowerCase().includes(query.toLowerCase()) && !(c.headline && c.headline.toLowerCase().includes(query.toLowerCase()))) &&
                                        companies.every(c => !c.name.toLowerCase().includes(query.toLowerCase()) && !(c.industry && c.industry.toLowerCase().includes(query.toLowerCase()))) &&
                                        colleges.every(c => !c.name.toLowerCase().includes(query.toLowerCase())) && (
                                            <div className="p-4 text-center text-sm font-medium text-slate-500">No profile matches found for "{query}".</div>
                                        )}
                                </>
                            )}

                            <div className="mt-4 border-t border-slate-100 pt-3 px-4 flex justify-between items-center text-xs text-slate-400 font-mono">
                                <span>Agentic Search Active</span>
                                <span>Press <kbd className="font-sans bg-slate-100 px-1 py-0.5 rounded text-slate-600">Enter</kbd> to search all nodes</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Keys */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5"><kbd className="bg-white border border-slate-200 shadow-sm px-1.5 py-0.5 rounded font-sans text-slate-700">ESC</kbd> to close</div>
                    <div className="flex items-center gap-1.5"><kbd className="bg-white border border-slate-200 shadow-sm px-1.5 py-0.5 rounded font-sans text-slate-700">↑↓</kbd> to navigate</div>
                </div>

            </div>
        </div>
    );
}
