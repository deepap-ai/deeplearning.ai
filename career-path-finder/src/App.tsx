import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OrgDashboard from './pages/OrgDashboard';
import CollegeDashboard from './pages/CollegeDashboard';
import Home from './pages/Home';
import ProfileBuilder from './pages/ProfileBuilder';
import NavigateDashboard from './pages/NavigateDashboard';
import ReviewMock from './pages/ReviewMock';
import CandidateProfilePage from './pages/CandidateProfilePage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ExploreDashboard from './pages/ExploreDashboard';
import {
  Compass, Search, Building2, User, Bell, Settings, GraduationCap,
} from 'lucide-react';
import GlobalSearchModal from './components/GlobalSearchModal';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' as const } },
};

function NavLink({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  const { pathname } = useLocation();
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
  return (
    <Link to={to} className={`text-sm font-medium transition-colors flex items-center gap-2 ${isActive ? 'text-accent-red font-bold' : 'text-slate-600 hover:text-accent-red'}`}>
      <Icon className="w-4 h-4" /> {label}
    </Link>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/org" element={<OrgDashboard />} />
          <Route path="/org/:company_id" element={<OrgDashboard />} />
          <Route path="/college" element={<CollegeDashboard />} />
          <Route path="/college/:col_id" element={<CollegeDashboard />} />
          <Route path="/navigate" element={<NavigateDashboard />} />
          <Route path="/navigate/:persona_id" element={<NavigateDashboard />} />
          <Route path="/build" element={<ProfileBuilder />} />
          <Route path="/review" element={<ReviewMock />} />
          <Route path="/recruiter" element={<RecruiterDashboard />} />
          <Route path="/explore" element={<ExploreDashboard />} />

          {/* Catch-all dynamic route for candidates. Must be last! */}
          <Route path="/:candidateName" element={<CandidateProfilePage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppShell() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userInitials, setUserInitials] = useState<string>('SA');

  useEffect(() => {
    const stored = localStorage.getItem('userInitials');
    if (stored) setUserInitials(stored);

    const handleUpdate = (e: any) => setUserInitials(e.detail.initials);
    window.addEventListener('userInitialsUpdated', handleUpdate);
    return () => window.removeEventListener('userInitialsUpdated', handleUpdate);
  }, []);

  // Allow Cmd+K to open search globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-accent-red/20 selection:text-accent-red">

      {/* Top Navigation Bar */}
      <nav className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-6 flex justify-between items-center shadow-sm">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-accent-red flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5 text-accent-red" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
            spArc AI
          </h1>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex gap-8 items-center bg-slate-50 px-6 py-2 rounded-full border border-slate-200">
          <button onClick={() => setIsSearchOpen(true)} className="text-sm font-bold text-slate-600 hover:text-accent-red transition-colors flex items-center gap-2 group">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-accent-red" /> Search
            <div className="flex items-center gap-0.5 ml-2 opacity-60">
              <kbd className="font-sans text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5">⌘</kbd>
              <kbd className="font-sans text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5">K</kbd>
            </div>
          </button>
          <NavLink to="/recruiter" icon={Search} label="Talent Search" />
          <NavLink to="/navigate" icon={User} label="My spArc AI" />
          <NavLink to="/org" icon={Building2} label="Organizations" />
          <NavLink to="/college" icon={GraduationCap} label="Colleges" />
        </div>

        {/* User Profile Right */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-500 hover:text-accent-red transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full"></span>
          </button>
          <button className="p-2 text-slate-500 hover:text-accent-red transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-full bg-accent-red/20 p-0.5 cursor-pointer hover:bg-accent-red transition-colors">
            <div className="w-full h-full rounded-full bg-white border border-accent-red/30 flex items-center justify-center">
              <span className="text-xs font-bold text-accent-red">{userInitials}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout Grid */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative h-[calc(100vh-4rem)] scroll-smooth px-8 py-6">
          <AnimatedRoutes />
        </main>

      </div>

      {/* The Global Search Command Palette */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
