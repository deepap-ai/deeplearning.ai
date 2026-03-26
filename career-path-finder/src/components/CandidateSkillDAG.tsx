import { useEffect, useRef, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// We dynamically build the Venn diagram from current vs target skills
const generateCandidateVennData = (persona: any, routeData: any) => {
    if (!persona || !routeData) return { nodes: [], links: [] };

    const candidateName = persona.name || 'Candidate';
    const targetRole = routeData.target_role || 'Target Role';

    const currentSkills = Object.keys(routeData.current_skills || {});
    const targetSkills = Object.keys(routeData.target_skills || {});

    // Find intersection and differences
    const shared = currentSkills.filter(s => targetSkills.includes(s));
    const currentOnly = currentSkills.filter(s => !targetSkills.includes(s));
    const targetOnly = targetSkills.filter(s => !currentSkills.includes(s));

    const nodes: any[] = [
        { id: candidateName, group: 1, val: 50, type: 'hub' },
        { id: targetRole, group: 2, val: 50, type: 'hub' }
    ];

    const links: any[] = [];

    // Add Current Only
    currentOnly.forEach(skill => {
        const val = routeData.current_skills[skill] ? routeData.current_skills[skill] * 40 : 25;
        nodes.push({ id: skill, group: 1, val: Math.max(20, val), type: 'skill' });
        links.push({ source: candidateName, target: skill });
    });

    // Add Target Only (Gaps)
    targetOnly.forEach(skill => {
        const val = routeData.target_skills[skill] ? routeData.target_skills[skill] * 40 : 25;
        nodes.push({ id: skill, group: 2, val: Math.max(20, val), type: 'gap' });
        links.push({ source: targetRole, target: skill });
    });

    // Add Shared
    shared.forEach(skill => {
        const val = routeData.current_skills[skill] ? routeData.current_skills[skill] * 45 : 30;
        nodes.push({ id: skill, group: 3, val: Math.max(25, val), type: 'shared' });
        links.push({ source: candidateName, target: skill });
        links.push({ source: targetRole, target: skill });
    });

    // Fallback if no specific target skills provided to ensure the graph isn't empty on one side
    if (targetOnly.length === 0 && shared.length === 0) {
        // Just dummy data for demonstration if API doesn't provide it
        ['Systems Design', 'Agentic Architecture', 'Leadership'].forEach(skill => {
            nodes.push({ id: skill, group: 2, val: 30, type: 'gap' });
            links.push({ source: targetRole, target: skill });
        });
    }

    return { nodes, links };
};

export default function CandidateSkillDAG({ persona, routeData }: { persona: any, routeData: any }) {
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    const graphData = useMemo(() => generateCandidateVennData(persona, routeData), [persona, routeData]);

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
                fgRef.current.d3Force('charge').strength(-450);
                fgRef.current.d3Force('link').distance(80);
                fgRef.current.zoom(1.3, 2000);
            }
        }, 500);

        return () => observer.disconnect();
    }, [graphData]); // Re-run layout on data change

    const getNodeColor = (node: any) => {
        if (node.id === (persona?.name || 'Candidate')) return '#ef4444'; // Red for Candidate Hub
        if (node.id === (routeData?.target_role || 'Target Role')) return '#10b981'; // Green for Target Hub

        if (node.type === 'shared') return '#8b5cf6'; // Purple for shared (intersection)
        if (node.type === 'gap') return '#34d399'; // Lighter green for target gaps
        if (node.group === 1) return '#f87171'; // Lighter red for current only

        return '#94a3b8';
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-slate-50 inset-0 absolute rounded-xl overflow-hidden">
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}

                // Custom Node Drawing
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.id;
                    const isHub = node.type === 'hub';
                    const fontSize = isHub ? 14 / globalScale : 11 / globalScale;
                    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                    // Node Shape
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
                backgroundColor="#f8fafc" // slate-50
            />
        </div>
    );
}
