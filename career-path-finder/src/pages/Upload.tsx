import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function UploadPage() {
    const navigate = useNavigate();
    const [isUploading, setIsUploading] = useState(false);
    const [complete, setComplete] = useState(false);

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setComplete(true);
            setTimeout(() => navigate('/dashboard'), 1500);
        }, 2000);
    };

    return (
        <div className="max-w-3xl mx-auto min-h-[70vh] flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 duration-500">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Sync Your Target Role</h1>
                <p className="text-slate-500 font-medium tracking-wide">Upload the Job Description (JD) to map out your SkillGraph Deltas.</p>
            </div>

            <div
                onClick={!isUploading && !complete ? handleUpload : undefined}
                className={`w-full max-w-xl bg-white border-2 border-dashed ${complete ? 'border-emerald-400 bg-emerald-50' : isUploading ? 'border-accent bg-blue-50' : 'border-slate-300 hover:border-accent hover:bg-slate-50'} rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group shadow-sm`}
            >
                {complete ? (
                    <div className="flex flex-col items-center text-emerald-600 animate-in zoom-in">
                        <CheckCircle2 className="w-16 h-16 mb-6" />
                        <h3 className="text-2xl font-bold text-slate-900">Ingestion Complete</h3>
                        <p className="text-sm mt-2 font-mono tracking-wide text-emerald-700">Redirecting to Dashboard...</p>
                    </div>
                ) : isUploading ? (
                    <div className="flex flex-col items-center text-accent">
                        <div className="w-16 h-16 mb-6 rounded-full border-4 border-accent/20 border-t-accent animate-spin"></div>
                        <h3 className="text-2xl font-bold text-slate-900">Browserizing Job Description...</h3>
                        <p className="text-sm mt-3 text-slate-500 font-mono tracking-wide">Agent simulating extraction via Greenhouse...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-accent transition-colors">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6 border border-slate-200 group-hover:scale-110 transition-transform shadow-sm">
                            <UploadCloud className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Drag & Drop JD PDF</h3>
                        <p className="text-sm text-center max-w-xs font-medium text-slate-500 leading-relaxed">Or paste a URL to a Greenhouse or Lever job posting to trigger the Web Subagent.</p>

                        <div className="mt-8 flex items-center gap-2 text-accent font-semibold text-sm tracking-wide">
                            Click to simulate JD vectorization <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </div>

            {!isUploading && !complete && (
                <div className="mt-8 flex items-center gap-4 text-slate-600 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium">Loaded: Senior AI Agent Architect (Visual Concepts)</span>
                </div>
            )}
        </div>
    );
}
