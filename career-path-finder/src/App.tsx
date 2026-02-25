import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import OrgDashboard from './pages/OrgDashboard';
import CollegeDashboard from './pages/CollegeDashboard';
import Home from './pages/Home';
import {
  Rocket, Search, Map, Building2, User, Bell, Settings,
  Github, Code2, Linkedin, FileText, GraduationCap, Globe, FolderGit2, Plus
} from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-accent-red/20 selection:text-accent-red">

        {/* Top Navigation Bar */}
        <nav className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-6 flex justify-between items-center shadow-sm">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-accent-red flex items-center justify-center shadow-sm">
              <Rocket className="w-5 h-5 text-accent-red" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
              Arc<span className="text-accent-red">.ai</span>
            </h1>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex gap-8 items-center bg-slate-50 px-6 py-2 rounded-full border border-slate-200">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-accent-red transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" /> Search
            </Link>
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-accent-red transition-colors flex items-center gap-2">
              <Map className="w-4 h-4" /> Career Arcs
            </Link>
            <Link to="/org" className="text-sm font-medium text-slate-600 hover:text-accent-red transition-colors flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Organizations
            </Link>
            <div className="w-px h-4 bg-slate-300 mx-2"></div>
            <Link to="/dashboard" className="text-sm font-bold text-accent-red flex items-center gap-2">
              <User className="w-4 h-4" /> My ArcProfile
            </Link>
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
            <div className="w-9 h-9 rounded-full bg-accent-red/20 p-[2px] cursor-pointer hover:bg-accent-red transition-colors">
              <div className="w-full h-full rounded-full bg-white border border-accent-red/30 flex items-center justify-center">
                <span className="text-xs font-bold text-accent-red">AC</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Layout Grid */}
        <div className="flex flex-1 overflow-hidden">

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto relative h-[calc(100vh-4rem)] scroll-smooth px-8 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/org" element={<OrgDashboard />} />
              <Route path="/college" element={<CollegeDashboard />} />
            </Routes>
          </main>

        </div>
      </div>
    </Router>
  );
}

export default App;
