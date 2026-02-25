import React, { useEffect, useState, useRef } from 'react';
import logsRaw from '../data/agentic_traces.log?raw';

export default function MissionControlTerminal() {
    const [lines, setLines] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const safeLogs = typeof logsRaw === 'string' ? logsRaw : '';
        const logArray = safeLogs.trim().split('\n').filter(Boolean);
        let currentLine = 0;

        const interval = setInterval(() => {
            if (currentLine < logArray.length) {
                setLines(prev => [...prev, logArray[currentLine]]);
                currentLine++;
            } else {
                clearInterval(interval);
            }
        }, 150);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    const renderLogLine = (line: string, i: number) => {
        if (!line) return null;

        // Highlight extraction events (Oracle)
        if (line.includes('-> Detected:')) {
            return (
                <div key={i} className="text-slate-100 font-mono text-[10px] sm:text-xs mb-1.5 transition-all font-semibold leading-relaxed drop-shadow-sm">
                    <span className="text-slate-500">{line.split('- [')[0]}</span>
                    <span className="text-accent-red bg-accent-red/20 border border-accent-red/50 px-1 py-0.5 rounded mx-1 font-bold"> [Oracle] </span>
                    {line.split('[Oracle] - ')[1]}
                </div>
            );
        }

        // Regular logs
        const parts = line.split(' - ');
        return (
            <div key={i} className="text-slate-300 font-mono text-[10px] sm:text-xs mb-1 opacity-90 leading-relaxed font-medium">
                <span className="text-slate-500 mr-2">{parts[0]}</span>
                <span className="text-slate-400">{parts[1] ? ` - ${parts[1]} - ` : ''}</span>
                <span className="text-slate-200">{parts.slice(2).join(' - ')}</span>
            </div>
        );
    };

    return (
        <div
            ref={scrollRef}
            className="absolute inset-0 p-4 pb-12 overflow-y-auto scroll-smooth font-mono text-sm custom-scrollbar bg-slate-900"
        >
            <div className="flex flex-col justify-end min-h-full">
                {lines.map((line, i) => renderLogLine(line, i))}
                {lines.length > 0 && lines.length < (typeof logsRaw === 'string' ? logsRaw.split('\n').length : 0) && (
                    <div className="text-accent-red font-mono text-[10px] sm:text-xs animate-pulse mt-2 font-bold drop-shadow-sm">
                        &gt; Tracing agentic inferences...
                    </div>
                )}
            </div>
        </div>
    );
}
