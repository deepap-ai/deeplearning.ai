import { ShieldCheck, Target, Terminal, X, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerificationTraceModal({
    isOpen,
    onClose,
    skillName,
    candidateName
}: {
    isOpen: boolean;
    onClose: () => void;
    skillName: string;
    candidateName: string;
}) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Verification Trace: {skillName}</h3>
                                <p className="text-sm text-slate-500 font-medium">Audit Oracle Run • {candidateName}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row flex-1 min-h-[400px] overflow-hidden">
                        {/* Terminal Trace Left */}
                        <div className="flex-1 bg-slate-900 text-slate-300 p-6 overflow-y-auto font-mono text-xs leading-relaxed flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-slate-500 mb-2">
                                <Terminal className="w-4 h-4" /> Agentic Execution Trace
                            </div>
                            
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                                <span className="text-blue-400">$ init</span> Audit Sequence against GitHub provider...
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                <span className="text-green-400">[OK]</span> Target repository identified: <code>alex/os-scheduler-lab</code>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                                <span className="text-blue-400">$ analyze</span> AST Extraction and Semantic Parsing...
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                                <span className="text-purple-400">[REASONING]</span> Detected implementation of round-robin algorithms and custom mutex locks. Wait queues are properly handled. The structure explicitly matches the constraints of a Deterministic Evaluator.
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
                                <span className="text-purple-400">[REASONING]</span> Commit history shows iterative debugging of race conditions over a 2-week period, not a copy-paste job. Real human-in-the-loop problem solving verified.
                            </motion.div>
                            
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }} className="mt-4 pt-4 border-t border-slate-700">
                                <span className="text-green-500 font-bold text-sm">Conclusion: High Confidence Signal Detected.</span>
                                <div className="mt-2 text-slate-400">Awarding "Deterministic Eval Frameworks" (Intensity: 0.98)</div>
                            </motion.div>
                        </div>

                        {/* Artifact View Right */}
                        <div className="flex-1 bg-white p-6 border-l border-slate-100 overflow-y-auto flex flex-col gap-4">
                            <div className="flex items-center justify-between text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                                <span className="flex items-center gap-2"><Code2 className="w-4 h-4 text-accent-red" /> The Artifact </span>
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">scheduler.c</span>
                            </div>
                            <div className="relative">
                                {/* Decorative line numbers */}
                                <div className="absolute left-2 top-4 bottom-4 w-6 border-r border-slate-200 flex flex-col text-[10px] text-slate-400 font-mono text-right pr-2">
                                    <span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span>
                                </div>
                                <pre className="bg-slate-50 p-4 pl-12 rounded-xl text-xs font-mono text-slate-800 overflow-x-auto border border-slate-200 shadow-inner">
{`void schedule() {
    struct proc *p;
    
    acquire(&ptable.lock);
    for(p = ptable.proc; p < &ptable.proc[NPROC]; p++){
        if(p->state != RUNNABLE)
            continue;
            
        // Switch to chosen process.  It is the process's job
        // to release ptable.lock and then reacquire it
        // before jumping back to us.
        c->proc = p;
        switchuvm(p);
        p->state = RUNNING;
        swtch(&(c->scheduler), p->context);
        switchkvm();`}</pre>
                            </div>
                            
                            <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 mt-auto">
                                <h4 className="font-bold text-red-900 text-sm mb-1 flex items-center gap-1"><Target className="w-4 h-4 text-red-600" /> Recruiter Takeaway</h4>
                                <p className="text-xs text-red-800/80 leading-relaxed font-medium">This is cryptographically verified proof-of-work. The candidate didn't just write "OS" on a resume; they built a functioning CPU scheduler capable of managing lock contention. This meets the criteria for Tier-1 Systems Engineering.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
