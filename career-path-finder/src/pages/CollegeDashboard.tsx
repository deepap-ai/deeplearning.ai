import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DegreeSkillDAG from '../components/DegreeSkillDAG';
import { GraduationCap, Activity, FileText, Link, BookOpen, Compass, Trophy, Users, DollarSign, Building2 } from 'lucide-react';

export default function CollegeDashboard() {
    const { col_id } = useParams();

    // Dynamic State
    const [collegeInfo, setCollegeInfo] = useState({
        name: "MIT",
        domain: "mit.edu",
        rank: 1,
        studentCount: 11934,
        acceptanceRate: 0.04,
        coursesCount: 142
    });

    useEffect(() => {
        // Fetch all colleges to find the requested one
        fetch('https://career-path-finder-ylyc.onrender.com/api/colleges')
            .then(res => res.json())
            .then(data => {
                const targetCol = data.find((c: any) => c.institution_id === col_id);
                if (targetCol) {
                    setCollegeInfo({
                        name: targetCol.name,
                        domain: targetCol.website || "mit.edu", // fallback
                        rank: targetCol.national_rank || 1,
                        studentCount: targetCol.student_count || 10000,
                        acceptanceRate: targetCol.acceptance_rate || 0.05,
                        coursesCount: targetCol.curriculum?.length || 0
                    });
                }
            })
            .catch(err => console.error("Failed to fetch colleges:", err));
    }, [col_id]);

    return (
        <div className="flex flex-col gap-6 h-full max-w-[1600px] mx-auto">

            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-3">
                        {collegeInfo.name} <span className="text-accent-red">spArc Profile</span>
                    </h1>
                    <p className="text-slate-500 font-mono text-xs tracking-wide font-medium">
                        Institution Graph Mapping • Academic Capability to Market Frontier
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-sm flex items-center gap-2 shadow-sm">
                        <Trophy className="w-4 h-4 text-accent-red" /> Rank: #{collegeInfo.rank}
                    </div>
                </div>
            </div>

            {/* Main 3-Column Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

                {/* Left Panel: Catalog Ingestion & Planner (Span 1) */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-accent-red" /> Catalog Ingestion
                    </h2>

                    <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 flex flex-col gap-4">
                        <p className="text-xs text-slate-500 font-medium">Upload syllabi or catalog links. The Agentic Planner will map course outcomes to the global skill graph.</p>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Course Catalog URL</label>
                            <div className="flex group focus-within:border-accent-red transition-colors">
                                <div className="bg-slate-50 border border-r-0 border-slate-200 group-focus-within:border-accent-red rounded-l-lg px-3 py-2 flex items-center justify-center transition-colors">
                                    <Link className="w-4 h-4 text-slate-400 group-focus-within:text-accent-red" />
                                </div>
                                <input type="text" readOnly value={`https://catalog.${collegeInfo.domain}/subjects/`} className="bg-white border border-slate-200 group-focus-within:border-accent-red rounded-r-lg px-3 py-2 text-xs text-slate-900 w-full outline-none transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Department Course Counts (Mocked Data) */}
                    <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 mt-2 flex flex-col gap-3">
                        <h2 className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase border-b border-slate-100 pb-2">
                            Department Offerings
                        </h2>

                        <div className="flex flex-col gap-2.5">
                            <div className="flex justify-between items-center group cursor-pointer">
                                <span className="text-xs text-slate-700 font-medium group-hover:text-accent-red transition-colors">BS, EECS</span>
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold group-hover:bg-red-50 group-hover:text-accent-red transition-colors">48 courses</span>
                            </div>

                            <div className="flex justify-between items-center group cursor-pointer">
                                <span className="text-xs text-slate-700 font-medium group-hover:text-accent-red transition-colors">BS, Economics</span>
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold group-hover:bg-red-50 group-hover:text-accent-red transition-colors">26 courses</span>
                            </div>

                            <div className="flex justify-between items-center group cursor-pointer">
                                <span className="text-xs text-slate-700 font-medium group-hover:text-accent-red transition-colors">BS, Mathematics</span>
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold group-hover:bg-red-50 group-hover:text-accent-red transition-colors">35 courses</span>
                            </div>

                            <div className="flex justify-between items-center group cursor-pointer">
                                <span className="text-xs text-slate-700 font-medium group-hover:text-accent-red transition-colors">BS, Mechanical Engineering</span>
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold group-hover:bg-red-50 group-hover:text-accent-red transition-colors">33 courses</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Center Panel: The Curriculum Coverage Graph (Span 2) */}
                <div className="lg:col-span-2 flex flex-col min-h-[500px]">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-900" /> Curriculum Coverage Graph
                    </h2>
                    <div className="flex-1 bg-white shadow-sm rounded-xl border border-slate-200 hover-red-outline relative overflow-hidden flex flex-col group transition-colors">
                        <div className="absolute top-4 left-4 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-sm">
                                <div className="text-xs text-slate-900 mb-1">Parsed Courses: <span className="text-accent-red">{collegeInfo.coursesCount}</span></div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-blue"></span> EECS Base</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-green"></span> AI / Decision Making</div>
                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-purple"></span> Physics / Math</div>
                            </div>
                        </div>
                        {/* The light-mode Visualizer mapping curriculum */}
                        <div className="absolute inset-0">
                            <DegreeSkillDAG />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Institution Meta Data (Span 1) */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="text-xs font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                        <Compass className="w-4 h-4 text-accent-red" /> Institution Meta Data
                    </h2>

                    <div className="flex flex-col gap-3">

                        {/* General & Admissions */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Admissions</h3>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium flex items-center gap-2"><Users className="w-3.5 h-3.5 text-slate-400" /> Acceptance Rate</span>
                                <span className="text-sm font-bold text-slate-900">{(collegeInfo.acceptanceRate * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-400" /> Median SAT</span>
                                <span className="text-sm font-bold text-slate-900">1550</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Yield Rate</span>
                                <span className="text-sm font-bold text-slate-900">86%</span>
                            </div>
                        </div>

                        {/* Demographics & Academics */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Demographics</h3>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Total Students</span>
                                <span className="text-sm font-bold text-slate-900">{collegeInfo.studentCount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Undergraduates</span>
                                <span className="text-sm font-bold text-slate-900">4,543</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Student:Faculty</span>
                                <span className="text-sm font-bold text-slate-900">3:1</span>
                            </div>
                        </div>

                        {/* Financials & Outcomes */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Outcomes</h3>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-slate-400" /> Tuition</span>
                                <span className="text-sm font-bold text-slate-900">$64,310</span>
                            </div>
                            <div className="flex justify-between items-center text-accent-green">
                                <span className="text-xs font-bold flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> Median Earnings</span>
                                <span className="text-sm font-bold">$129,392</span>
                            </div>
                        </div>

                        {/* Top Majors */}
                        <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200 hover-red-outline transition-colors group cursor-pointer">
                            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">Top Majors Taught</h3>

                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent-blue"></span> Engineering</span>
                                        <span className="font-mono text-slate-500">33%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full"><div className="h-full bg-accent-blue rounded-full w-[33%]"></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span> Comp Sci / AI</span>
                                        <span className="font-mono text-slate-500">31%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full"><div className="h-full bg-accent-green rounded-full w-[31%]"></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent-purple"></span> Mathematics</span>
                                        <span className="font-mono text-slate-500">14%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full"><div className="h-full bg-accent-purple rounded-full w-[14%]"></div></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
