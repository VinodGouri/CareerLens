import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  LogOut, 
  ExternalLink, 
  Activity, 
  Server, 
  Terminal, 
  Cpu, 
  Layers, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  Database
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('careerlens_admin');
      if (stored) {
        setAdminUser(JSON.parse(stored));
      } else {
        setAdminUser({
          name: 'System Administrator',
          email: 'admin@careerlens.io',
          role: 'SYSTEM_ADMIN'
        });
      }
    } catch (e) {
      setAdminUser({
        name: 'System Administrator',
        email: 'admin@careerlens.io',
        role: 'SYSTEM_ADMIN'
      });
    }
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('careerlens_admin_token');
    localStorage.removeItem('careerlens_admin');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Admin Ambient Lighting Accents - Distinct Deep Indigo & Crimson Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 radial-glow pointer-events-none z-0 opacity-40" />
      <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Security Clearance Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-950/80 border-b border-purple-500/20 text-xs py-1.5 px-4 backdrop-blur-md relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-purple-200/80">
          <div className="flex items-center gap-2 font-mono">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="font-semibold text-purple-300">ADMINISTRATIVE ACCESS CONTROL</span>
            <span className="hidden sm:inline text-purple-400/50">|</span>
            <span className="hidden sm:inline text-[11px] text-purple-300/60">Privileged Session • Audit Logging Enabled</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Server Online
            </span>
            <span className="text-purple-400/40">|</span>
            <Link 
              to="/" 
              className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors group"
              title="Return to standard candidate portal"
            >
              <span>Candidate Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Admin Navbar */}
      <header className="sticky top-0 z-40 w-full bg-[#0b0f1a]/80 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Admin Brand & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-brand-500 p-[2px] shadow-lg shadow-purple-900/30">
                <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-purple-100 to-indigo-300 bg-clip-text text-transparent">
                    CareerLens Admin
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    CONSOLE v2.4
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Engine Orchestration & Ingestion Telemetry
                </p>
              </div>
            </div>

            {/* Quick Actions & Admin Account */}
            <div className="flex items-center gap-4">
              {/* Admin Identity Badge */}
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  AD
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-white leading-tight">
                    {adminUser?.name || 'System Administrator'}
                  </p>
                  <p className="text-[10px] text-purple-300/80 font-mono">
                    {adminUser?.email || 'admin@careerlens.io'}
                  </p>
                </div>
              </div>

              {/* Sign Out Admin Button */}
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-200 active:scale-95"
                title="End administrator session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* Admin Dedicated Footer */}
      <footer className="border-t border-white/10 py-6 mt-12 relative z-10 bg-[#090d18]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white">CareerLens Infrastructure & Admin Hub</span>
            <span>•</span>
            <span className="text-slate-500">ISO/SOC2 Access Controls</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Cluster: in-hyd-node-01</span>
            <span>•</span>
            <span className="text-purple-400">Restricted Admin Environment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
