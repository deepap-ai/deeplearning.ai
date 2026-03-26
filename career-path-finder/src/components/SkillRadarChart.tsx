import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface SkillRadarChartProps {
    candidateVector: Record<string, number>;
    jdVector: Record<string, number>;
}

export default function SkillRadarChart({ candidateVector, jdVector }: SkillRadarChartProps) {
    const data = Object.keys(jdVector).map(skill => ({
        skill,
        candidate: (candidateVector[skill] ?? 0) * 100,
        requirement: (jdVector[skill] ?? 0) * 100,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter', fontWeight: 600 }}
                />
                <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 9 }}
                    tickCount={5}
                />
                <Radar
                    name="JD Requirement"
                    dataKey="requirement"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.1}
                    strokeWidth={2}
                />
                <Radar
                    name="Candidate"
                    dataKey="candidate"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.15}
                    strokeWidth={2}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                    }}
                    formatter={(value) => `${Number(value).toFixed(0)}%`}
                />
                <Legend
                    wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
