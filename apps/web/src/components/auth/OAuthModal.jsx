import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Shield, ArrowRight, ExternalLink, Sparkles, User, Mail, Briefcase } from 'lucide-react';
import { useCareer } from '../../context/CareerContext';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 text-[#0A66C2]" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 text-white" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function OAuthModal({ isOpen, onClose, provider = 'google', redirectPath = '/' }) {
  const navigate = useNavigate();
  const { switchPersona, refreshData } = useCareer();
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'custom'
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [error, setError] = useState('');

  // Custom OAuth input states
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState('Software Engineer');

  if (!isOpen) return null;

  // Provider configuration
  const config = {
    google: {
      name: 'Google',
      icon: <GoogleIcon />,
      badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      headerGradient: 'from-blue-600/20 via-red-500/10 to-transparent',
      title: 'Sign in with Google',
      subtitle: 'Fast, secure authentication using your Google Identity',
      scopes: [
        'Read your basic profile information (name, avatar, locale)',
        'Verify your primary email address',
        'Import authenticated credentials into CareerLens'
      ],
      defaultProfiles: [
        {
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          subtitle: 'Fresher / B.Tech CSE (Google Workspace)',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
        },
        {
          name: 'Priya Nair',
          email: 'priya.nair@example.com',
          subtitle: 'Associate Developer (PES Alum)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
        }
      ]
    },
    linkedin: {
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      badgeColor: 'border-[#0A66C2]/30 bg-[#0A66C2]/10 text-[#70b5f9]',
      headerGradient: 'from-[#0A66C2]/25 via-blue-900/10 to-transparent',
      title: 'Sign in with LinkedIn',
      subtitle: 'Connect your verified professional identity & skill endorsements',
      scopes: [
        'Import professional headline, work experience & company badges',
        'Sync LinkedIn verified skill assessment badges & endorsements',
        'Auto-populate ATS resume and AI compatibility profile'
      ],
      defaultProfiles: [
        {
          name: 'Priya Nair',
          email: 'priya.nair@example.com',
          subtitle: 'Frontend Engineer @ CognitiveCloud (1.5 YOE)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
        },
        {
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          subtitle: 'Full Stack Engineer | JNTUH 2025',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
        }
      ]
    },
    github: {
      name: 'GitHub',
      icon: <GitHubIcon />,
      badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      headerGradient: 'from-purple-900/25 via-slate-800/20 to-transparent',
      title: 'Sign in with GitHub',
      subtitle: 'Authenticate via GitHub & sync developer repositories and code evidence',
      scopes: [
        'Import public repositories, commit activity and pinned projects',
        'Verify programming languages (JavaScript, React, Node.js, TypeScript)',
        'Generate AI skill evidence directly from repository commits'
      ],
      defaultProfiles: [
        {
          name: 'Rahul Sharma (rahulsharma-dev)',
          email: 'rahul.sharma@example.com',
          subtitle: '2 Featured Repositories • 1,200+ Users Served',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
        },
        {
          name: 'Priya Nair (priyanair)',
          email: 'priya.nair@example.com',
          subtitle: 'DevPulse Creator • TypeScript / React Contributor',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
        }
      ]
    }
  }[provider] || {
    name: provider,
    icon: <GoogleIcon />,
    title: `Sign in with ${provider}`,
    subtitle: 'OAuth 2.0 authentication',
    scopes: ['Read profile', 'Verify email'],
    defaultProfiles: []
  };

  const executeOAuthLogin = async (payload) => {
    setIsAuthenticating(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/auth/oauth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('careerlens_token', data.data.token);
        localStorage.setItem('careerlens_auth_provider', provider);
        setAuthSuccess(true);

        if (data.data.user?.id) {
          await switchPersona(data.data.user.id);
        } else {
          await refreshData();
        }

        setTimeout(() => {
          onClose();
          navigate(redirectPath);
        }, 700);
      } else {
        setError(data.error?.message || 'OAuth authentication failed');
        setIsAuthenticating(false);
      }
    } catch (err) {
      setError('Connection to auth server failed. Please try again.');
      setIsAuthenticating(false);
    }
  };

  const handleQuickProfileSelect = (prof) => {
    executeOAuthLogin({
      email: prof.email,
      name: prof.name.split(' (')[0],
      avatarUrl: prof.avatar
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) {
      setError('Please provide an email address');
      return;
    }
    executeOAuthLogin({
      name: customName || `${config.name} User`,
      email: customEmail,
      targetRole: customRole
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-2xl glass-panel border border-white/15 shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Glow */}
        <div className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b ${config.headerGradient} pointer-events-none`} />

        {/* Modal Header */}
        <div className="relative p-6 pb-4 flex items-start justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
              {config.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{config.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
                  OAuth 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{config.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isAuthenticating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State Overlay */}
        {authSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Authenticated via {config.name}!</h4>
            <p className="text-xs text-slate-300">Synchronizing career profile & credentials. Redirecting...</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Tab switch between 1-Click Persona vs Custom Identity */}
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'quick' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ 1-Click Candidate Profiles
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'custom' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                ✏️ Custom {config.name} Identity
              </button>
            </div>

            {/* TAB 1: 1-Click Fast Accounts */}
            {activeTab === 'quick' && (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select an account to authorize:
                </p>
                <div className="space-y-2">
                  {config.defaultProfiles.map((prof, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAuthenticating}
                      onClick={() => handleQuickProfileSelect(prof)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-500/40 text-left transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prof.avatar}
                          alt={prof.name}
                          className="w-9 h-9 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                            {prof.name}
                          </p>
                          <p className="text-xs text-slate-400">{prof.email}</p>
                          <p className="text-[10px] text-accent-cyan mt-0.5">{prof.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 group-hover:translate-x-1 transition-transform">
                        <span>Connect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Custom Identity */}
            {activeTab === 'custom' && (
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={`e.g. Alex Rivera`}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{config.name} Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder={`e.g. alex.${provider}@gmail.com`}
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target Domain / Role</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Developer"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-95 transition-all shadow-glow-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authorize & Create {config.name} Session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Permissions / Scopes info */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-brand-400" />
                Permissions Requested by CareerLens
              </p>
              <ul className="space-y-1">
                {config.scopes.map((scope, idx) => (
                  <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <span className="text-accent-emerald mt-0.5">•</span>
                    <span>{scope}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer notice */}
            <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
              <span>Encrypted with SHA-256 TLS. No private keys stored.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
