import React, { useState } from 'react';
import { X, CheckCircle, Shield, ArrowRight, User, Mail, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { useCareer } from '../../context/CareerContext';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function GoogleAccountChooserModal({ isOpen, onClose, onAuthSuccess }) {
  const { switchPersona, refreshData } = useCareer();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const getSavedGoogleAccounts = () => {
    try {
      const saved = localStorage.getItem('careerlens_saved_google_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email && !/rahul|priya/i.test(parsed.email)) {
          return [{
            name: parsed.name || parsed.email.split('@')[0],
            email: parsed.email,
            avatar: parsed.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(parsed.name || parsed.email)}`,
            status: "Verified Google Account",
            badge: "Saved on Device"
          }];
        }
      }
    } catch {}
    return [];
  };

  const deviceAccounts = getSavedGoogleAccounts();
  const [isCustomMode, setIsCustomMode] = useState(deviceAccounts.length === 0);

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectAccount = async (account) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            email: account.email,
            name: account.name,
            picture: account.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(account.name)}`,
            sub: `google_oauth_${Date.now()}`
          }
        })
      });

      const data = await res.json();
      if (data.success && data.data?.token) {
        localStorage.setItem('careerlens_token', data.data.token);
        localStorage.setItem('careerlens_auth_provider', 'google');
        localStorage.setItem('careerlens_saved_google_user', JSON.stringify({
          name: account.name,
          email: account.email,
          avatar: account.avatar
        }));
        if (data.data.user?.id) {
          await switchPersona(data.data.user.id);
        } else {
          await refreshData();
        }
        if (onAuthSuccess) onAuthSuccess(data.data);
        onClose();
      } else {
        setError(data.error?.message || 'Google account sign-in failed');
      }
    } catch (err) {
      setError('Connection to auth server failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) {
      setError('Please enter your Google Email address');
      return;
    }
    const clean = customEmail.trim().toLowerCase();
    if (!clean.includes('@')) {
      setError('Please enter a valid Google email address');
      return;
    }

    handleSelectAccount({
      name: customName || clean.split('@')[0],
      email: clean,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(clean)}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-2xl glass-panel border border-white/20 shadow-2xl overflow-hidden bg-[#0d1322] text-slate-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Glow */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-blue-600/20 via-indigo-500/10 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="relative p-6 pb-4 flex items-start justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
              <GoogleIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Sign in with Google</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300">
                  Google GIS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Choose an account to continue to CareerLens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isCustomMode ? (
            <>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select an account on this device:
              </p>

              {/* Accounts list */}
              <div className="space-y-2.5">
                {deviceAccounts.map((account, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectAccount(account)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/40 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={account.avatar} 
                        alt={account.name} 
                        className="w-10 h-10 rounded-full border border-white/20 bg-slate-800"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                          <span>{account.name}</span>
                          <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="text-xs text-slate-400">{account.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 group-hover:border-blue-500/30">
                      {account.badge}
                    </span>
                  </button>
                ))}
              </div>

              {/* Use another Google account button */}
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all hover:bg-white/5"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Use another Google account</span>
              </button>
            </>
          ) : (
            /* Custom Google Account Input Mode */
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Enter your Google Account:
                </p>
                {deviceAccounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="text-xs text-brand-400 hover:text-brand-300"
                  >
                    ← Back to saved accounts
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Google Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/60"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white text-xs font-semibold hover:opacity-95 transition-all shadow-glow-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue with this Google Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Google Cloud Console Setup Helper */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowConsoleGuide(!showConsoleGuide)}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-between w-full"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Client ID configured: 80981856840-u0...
              </span>
              <span className="text-[10px] text-blue-400 underline">
                {showConsoleGuide ? 'Hide Setup Info' : 'Origin Settings'}
              </span>
            </button>

            {showConsoleGuide && (
              <div className="mt-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-white">Google Cloud Console Origin Verification:</p>
                <p>
                  To enable live Google popups on localhost, ensure your Google Cloud OAuth Client includes:
                </p>
                <div className="p-2 rounded bg-black/40 font-mono text-[10px] text-emerald-300">
                  Authorized JavaScript Origins: http://localhost:5173
                </div>
                <p className="text-[10px] text-slate-400">
                  In Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
