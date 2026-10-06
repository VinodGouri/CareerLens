import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, AlertCircle, 
  CheckCircle, KeyRound, RefreshCw, ShieldCheck, UserPlus 
} from 'lucide-react';
import { useCareer } from '../../context/CareerContext';
import { fetchAuthConfig, promptGoogleIdentityServices } from '../../utils/googleAuth';
import GoogleAccountChooserModal from '../../components/auth/GoogleAccountChooserModal';
import OAuthModal from '../../components/auth/OAuthModal';

/* ─── Inline SVG Social Icons ─── */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
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

/* ─── Animated Ambient Particle ─── */
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

  // Mode: 'password' or 'otp'
  const [loginMethod, setLoginMethod] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtpCode, setDevOtpCode] = useState(null);
  const otpInputRefs = useRef([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notRegisteredError, setNotRegisteredError] = useState(false);
  const [success, setSuccess] = useState('');

  // Google & OAuth Modals
  const [googleChooserOpen, setGoogleChooserOpen] = useState(false);
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [authConfig, setAuthConfig] = useState(null);

  useEffect(() => {
    fetchAuthConfig().then(cfg => setAuthConfig(cfg));
    const savedEmail = localStorage.getItem('careerlens_email');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Google Sign-In with device account chooser
  const handleGoogleSignIn = () => {
    const clientId = authConfig?.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;

    promptGoogleIdentityServices({
      clientId,
      onSuccess: async (authData) => {
        localStorage.setItem('careerlens_token', authData.token);
        if (authData.user?.id) {
          await switchPersona(authData.user.id);
        }
        navigate('/');
      },
      onError: (err) => {
        setError(typeof err === 'string' ? err : 'Google authentication failed');
      },
      onFallback: () => {
        setGoogleChooserOpen(true);
      }
    });
  };

  // Submit Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNotRegisteredError(false);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      const data = await res.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('careerlens_token', data.data.token);
        if (rememberMe) {
          localStorage.setItem('careerlens_email', cleanEmail);
        } else {
          localStorage.removeItem('careerlens_email');
        }
        setSuccess('Welcome back! Redirecting to dashboard...');
        if (data.data.user?.id) {
          await switchPersona(data.data.user.id);
        }
        setTimeout(() => navigate('/'), 600);
      } else {
        const msg = data.error?.message || 'Invalid credentials';
        setError(msg);
        // Detect if email is not registered
        if (res.status === 404 || msg.toLowerCase().includes('only registered') || msg.toLowerCase().includes('not found')) {
          setNotRegisteredError(true);
        }
      }
    } catch {
      setError('Unable to connect to authentication server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send Login OTP to registered email
  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setError('');
    setNotRegisteredError(false);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, purpose: 'LOGIN' })
      });
      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setResendCooldown(45);
        setSuccess(`Verification code sent to ${cleanEmail}`);
        if (data.data?.devOtp) setDevOtpCode(data.data.devOtp);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      } else {
        const msg = data.error?.message || 'Could not send verification code';
        setError(msg);
        if (res.status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('register first')) {
          setNotRegisteredError(true);
        }
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit OTP Login
  const handleVerifyOtpLogin = async (e) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code sent to your email');
      return;
    }

    setIsLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: code })
      });
      const data = await res.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('careerlens_token', data.data.token);
        setSuccess('Authentication verified! Redirecting...');
        if (data.data.user?.id) {
          await switchPersona(data.data.user.id);
        }
        setTimeout(() => navigate('/'), 600);
      } else {
        setError(data.error?.message || 'Invalid or expired verification code');
      }
    } catch {
      setError('Login verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1);
    setOtpDigits(newDigits);
    if (error) setError('');

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const focusIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#070a12] text-slate-100">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[#070a12]" />
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(16,185,129,0.1) 0%, transparent 50%)'
        }} 
      />

      {/* Floating particles */}
      <FloatingParticle delay={0} size="120px" x={10} y={20} duration={15} />
      <FloatingParticle delay={2} size="80px" x={70} y={10} duration={18} />
      <FloatingParticle delay={4} size="60px" x={85} y={60} duration={12} />
      <FloatingParticle delay={6} size="100px" x={30} y={70} duration={20} />

      {/* Left Side — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 xl:px-24">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
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

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
            Your career,{' '}
            <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-accent-emerald bg-clip-text text-transparent">
              intelligently mapped.
            </span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed mb-8">
            Verified candidate access. Explore aggregated job openings, analyze skill compatibility, and bridge learning gaps.
          </p>

          {/* Highlights */}
          <div className="space-y-3.5">
            {[
              { icon: '🎯', text: 'Real-time AI match score for every verified job opening' },
              { icon: '🧠', text: 'Precision skill-gap analysis with actionable roadmap resources' },
              { icon: '📄', text: 'ATS-optimized resume intelligence & XYZ bullet enhancer' },
              { icon: '🔒', text: 'Secure authentication via Google Identity & Real Email OTP' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                <span className="text-base">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Persona quick preview notice */}
          <div className="mt-10 pt-6 border-t border-white/10 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">Registered-Only Security: </span>
            <span>Only verified email addresses can access the platform.</span>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form Card */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-12 lg:px-16 py-10 relative z-10">
        <div className="w-full max-w-md">

          {/* Form Card */}
          <div className="glass-panel rounded-2xl p-7 sm:p-9 shadow-2xl border border-white/15 bg-[#0b101d]/90 backdrop-blur-xl">
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-xs text-slate-400">Sign in to continue your career journey</p>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-2 animate-shake">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
                {notRegisteredError && (
                  <div className="pt-2 border-t border-red-500/20 flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">New to CareerLens?</span>
                    <Link
                      to="/register"
                      className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Register Now</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Google Sign-In with device account chooser */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all shadow-md group hover:shadow-glow-cyan"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0b101d] px-3 text-slate-400 font-medium">or continue with email</span>
              </div>
            </div>

            {/* Login Method Toggle: Password vs OTP */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 mb-5">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setError('');
                  setNotRegisteredError(false);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  loginMethod === 'password'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Password Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp');
                  setError('');
                  setNotRegisteredError(false);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  loginMethod === 'otp'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Email OTP Sign In
              </button>
            </div>

            {/* ─── TAB A: Password Login ─── */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="rahul.sharma@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter your account password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-white/5 border-white/20 text-brand-500 focus:ring-0"
                    />
                    <span className="text-slate-400 hover:text-slate-300">Remember email</span>
                  </label>
                  <Link to="/forgot-password" className="text-brand-400 hover:text-brand-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white font-semibold text-xs shadow-glow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ─── TAB B: Email OTP Login ─── */}
            {loginMethod === 'otp' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendLoginOtp} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Registered Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError('');
                          }}
                          placeholder="yourname@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 pt-0.5">
                        We'll send a 6-digit login passcode to your registered inbox.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white font-semibold text-xs shadow-glow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Login Passcode</span>
                          <KeyRound className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtpLogin} className="space-y-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Passcode sent to:</div>
                        <div className="font-semibold text-white">{email}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpDigits(['', '', '', '', '', '']);
                        }}
                        className="text-brand-400 hover:text-brand-300 text-xs underline"
                      >
                        Change
                      </button>
                    </div>

                    {devOtpCode && (
                      <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Dev Login Passcode:</span>
                          <button
                            type="button"
                            onClick={() => setOtpDigits(devOtpCode.split(''))}
                            className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 hover:bg-brand-500/40"
                          >
                            Auto-Fill
                          </button>
                        </div>
                        <div className="font-mono text-sm font-bold tracking-widest text-accent-cyan mt-1">
                          {devOtpCode}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block text-center">
                        Enter 6-Digit Passcode
                      </label>
                      <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpInputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-10 h-12 sm:w-11 sm:h-13 text-center font-mono text-lg font-bold rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otpDigits.join('').length !== 6}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-semibold text-xs shadow-glow-emerald hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Verify & Sign In</span>
                          <CheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      {resendCooldown > 0 ? (
                        <span className="text-xs text-slate-400">
                          Resend code in <span className="text-brand-300 font-semibold">{resendCooldown}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={handleSendLoginOtp}
                          className="text-xs text-brand-400 hover:text-brand-300 flex items-center justify-center gap-1 mx-auto"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Resend OTP code</span>
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Sign Up Link */}
            <p className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-white/10">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Google Account Chooser Modal (Displays all accounts on device) */}
      <GoogleAccountChooserModal
        isOpen={googleChooserOpen}
        onClose={() => setGoogleChooserOpen(false)}
        onAuthSuccess={async () => {
          navigate('/');
        }}
      />

      {/* Other OAuth Modal */}
      <OAuthModal 
        isOpen={oauthModalOpen}
        onClose={() => setOauthModalOpen(false)}
        provider={selectedProvider}
        redirectPath="/"
      />
    </div>
  );
}
