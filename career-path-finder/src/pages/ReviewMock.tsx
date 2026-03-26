import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ReviewMock() {
    const location = useLocation();
    const navigate = useNavigate();
    const profileData = location.state?.profileData;

    if (!profileData) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <p className="text-slate-500 font-mono">No profile data found in session.</p>
                <button onClick={() => navigate('/build')} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg">Return to Builder</button>
            </div>
        );
    }

    const { normalized_scores, graph_intersections } = profileData;

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-mono text-[10px] tracking-[0.2em] font-bold uppercase mb-4">
                    <CheckCircle2 className="w-4 h-4" /> Vectors Successfully Generated
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Review Extracted Capabilities</h1>
                <p className="text-slate-500">The Verification Agents have processed your links and documents into the following normalized Skill Vector Map.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800">Unified Graph Intersections</h2>
                    <span className="text-xs font-mono text-slate-500">{Object.keys(normalized_scores || {}).length} Verified Nodes</span>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(normalized_scores || {})
                            .sort(([, a]: any, [, b]: any) => b - a)
                            .map(([skill, score]: [string, any]) => {
                                const sources = graph_intersections?.[skill] || [];
                                return (
                                    <div key={skill} className="flex flex-col gap-2 p-4 border border-slate-100 rounded-lg bg-slate-50/50 hover:border-slate-300 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-800">{skill}</span>
                                            <span className="font-mono text-xs font-bold text-accent-red">{(score * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-accent-red" style={{ width: `${score * 100}%` }}></div>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {sources.map((s: string) => (
                                                <span key={s} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button onClick={() => navigate('/build')} className="px-6 py-2 border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                    Re-Run Agents
                </button>
                <button onClick={() => navigate(`/navigate/${profileData.user_id}`)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-accent-red flex items-center gap-2 transition-colors shadow-md">
                    Commit & Generate Dashboard
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
