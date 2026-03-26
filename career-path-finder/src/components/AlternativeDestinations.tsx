import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Alternative {
    title: string;
    company: string;
    match: number;
    gap_summary: string;
}

interface AlternativeDestinationsProps {
    alternatives: Alternative[];
    personaId: string;
}

export default function AlternativeDestinations({ alternatives, personaId }: AlternativeDestinationsProps) {
    const navigate = useNavigate();

    if (!alternatives || alternatives.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-accent-red" /> Nearby Destinations
            </h3>
            <p className="text-[10px] text-slate-500 -mt-1">You might also qualify for...</p>

            {alternatives.map((alt, i) => (
                <motion.div
                    key={alt.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={() => navigate(`/navigate/${personaId}?role=${encodeURIComponent(alt.title)}&company=${encodeURIComponent(alt.company)}`)}
                    className="bg-white border border-slate-200 rounded-lg p-3 hover-red-outline transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-accent-red transition-colors">{alt.title}</p>
                            <p className="text-[10px] text-slate-500">{alt.company}</p>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            alt.match >= 90
                                ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                                : alt.match >= 75
                                ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                            {alt.match}%
                        </span>
                    </div>

                    {/* Match bar */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${alt.match}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                            className={`h-full rounded-full ${
                                alt.match >= 90 ? 'bg-accent-green' : alt.match >= 75 ? 'bg-accent-blue' : 'bg-slate-400'
                            }`}
                        />
                    </div>

                    <p className="text-[9px] text-slate-500 font-mono">{alt.gap_summary}</p>
                </motion.div>
            ))}
        </div>
    );
}
