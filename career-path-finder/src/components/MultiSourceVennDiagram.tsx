import { useEffect, useRef, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const generateVennData = (_persona: any, graphData: any) => {
    if (!graphData || !graphData.graph_intersections) return { nodes: [], links: [] };

    const intersections = graphData.graph_intersections;
    const normalizedScores = graphData.normalized_scores || {};

    const nodes: any[] = [];
    const links: any[] = [];

    // 1. Identify all unique sources across all skills
    const sourceSet = new Set<string>();
    Object.values(intersections).forEach((sources: any) => {
        sources.forEach((s: string) => sourceSet.add(s));
    });

    // 2. Add Source Hubs (e.g. GitHub, Resume)
    const sourceColors: Record<string, string> = {
        'GitHub': '#2563eb', // Blue
        'HackerRank': '#10b981', // Emerald
        'LinkedIn': '#0284c7', // Sky
        'Resume': '#8b5cf6', // Violet
        'Transcript': '#f59e0b', // Amber
    };

    Array.from(sourceSet).forEach((source, index) => {
        nodes.push({
            id: source,
            group: index + 10,
            val: 40,
            type: 'source_hub',
            color: sourceColors[source as string] || '#64748b'
        });
    });

    // 3. Add Skill Nodes and Links
    Object.entries(intersections).forEach(([skill, sources]: [string, any]) => {
        const score = normalizedScores[skill] || 0.5;
        const isShared = sources.length > 1; // It appears in multiple sources

        nodes.push({
            id: skill,
            group: isShared ? 1 : 2, // 1 = Shared intersection, 2 = Single source
            val: Math.max(15, score * 30),
            type: isShared ? 'shared_skill' : 'skill',
            sourcesCount: sources.length
        });

        // Link the skill to everyone who claimed it
        sources.forEach((source: string) => {
            links.push({
                source: source,
                target: skill
            });
        });
    });

    return { nodes, links };
};

export default function MultiSourceVennDiagram({ persona: _persona, graphData }: { persona: any, graphData: any }) {
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    const forceData = useMemo(() => generateVennData(_persona, graphData), [_persona, graphData]);

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
                fgRef.current.d3Force('charge').strength(-400);
                fgRef.current.d3Force('link').distance(70);
                fgRef.current.zoom(1.4, 2000);
            }
        }, 500);

        return () => observer.disconnect();
    }, [forceData]);

    const getNodeColor = (node: any) => {
        if (node.type === 'source_hub') return node.color;
        if (node.type === 'shared_skill') return '#ef4444'; // Highlight multi-verified skills in red
        return '#94a3b8'; // Standard slate for single source
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-slate-50 inset-0 absolute rounded-xl overflow-hidden">
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={forceData}

                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.id;
                    const isHub = node.type === 'source_hub';
                    const fontSize = isHub ? 14 / globalScale : 11 / globalScale;
                    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                    ctx.beginPath();
                    if (isHub) {
                        ctx.arc(node.x, node.y, node.val / 2.5, 0, 2 * Math.PI, false);
                    } else {
                        ctx.arc(node.x, node.y, node.val / 3, 0, 2 * Math.PI, false);
                    }

                    ctx.fillStyle = isHub ? getNodeColor(node) : `${getNodeColor(node)}20`;
                    ctx.lineWidth = (isHub ? 2 : 1.5) / globalScale;
                    ctx.strokeStyle = getNodeColor(node);
                    ctx.fill();
                    ctx.stroke();

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

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isHub ? '#0f172a' : '#334155';
                    ctx.fillText(label, node.x, node.y + (isHub ? node.val / 2.5 : node.val / 3) + 4 + fontSize / 2);
                }}

                linkColor={() => '#cbd5e1'}
                linkWidth={(link: any) => link.target?.type === 'shared_skill' ? 2 : 1.5}
                backgroundColor="#f8fafc"
            />
        </div>
    );
}
