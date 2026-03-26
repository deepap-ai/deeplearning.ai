import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// We'll define a quick helper to generate data based on the root node
const generateGraphData = (rootNodeId: string) => {
    // If it's MIT or an organization, we can adjust the nodes slightly to look like a curriculum vs a person
    const isOrg = rootNodeId !== 'Alex Chen';

    return {
        nodes: [
            { id: rootNodeId, group: 0, val: 50, type: 'user' },

            // Group 1 (Blue)
            { id: isOrg ? 'Intro to CS' : 'Python', group: 1, val: 30, source: isOrg ? 'Course 6.0001' : 'GitHub' },
            { id: isOrg ? 'Software Studio' : 'React', group: 1, val: 28, source: isOrg ? 'Course 6.1040' : 'GitHub' },
            { id: isOrg ? 'Comp. Systems' : 'System Design', group: 1, val: 35, source: isOrg ? 'Course 6.033' : 'Projects' },
            { id: isOrg ? 'Web Dev' : 'Node.js', group: 1, val: 22, source: isOrg ? 'Course 6.1040' : 'GitHub' },

            // Group 2 (Green)
            { id: isOrg ? 'Machine Learning' : 'TensorFlow', group: 2, val: 25, source: isOrg ? 'Course 6.3900' : 'HackerRank' },
            { id: isOrg ? 'Linear Algebra' : 'Linear Algebra', group: 2, val: 20, source: isOrg ? 'Course 18.06' : 'UC Berkeley' },
            { id: isOrg ? 'Algorithms' : 'Algorithms', group: 2, val: 32, source: isOrg ? 'Course 6.1220' : 'HackerRank' },

            // Group 3 (Purple)
            { id: isOrg ? 'UI Design' : 'UI/UX Design', group: 3, val: 18, source: isOrg ? 'Course 4.510' : 'Portfolio' },
            { id: isOrg ? 'Prototyping' : 'Figma', group: 3, val: 15, source: isOrg ? 'Course 4.510' : 'Portfolio' },

            // Group 4 (Orange)
            { id: isOrg ? 'Engineering Leadership' : 'Team Leadership', group: 4, val: 28, source: isOrg ? 'Course 6.UAT' : 'LinkedIn' },
            { id: isOrg ? 'Software Eng' : 'Agile', group: 4, val: 22, source: isOrg ? 'Course 6.1040' : 'LinkedIn' },
            { id: isOrg ? 'Communication' : 'Tech Writing', group: 4, val: 19, source: isOrg ? 'Course 6.UAT' : 'Projects' }
        ],
        links: [
            { source: rootNodeId, target: isOrg ? 'Intro to CS' : 'Python' },
            { source: rootNodeId, target: isOrg ? 'Software Studio' : 'React' },
            { source: rootNodeId, target: isOrg ? 'Machine Learning' : 'TensorFlow' },
            { source: rootNodeId, target: isOrg ? 'Engineering Leadership' : 'Team Leadership' },
            { source: rootNodeId, target: isOrg ? 'UI Design' : 'UI/UX Design' },

            { source: isOrg ? 'Intro to CS' : 'Python', target: isOrg ? 'Machine Learning' : 'TensorFlow' },
            { source: isOrg ? 'Intro to CS' : 'Python', target: isOrg ? 'Algorithms' : 'Algorithms' },
            { source: isOrg ? 'Intro to CS' : 'Python', target: isOrg ? 'Comp. Systems' : 'System Design' },
            { source: isOrg ? 'Software Studio' : 'React', target: isOrg ? 'Web Dev' : 'Node.js' },
            { source: isOrg ? 'Software Studio' : 'React', target: isOrg ? 'UI Design' : 'UI/UX Design' },
            { source: isOrg ? 'UI Design' : 'UI/UX Design', target: isOrg ? 'Prototyping' : 'Figma' },
            { source: isOrg ? 'Machine Learning' : 'TensorFlow', target: isOrg ? 'Linear Algebra' : 'Linear Algebra' },
            { source: isOrg ? 'Engineering Leadership' : 'Team Leadership', target: isOrg ? 'Software Eng' : 'Agile' },
            { source: isOrg ? 'Comp. Systems' : 'System Design', target: isOrg ? 'Communication' : 'Tech Writing' },
        ]
    };
};

export default function SkillGraphVisualizer({ rootNodeId = 'Alex Chen', externalData = null }: { rootNodeId?: string, externalData?: any }) {
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Generate static data once based on the prop, unless dynamic external data is provided
    const [graphData, setGraphData] = useState(() => externalData || generateGraphData(rootNodeId));

    // Update graph if external dynamic data comes in after mount
    useEffect(() => {
        if (externalData) {
            setGraphData(externalData);
        }
    }, [externalData]);

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
                fgRef.current.d3Force('charge').strength(-300);
                fgRef.current.d3Force('link').distance(60);
                fgRef.current.zoom(1.8, 2000);
            }
        }, 500);

        return () => observer.disconnect();
    }, []);

    const getNodeColor = (node: any) => {
        if (node.id === rootNodeId) return '#ef4444'; // Red center for the root
        const colors = ['#ef4444', '#2563eb', '#059669', '#7e22ce', '#d97706'];
        return colors[node.group] || '#94a3b8';
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-white inset-0 absolute">
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}

                // Custom Node Drawing
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.id;
                    const fontSize = node.type === 'user' ? 14 / globalScale : 11 / globalScale;
                    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                    // Node Circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val / 3, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.type === 'user' ? '#ef4444' : `${getNodeColor(node)}20`;
                    // Add subtle stroke to all nodes
                    ctx.lineWidth = 1 / globalScale;
                    ctx.strokeStyle = node.type === 'user' ? '#ef4444' : getNodeColor(node);
                    ctx.fill();
                    ctx.stroke();

                    // Text Background (Light mode)
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.beginPath();
                    ctx.roundRect(
                        node.x - bckgDimensions[0] / 2,
                        node.y + node.val / 3 + 2,
                        bckgDimensions[0],
                        bckgDimensions[1],
                        4 / globalScale
                    );
                    ctx.fill();
                    ctx.strokeStyle = node.type === 'user' ? '#ef4444' : '#e2e8f0';
                    ctx.lineWidth = 0.5 / globalScale;
                    ctx.stroke();

                    // Text Lettering
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#0f172a'; // Dark slate text
                    ctx.fillText(label, node.x, node.y + node.val / 3 + 2 + fontSize / 2);
                }}

                // Tooltip
                nodeLabel={(node: any) => node.type !== 'user' ?
                    `<div style="background: rgba(255,255,255,0.95); padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); font-family: Inter, sans-serif;">
                    <strong style="color: ${getNodeColor(node)}; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Verified Node</strong>
                    <div style="color: #0f172a; font-weight: bold; margin: 4px 0;">${node.id}</div>
                    <div style="color: #64748b; font-size: 11px;">Source Data: <span style="font-weight: bold; color: #ef4444;">${node.source}</span></div>
                  </div>`
                    : ''}

                linkColor={() => '#cbd5e1'} // Light gray links
                linkWidth={1.5}
                linkDirectionalParticles={3}
                linkDirectionalParticleColor={() => '#ef4444'} // Red particles!
                linkDirectionalParticleSpeed={0.005}
                backgroundColor="#ffffff"
            />
        </div>
    );
}
