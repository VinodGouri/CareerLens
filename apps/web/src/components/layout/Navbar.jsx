import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  User, 
  FileText, 
  CheckSquare, 
  BookOpen, 
  Sparkles, 
  LayoutDashboard, 
  ShieldCheck, 
  FileSearch,
  ChevronDown,
  Bookmark,
  Settings,
  LogOut
} from 'lucide-react';
import { useCareer } from '../../context/CareerContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, activePersona, switchPersona, setIsAIChatOpen } = useCareer();

  const handleLogout = () => {
    localStorage.removeItem('careerlens_token');
    localStorage.removeItem('careerlens_onboarded');
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'Explore Jobs', icon: Compass },
    { to: '/saved', label: 'Saved', icon: Bookmark },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/resume', label: 'Resume', icon: FileText },
    { to: '/resume-analyzer', label: 'ATS Analyzer', icon: FileSearch },
    { to: '/applications', label: 'Tracker', icon: CheckSquare },
    { to: '/learning', label: 'Learn', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/admin', label: 'Admin', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-[2px] shadow-glow-primary transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-cyan animate-pulse-subtle" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
                  CareerLens
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Career Intelligence Layer</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Persona Switcher & AI Assistant Button */}
          <div className="flex items-center gap-3">
            
            {/* Persona Switcher Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 hover:border-brand-500/40 cursor-pointer text-xs transition-all">
                <div className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
                <div className="text-left hidden md:block">
                  <p className="text-[10px] text-slate-400 font-medium">Active Persona</p>
                  <p className="font-semibold text-slate-200 leading-tight">
                    {activePersona === 'user_fresher_01' ? 'Rahul (Fresher)' : 'Priya (1.5 YOE)'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
              </div>

              {/* Persona Options Dropdown */}
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl p-2 hidden group-hover:block transition-all border border-white/15">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Test Personas (PRD Scenarios)
                </p>
                <button
                  onClick={() => switchPersona('user_fresher_01')}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors mb-1 ${
                    activePersona === 'user_fresher_01' ? 'bg-brand-500/20 text-brand-200 border border-brand-500/30' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="font-semibold">Rahul Sharma (Persona 1)</div>
                  <div className="text-[11px] text-slate-400">B.Tech Fresher · React, Node.js, MongoDB</div>
                </button>
                <button
                  onClick={() => switchPersona('user_junior_02')}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                    activePersona === 'user_junior_02' ? 'bg-brand-500/20 text-brand-200 border border-brand-500/30' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="font-semibold">Priya Nair (Persona 2)</div>
                  <div className="text-[11px] text-slate-400">1.5 YOE Frontend · Transitioning to Full Stack</div>
                </button>

                <div className="border-t border-white/10 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAIChatOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white text-xs font-bold shadow-glow-primary hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Copilot</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex xl:hidden overflow-x-auto py-2.5 border-t border-white/5 gap-2 no-scrollbar">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
