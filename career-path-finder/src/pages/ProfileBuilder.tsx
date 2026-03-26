import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Github, Code2, GraduationCap, ArrowRight, ShieldCheck, Beaker, Linkedin, FileText } from 'lucide-react';

export default function ProfileBuilder() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: 'Meenal Pande',
        headline: 'AI Systems Engineer',
        github_url: 'https://github.com/mpande',
        hackerrank_url: 'https://hackerrank.com/mpande',
        linkedin_url: 'https://linkedin.com/in/meenalp',
        education: 'UC Berkeley',
        resume_text: 'Dummy Resume Text Content',
        transcript_text: 'Dummy Transcript Content'
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim() || !formData.headline.trim()) {
            setError('Please provide your Name and Professional Headline to continue.');
            return;
        }
        setError(null);
        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('headline', formData.headline);
            formDataToSend.append('github_url', formData.github_url);
            formDataToSend.append('hackerrank_url', formData.hackerrank_url);
            formDataToSend.append('linkedin_url', formData.linkedin_url);
            formDataToSend.append('education', formData.education);

            if (resumeFile) {
                formDataToSend.append('resume', resumeFile);
            }
            if (transcriptFile) {
                formDataToSend.append('transcript', transcriptFile);
            }

            const res = await fetch('https://career-path-finder-ylyc.onrender.com/api/build', {
                method: 'POST',
                body: formDataToSend
            });

            if (res.ok) {
                const data = await res.json();
                const routeName = data.user_id;

                // Set initials
                const nameParts = formData.name.trim().split(' ');
                const initials = nameParts.length > 1
                    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                    : formData.name.substring(0, 2).toUpperCase();

                localStorage.setItem('userInitials', initials);
                window.dispatchEvent(new CustomEvent('userInitialsUpdated', { detail: { initials } }));

                // Navigate straight to the new user profile hub
                setTimeout(() => navigate(`/${routeName}`), 1500);
            } else {
                setError(`Server Error: ${res.statusText}`);
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to connect. Is the backend server running on port 8000?');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto min-h-[80vh] flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 duration-500 py-12">

            <div className="text-center mb-10 w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-accent-red font-mono text-[10px] tracking-[0.2em] font-bold uppercase mb-4 shadow-sm">
                    <ShieldCheck className="w-3 h-3" /> Candidate Onboarding
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Sync Your Capabilities</h1>
                <p className="text-slate-500 font-medium tracking-wide max-w-xl mx-auto">
                    Provide your primary data hubs. The spArc AI verification agents will parse your commits, problem sets, and experiences into a deterministic Latent SkillGraph.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden">

                {/* Header Tape */}
                <div className="h-1.5 w-full bg-gradient-to-r from-accent-red via-accent-blue to-accent-purple"></div>

                <div className="p-8 md:p-10 flex flex-col gap-8">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold font-mono tracking-widest uppercase text-slate-500 flex justify-between">
                                Legal Name <span className="text-accent-red">*Required</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (error) setError(null);
                                }}
                                placeholder="e.g. Alex Chen"
                                className={`w-full px-4 py-3 rounded-lg border ${error && !formData.name.trim() ? 'border-accent-red' : 'border-slate-200'} focus:border-accent-red focus:ring-1 focus:ring-accent-red outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900`}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold font-mono tracking-widest uppercase text-slate-500 flex justify-between">
                                Professional Headline <span className="text-accent-red">*Required</span>
                            </label>
                            <input
                                type="text"
                                value={formData.headline}
                                onChange={e => {
                                    setFormData({ ...formData, headline: e.target.value });
                                    if (error) setError(null);
                                }}
                                placeholder="e.g. Senior Machine Learning Engineer"
                                className={`w-full px-4 py-3 rounded-lg border ${error && !formData.headline.trim() ? 'border-accent-red' : 'border-slate-200'} focus:border-accent-red focus:ring-1 focus:ring-accent-red outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900`}
                            />
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-100"></div>

                    {/* Verification Oracles */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Beaker className="w-4 h-4 text-slate-400" /> Connect Verification Oracles
                        </h3>

                        <div className="grid grid-cols-1 gap-4">

                            {/* GitHub Input */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover-red-outline group transition-all">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-accent-red group-hover:border-accent-red transition-all shadow-sm">
                                    <Github className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={formData.github_url}
                                        onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                                        placeholder="GitHub Profile URL"
                                        className="w-full bg-transparent border-none outline-none font-mono text-sm placeholder:text-slate-400 text-slate-900"
                                    />
                                </div>
                            </div>

                            {/* HackerRank Input */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover-red-outline group transition-all">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-accent-red group-hover:border-accent-red transition-all shadow-sm">
                                    <Code2 className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={formData.hackerrank_url}
                                        onChange={e => setFormData({ ...formData, hackerrank_url: e.target.value })}
                                        placeholder="HackerRank Profile URL"
                                        className="w-full bg-transparent border-none outline-none font-mono text-sm placeholder:text-slate-400 text-slate-900"
                                    />
                                </div>
                            </div>

                            {/* LinkedIn Input */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover-red-outline group transition-all">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-accent-red group-hover:border-accent-red transition-all shadow-sm">
                                    <Linkedin className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={formData.linkedin_url}
                                        onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                                        placeholder="LinkedIn Profile URL"
                                        className="w-full bg-transparent border-none outline-none font-mono text-sm placeholder:text-slate-400 text-slate-900"
                                    />
                                </div>
                            </div>

                            {/* Academic Input */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover-red-outline group transition-all">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-accent-red group-hover:border-accent-red transition-all shadow-sm">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={formData.education}
                                        onChange={e => setFormData({ ...formData, education: e.target.value })}
                                        placeholder="University Name (e.g. Stanford University)"
                                        className="w-full bg-transparent border-none outline-none font-mono text-sm placeholder:text-slate-400 text-slate-900"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Resume Upload Box */}
                        <label className="w-full bg-white border-2 border-dashed border-slate-300 hover:border-accent-red hover:bg-red-50/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group">
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setResumeFile(e.target.files[0]);
                                    }
                                }}
                            />
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all shadow-sm ${resumeFile ? 'bg-accent-red text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-accent-red group-hover:text-white'}`}>
                                {resumeFile ? <ShieldCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                            </div>
                            <h4 className={`font-bold ${resumeFile ? 'text-accent-red' : 'text-slate-700 group-hover:text-accent-red'}`}>
                                {resumeFile ? resumeFile.name : 'Upload Resume PDF'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">Extract professional trajectory.</p>
                        </label>

                        {/* Transcript Upload Box */}
                        <label className="w-full bg-white border-2 border-dashed border-slate-300 hover:border-accent-red hover:bg-red-50/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group">
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setTranscriptFile(e.target.files[0]);
                                    }
                                }}
                            />
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all shadow-sm ${transcriptFile ? 'bg-accent-red text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-accent-red group-hover:text-white'}`}>
                                {transcriptFile ? <ShieldCheck className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                            </div>
                            <h4 className={`font-bold ${transcriptFile ? 'text-accent-red' : 'text-slate-700 group-hover:text-accent-red'}`}>
                                {transcriptFile ? transcriptFile.name : 'Upload Transcript PDF'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">Extract foundational academics.</p>
                        </label>
                    </div>

                </div>

                {error && (
                    <div className="px-8 mt-4 text-accent-red font-medium text-sm flex items-center justify-center animate-in fade-in">
                        {error}
                    </div>
                )}

                {/* Footer Submit */}
                <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-accent-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                Vectorizing...
                            </>
                        ) : (
                            <>
                                Generate Your spArc <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>

        </div>
    );
}
