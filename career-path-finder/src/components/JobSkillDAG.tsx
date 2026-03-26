import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// Data structured to form Venn-like clusters: Three job groups and their skills
const generateJobSkillData = () => {
    return {
        nodes: [
            // Job Hubs (Centers of gravity)
            { id: 'Infrastructure', group: 1, val: 50, type: 'hub' },
            { id: 'Research', group: 2, val: 50, type: 'hub' },
            { id: 'Product Engineering', group: 3, val: 50, type: 'hub' },

            // Exclusive Infrastructure Skills
            { id: 'Kubernetes', group: 1, val: 30, type: 'skill' },
            { id: 'C++', group: 1, val: 32, type: 'skill' },
            { id: 'Distributed Systems', group: 1, val: 35, type: 'skill' },

            // Exclusive Research Skills
            { id: 'Reinforcement Learning', group: 2, val: 35, type: 'skill' },
            { id: 'Alignment Theory', group: 2, val: 30, type: 'skill' },
            { id: 'Model Interpretability', group: 2, val: 28, type: 'skill' },

            // Exclusive Product Skills
            { id: 'React / Frontend', group: 3, val: 32, type: 'skill' },
            { id: 'API Design', group: 3, val: 30, type: 'skill' },
            { id: 'User Experience', group: 3, val: 28, type: 'skill' },

            // Shared Skills (Infrastructure & Research)
            { id: 'PyTorch/CUDA', group: 4, val: 35, type: 'shared' },

            // Shared Skills (Research & Product)
            { id: 'Prompt Engineering', group: 5, val: 32, type: 'shared' },

            // Shared Skills (Infrastructure & Product)
            { id: 'DB Architecture', group: 6, val: 30, type: 'shared' },

            // Universal Skills (All three)
            { id: 'Python', group: 7, val: 40, type: 'universal' },
            { id: 'Systems Thinking', group: 7, val: 42, type: 'universal' },
        ],
        links: [
            // Infrastructure exclusive links
            { source: 'Infrastructure', target: 'Kubernetes' },
            { source: 'Infrastructure', target: 'C++' },
            { source: 'Infrastructure', target: 'Distributed Systems' },

            // Research exclusive links
            { source: 'Research', target: 'Reinforcement Learning' },
            { source: 'Research', target: 'Alignment Theory' },
            { source: 'Research', target: 'Model Interpretability' },

            // Product exclusive links
            { source: 'Product Engineering', target: 'React / Frontend' },
            { source: 'Product Engineering', target: 'API Design' },
            { source: 'Product Engineering', target: 'User Experience' },

            // Shared between Infra & Research
            { source: 'Infrastructure', target: 'PyTorch/CUDA' },
            { source: 'Research', target: 'PyTorch/CUDA' },

            // Shared between Research & Product
            { source: 'Research', target: 'Prompt Engineering' },
            { source: 'Product Engineering', target: 'Prompt Engineering' },

            // Shared between Infra & Product
            { source: 'Infrastructure', target: 'DB Architecture' },
            { source: 'Product Engineering', target: 'DB Architecture' },

            // Universal
            { source: 'Infrastructure', target: 'Python' },
            { source: 'Research', target: 'Python' },
            { source: 'Product Engineering', target: 'Python' },

            { source: 'Infrastructure', target: 'Systems Thinking' },
            { source: 'Research', target: 'Systems Thinking' },
            { source: 'Product Engineering', target: 'Systems Thinking' },
        ]
    };
};

export default function JobSkillDAG() {
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [graphData] = useState(() => generateJobSkillData());

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
                fgRef.current.d3Force('charge').strength(-400);
                fgRef.current.d3Force('link').distance(80);
                fgRef.current.zoom(1.2, 2000);
            }
        }, 500);

        return () => observer.disconnect();
    }, []);

    const getNodeColor = (node: any) => {
        if (node.id === 'Infrastructure') return '#0ea5e9'; // Blue
        if (node.id === 'Research') return '#10b981'; // Green
        if (node.id === 'Product Engineering') return '#8b5cf6'; // Purple

        if (node.type === 'universal') return '#ef4444'; // Red for universal
        if (node.type === 'shared') return '#f59e0b'; // Amber for shared

        if (node.group === 1) return '#38bdf8'; // Lighter blue
        if (node.group === 2) return '#34d399'; // Lighter green
        if (node.group === 3) return '#a78bfa'; // Lighter purple

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
                    const isHub = node.type === 'hub';
                    const fontSize = isHub ? 13 / globalScale : 11 / globalScale;
                    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                    // Node Shape
                    ctx.beginPath();

                    if (isHub) {
                        // Draw a slightly larger circle for hubs instead of rect
                        ctx.arc(node.x, node.y, node.val / 2.5, 0, 2 * Math.PI, false);
                    } else {
                        // Circle for skills
                        ctx.arc(node.x, node.y, node.val / 3, 0, 2 * Math.PI, false);
                    }

                    ctx.fillStyle = isHub ? getNodeColor(node) : `${getNodeColor(node)}20`;
                    ctx.lineWidth = (isHub ? 2 : 1.5) / globalScale;
                    ctx.strokeStyle = getNodeColor(node);
                    ctx.fill();
                    ctx.stroke();

                    // Text Background
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.beginPath();
                    ctx.roundRect(
                        node.x - bckgDimensions[0] / 2,
                        node.y + (isHub ? node.val / 2.5 : node.val / 3) + 4,
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
                    ctx.fillStyle = isHub ? '#0f172a' : '#334155';
                    ctx.fillText(label, node.x, node.y + (isHub ? node.val / 2.5 : node.val / 3) + 4 + fontSize / 2);
                }}

                // Plain links to represent relationships rather than flow direction
                linkColor={() => '#cbd5e1'}
                linkWidth={1.5}
                backgroundColor="#f8fafc"
            />
        </div>
    );
}
