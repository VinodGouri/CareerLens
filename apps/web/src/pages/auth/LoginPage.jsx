import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useCareer } from '../../context/CareerContext';
import OAuthModal from '../../components/auth/OAuthModal';

/* ─── Inline SVG Social Icons ─── */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#0A66C2]" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

/* ─── Animated Particles ─── */
function FloatingParticle({ delay, size, x, y, duration }) {
  return (
    <div
      className="absolute rounded-full opacity-20 animate-float pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { switchPersona } = useCareer();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('google');

  const handleOpenOAuth = (provider) => {
    setSelectedProvider(provider);
    setOauthModalOpen(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('careerlens_token', data.data.token);
        if (rememberMe) {
          localStorage.setItem('careerlens_email', email);
        }
        setSuccess('Login successful! Redirecting...');
        await switchPersona(data.data.user.id);
        setTimeout(() => navigate('/'), 800);
      } else {
        setError(data.error?.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick-login demo personas
  const handleDemoLogin = async (personaId) => {
    setIsLoading(true);
    await switchPersona(personaId);
    localStorage.setItem('careerlens_token', 'demo-jwt-token-careerlens');
    setSuccess('Logged in as demo user!');
    setTimeout(() => navigate('/'), 600);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[#070a12]" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.1) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(16,185,129,0.08) 0%, transparent 50%)'
      }} />

      {/* Floating particles */}
      <FloatingParticle delay={0} size="120px" x={10} y={20} duration={15} />
      <FloatingParticle delay={2} size="80px" x={70} y={10} duration={18} />
      <FloatingParticle delay={4} size="60px" x={85} y={60} duration={12} />
      <FloatingParticle delay={6} size="100px" x={30} y={70} duration={20} />
      <FloatingParticle delay={8} size="40px" x={50} y={40} duration={14} />

      {/* Left Side — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 xl:px-24">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-[2px] shadow-glow-primary">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent-cyan" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-2xl bg-gradient-to-r from-white to-brand-300 bg-clip-text text-transparent">CareerLens</span>
              <span className="ml-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">AI</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
            Your career,{' '}
            <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-accent-emerald bg-clip-text text-transparent">
              intelligently mapped.
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-10">
            Discover jobs across LinkedIn, Indeed & Naukri. Understand your exact fit. Bridge skill gaps. Apply smarter.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: '🎯', text: 'AI-powered match scores for every job' },
              { icon: '🧠', text: 'Skill gap analysis with learning paths' },
              { icon: '📄', text: 'ATS-optimized resume builder' },
              { icon: '📊', text: 'Application tracking dashboard' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="text-lg">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {['bg-brand-500', 'bg-accent-cyan', 'bg-accent-emerald', 'bg-accent-amber'].map((color, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${color} border-2 border-[#070a12] flex items-center justify-center text-xs font-bold text-white`}>
                    {['RS', 'PN', 'AK', 'VD'][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Join 2,400+ early-career professionals</p>
                <p className="text-xs text-slate-400">Already matched to their dream roles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-[2px] shadow-glow-primary">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-cyan" />
              </div>
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-white to-brand-300 bg-clip-text text-transparent">CareerLens AI</span>
          </div>

          {/* Form Card */}
          <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-white/10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-sm text-slate-400">Sign in to continue your career journey</p>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul.sharma@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                    rememberMe ? 'bg-brand-500 border-brand-500' : 'border-white/20 group-hover:border-white/40'
                  }`} onClick={() => setRememberMe(!rememberMe)}>
                    {rememberMe && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-300" onClick={() => setRememberMe(!rememberMe)}>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white font-semibold text-sm shadow-glow-primary hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0e1424] px-3 text-slate-500 font-medium">or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                type="button"
                onClick={() => handleOpenOAuth('google')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                title="Continue with Google"
              >
                <GoogleIcon />
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">Google</span>
              </button>
              <button 
                type="button"
                onClick={() => handleOpenOAuth('linkedin')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#0A66C2]/40 transition-all group"
                title="Continue with LinkedIn"
              >
                <LinkedInIcon />
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">LinkedIn</span>
              </button>
              <button 
                type="button"
                onClick={() => handleOpenOAuth('github')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/40 transition-all group"
                title="Continue with GitHub"
              >
                <GitHubIcon />
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">GitHub</span>
              </button>
            </div>

            {/* OAuth Authorization Modal */}
            <OAuthModal 
              isOpen={oauthModalOpen}
              onClose={() => setOauthModalOpen(false)}
              provider={selectedProvider}
              redirectPath="/"
            />

            {/* Sign Up Link */}
            <p className="text-center text-sm text-slate-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          {/* Demo Quick Access */}
          <div className="mt-6 glass-panel rounded-xl p-4 border border-white/10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">⚡ Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin('user_fresher_01')}
                className="py-2.5 px-3 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold hover:bg-brand-500/20 transition-all text-left"
              >
                <div>Rahul Sharma</div>
                <div className="text-[10px] text-slate-400 mt-0.5">B.Tech Fresher</div>
              </button>
              <button
                onClick={() => handleDemoLogin('user_junior_02')}
                className="py-2.5 px-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-semibold hover:bg-accent-cyan/20 transition-all text-left"
              >
                <div>Priya Nair</div>
                <div className="text-[10px] text-slate-400 mt-0.5">1.5 YOE Frontend</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
