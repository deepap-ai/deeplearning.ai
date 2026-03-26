import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// Data structured to form Venn-like clusters: Two degree hubs and their skills
const generateDegreeSkillData = () => {
    return {
        nodes: [
            // Degrees (Centers of gravity)
            { id: 'BS Computer Science', group: 1, val: 50, type: 'degree' },
            { id: 'BS Economics', group: 4, val: 50, type: 'degree' },

            // Exclusive CS Skills
            { id: 'Algorithms', group: 1, val: 30, type: 'skill' },
            { id: 'Data Structures', group: 1, val: 30, type: 'skill' },
            { id: 'Systems Engineering', group: 1, val: 25, type: 'skill' },
            { id: 'Software Dev', group: 1, val: 28, type: 'skill' },

            // Exclusive Economics Skills
            { id: 'Microeconomics', group: 4, val: 30, type: 'skill' },
            { id: 'Macroeconomics', group: 4, val: 28, type: 'skill' },
            { id: 'Game Theory', group: 4, val: 25, type: 'skill' },
            { id: 'Econometrics', group: 4, val: 30, type: 'skill' },

            // Overlapping/Shared Skills (Connect to BOTH, will get pulled to center)
            { id: 'Quantitative Analysis', group: 3, val: 35, type: 'shared' },
            { id: 'Data Science', group: 3, val: 38, type: 'shared' },
            { id: 'Statistics', group: 3, val: 32, type: 'shared' },
            { id: 'Machine Learning', group: 3, val: 35, type: 'shared' },
        ],
        links: [
            // CS exclusive links
            { source: 'BS Computer Science', target: 'Algorithms' },
            { source: 'BS Computer Science', target: 'Data Structures' },
            { source: 'BS Computer Science', target: 'Systems Engineering' },
            { source: 'BS Computer Science', target: 'Software Dev' },

            // Econ exclusive links
            { source: 'BS Economics', target: 'Microeconomics' },
            { source: 'BS Economics', target: 'Macroeconomics' },
            { source: 'BS Economics', target: 'Game Theory' },
            { source: 'BS Economics', target: 'Econometrics' },

            // Shared links (pulled by both sides)
            { source: 'BS Computer Science', target: 'Quantitative Analysis' },
            { source: 'BS Economics', target: 'Quantitative Analysis' },

            { source: 'BS Computer Science', target: 'Data Science' },
            { source: 'BS Economics', target: 'Data Science' },

            { source: 'BS Computer Science', target: 'Statistics' },
            { source: 'BS Economics', target: 'Statistics' },

            { source: 'BS Computer Science', target: 'Machine Learning' },
            { source: 'BS Economics', target: 'Machine Learning' },
        ]
    };
};

export default function DegreeSkillDAG() {
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [graphData] = useState(() => generateDegreeSkillData());

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0] && entries[0].contentRect.width > 0) {
                setDimensions({
                    width: entries[0].contentRect.width,
                    height: entries[0].contentRect.height
                });
            }
        });

        if (containerRef.current) observer.observe(containerRef.current);

        setTimeout(() => {
            if (fgRef.current) {
                // Tweak forces to create distinct clusters and a shared middle
                fgRef.current.d3Force('charge').strength(-550);
                fgRef.current.d3Force('link').distance(70);
                fgRef.current.zoom(1.4, 2000);
            }
        }, 500);

        return () => observer.disconnect();
    }, []);

    const getNodeColor = (node: any) => {
        if (node.id === 'BS Computer Science') return '#0ea5e9'; // Blue
        if (node.id === 'BS Economics') return '#10b981'; // Green

        if (node.type === 'shared') return '#8b5cf6'; // Purple for shared
        if (node.group === 1) return '#38bdf8'; // Lighter blue for CS skills
        if (node.group === 4) return '#34d399'; // Lighter green for Econ skills

        return '#94a3b8';
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-slate-50 inset-0 absolute">
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}

                // Custom Node Drawing
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.id;
                    const isDegree = node.type === 'degree';
                    const fontSize = isDegree ? 14 / globalScale : 11 / globalScale;
                    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                    // Node Shape
                    ctx.beginPath();

                    if (isDegree) {
                        // Draw square for degrees to stand out
                        const size = node.val / 2.5;
                        ctx.rect(node.x - size / 2, node.y - size / 2, size, size);
                    } else {
                        // Circle for skills
                        ctx.arc(node.x, node.y, node.val / 3, 0, 2 * Math.PI, false);
                    }

                    ctx.fillStyle = isDegree ? getNodeColor(node) : `${getNodeColor(node)}20`;
                    ctx.lineWidth = (isDegree ? 2 : 1.5) / globalScale;
                    ctx.strokeStyle = getNodeColor(node);
                    ctx.fill();
                    ctx.stroke();

                    // Text Background
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.beginPath();
                    ctx.roundRect(
                        node.x - bckgDimensions[0] / 2,
                        node.y + node.val / 2.5 + 4,
                        bckgDimensions[0],
                        bckgDimensions[1],
                        4 / globalScale
                    );
                    ctx.fill();
                    ctx.strokeStyle = '#e2e8f0';
                    ctx.lineWidth = 0.5 / globalScale;
                    ctx.stroke();

                    // Text Lettering
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isDegree ? '#0f172a' : '#334155';
                    ctx.fillText(label, node.x, node.y + node.val / 2.5 + 4 + fontSize / 2);
                }}

                // Plain links, no particles needed for undirected Venn-style graph
                linkColor={() => '#cbd5e1'}
                linkWidth={1.5}
                backgroundColor="#f8fafc" // slate-50
            />
        </div>
    );
}
