import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, 
  Sparkles, AlertCircle, CheckCircle, Briefcase, MapPin, 
  ShieldCheck, RefreshCw, KeyRound, ExternalLink, Laptop 
} from 'lucide-react';
import { useCareer } from '../../context/CareerContext';
import { fetchAuthConfig, promptGoogleIdentityServices } from '../../utils/googleAuth';
import GoogleAccountChooserModal from '../../components/auth/GoogleAccountChooserModal';
import OAuthModal from '../../components/auth/OAuthModal';

/* ─── Google & Social Icons ─── */
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { switchPersona } = useCareer();

  // Steps: 1: Details & Credentials, 2: OTP Verification, 3: Career Preferences
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    experienceLevel: 'FRESHER',
    preferredRole: 'Full Stack Developer',
    location: 'Bangalore',
    locations: ['Bangalore'],
    workModes: ['HYBRID', 'REMOTE'],
    agreeTerms: true
  });

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationToken, setVerificationToken] = useState(null);
  const [devOtpCode, setDevOtpCode] = useState(null);
  const otpInputRefs = useRef([]);

  // Google & OAuth Modals
  const [googleChooserOpen, setGoogleChooserOpen] = useState(false);
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [authConfig, setAuthConfig] = useState(null);

  useEffect(() => {
    fetchAuthConfig().then(cfg => setAuthConfig(cfg));
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  // Toggle multiple locations
  const toggleLocation = (city) => {
    setForm(prev => {
      const current = prev.locations || [];
      const exists = current.includes(city);
      const updated = exists ? current.filter(c => c !== city) : [...current, city];
      return {
        ...prev,
        locations: updated,
        location: updated[0] || ''
      };
    });
    if (error) setError('');
  };

  // Toggle multiple work modes
  const toggleWorkMode = (modeValue) => {
    setForm(prev => {
      const current = prev.workModes || [];
      const exists = current.includes(modeValue);
      const updated = exists ? current.filter(m => m !== modeValue) : [...current, modeValue];
      return {
        ...prev,
        workModes: updated
      };
    });
    if (error) setError('');
  };

  // Real Email validation
  const validateEmail = (email) => {
    const trimmed = (email || '').trim().toLowerCase();
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!regex.test(trimmed)) {
      return { valid: false, message: 'Please enter a valid real email address (e.g., yourname@gmail.com)' };
    }
    const parts = trimmed.split('@');
    if (parts[1].split('.').pop().length < 2) {
      return { valid: false, message: 'Invalid domain extension in email address' };
    }
    return { valid: true, clean: trimmed };
  };

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
        // Open interactive device account chooser modal
        setGoogleChooserOpen(true);
      }
    });
  };

  // Step 1: Submit info & send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    const emailCheck = validateEmail(form.email);
    if (!emailCheck.valid) {
      setError(emailCheck.message);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailCheck.clean, purpose: 'REGISTER' })
      });
      const data = await res.json();

      if (data.success) {
        setStep(2);
        setResendCooldown(45);
        setSuccessMsg(`Verification code sent to ${emailCheck.clean}`);
        if (data.data?.devOtp) {
          setDevOtpCode(data.data.devOtp);
        }
        // Focus first OTP input
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      } else {
        setError(data.error?.message || 'Failed to dispatch verification code');
      }
    } catch {
      setError('Unable to reach server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP input digits
  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1);
    setOtpDigits(newDigits);
    if (error) setError('');

    // Advance focus
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

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), otp: code })
      });
      const data = await res.json();

      if (data.success && data.data?.verified) {
        setVerificationToken(data.data.verificationToken);
        setSuccessMsg('Email verified successfully!');
        setStep(3); // Proceed to career details
      } else {
        setError(data.error?.message || 'Invalid verification code');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), purpose: 'REGISTER' })
      });
      const data = await res.json();

      if (data.success) {
        setResendCooldown(60);
        setSuccessMsg('New verification code sent to your email.');
        if (data.data?.devOtp) setDevOtpCode(data.data.devOtp);
      } else {
        setError(data.error?.message || 'Failed to resend code');
      }
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Complete Registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!form.agreeTerms) {
      setError('Please agree to the Terms of Service to create your account');
      return;
    }

    if (!form.locations || form.locations.length === 0) {
      setError('Please select at least one preferred location');
      return;
    }

    if (!form.workModes || form.workModes.length === 0) {
      setError('Please select at least one work mode');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          verificationToken,
          experienceLevel: form.experienceLevel,
          preferredRole: form.preferredRole,
          location: form.locations[0] || form.location || 'Bangalore',
          locations: form.locations,
          workModes: form.workModes
        })
      });
      const data = await res.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('careerlens_token', data.data.token);
        if (data.data.user?.id) {
          await switchPersona(data.data.user.id);
        }
        navigate('/onboarding');
      } else {
        setError(data.error?.message || 'Registration failed');
      }
    } catch {
      setError('Registration could not be completed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-emerald-500' },
      { label: 'Strong', color: 'bg-accent-cyan' }
    ];
    return { score, ...levels[Math.min(score, levels.length) - 1] || levels[0] };
  };

  const pwdStrength = getPasswordStrength(form.password);

  const experienceLevels = [
    { value: 'STUDENT', label: 'Student', desc: 'Pursuing degree / College' },
    { value: 'FRESHER', label: 'Fresher', desc: '0-1 year experience' },
    { value: 'JUNIOR', label: 'Junior Dev', desc: '1-3 years experience' },
    { value: 'MID', label: 'Mid-Level', desc: '3+ years experience' }
  ];

  const popularRoles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Analyst', 'UI/UX Designer', 'DevOps Engineer', 'AI / ML Engineer'
  ];

  const cities = ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai', 'Remote'];

  const workModeOptions = [
    { value: 'REMOTE', label: 'Remote', desc: 'Work from anywhere', emoji: '🏠' },
    { value: 'HYBRID', label: 'Hybrid', desc: 'Office & home flexibility', emoji: '🔀' },
    { value: 'ONSITE', label: 'On-site', desc: 'Office-based presence', emoji: '🏢' }
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#070a12] text-slate-100">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[#070a12]" />
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.18) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(16,185,129,0.12) 0%, transparent 50%), radial-gradient(ellipse at 40% 20%, rgba(6,182,212,0.1) 0%, transparent 50%)'
        }} 
      />

      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-5/12 relative z-10 flex-col justify-center px-14 xl:px-20">
        <div className="max-w-md">
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

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Start your{' '}
            <span className="bg-gradient-to-r from-accent-emerald via-accent-cyan to-brand-400 bg-clip-text text-transparent">
              career journey
            </span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed mb-8">
            Verified candidate registration. Discover real job openings, calculate compatibility, and bridge skill gaps.
          </p>

          {/* Stepper Progress */}
          <div className="space-y-3.5">
            {[
              { num: 1, title: 'Real Email & Credentials', desc: 'Genuine candidate profile' },
              { num: 2, title: 'Inbox OTP Verification', desc: '6-digit verification code' },
              { num: 3, title: 'Career Preferences', desc: 'Target roles & city alignment' }
            ].map((s) => (
              <div 
                key={s.num} 
                className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
                  step === s.num 
                    ? 'bg-brand-500/15 border-brand-500/40 text-white shadow-lg' 
                    : step > s.num 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                    : 'bg-white/5 border-white/5 text-slate-400 opacity-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  step > s.num 
                    ? 'bg-emerald-500 text-white' 
                    : step === s.num 
                    ? 'bg-brand-500 text-white' 
                    : 'bg-white/10 text-slate-400'
                }`}>
                  {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                </div>
                <div>
                  <p className="text-xs font-bold">{s.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Spam-protected. Real email verification required for login.</span>
          </div>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-10 lg:px-12 py-10 relative z-10">
        <div className="w-full max-w-lg">
          
          {/* Card */}
          <div className="glass-panel rounded-2xl p-7 sm:p-9 shadow-2xl border border-white/15 bg-[#0b101d]/90 backdrop-blur-xl">
            
            {/* Header Titles */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
                  Step {step} of 3
                </span>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">
                {step === 1 && 'Create your account'}
                {step === 2 && 'Verify your real email'}
                {step === 3 && 'Career preferences'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {step === 1 && 'Enter your real email address to receive your verification code.'}
                {step === 2 && `Enter the 6-digit verification code sent to ${form.email}.`}
                {step === 3 && 'Tell us your preferred role, locations, and work modes to personalize recommendations.'}
              </p>
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && !error && (
              <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ─── STEP 1: Full Name, Real Email & Password ─── */}
            {step === 1 && (
              <>
                {/* Continue with Google button */}
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

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0b101d] px-3 text-slate-400 font-medium">or register with real email</span>
                  </div>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Real Email Address */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Real Email Address</label>
                      <span className="text-[10px] text-brand-400 font-medium">OTP code required</span>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-400">Quick add:</span>
                      {['@gmail.com', '@outlook.com'].map(suffix => (
                        <button
                          key={suffix}
                          type="button"
                          onClick={() => {
                            const prefix = form.email.split('@')[0] || '';
                            if (prefix) updateField('email', `${prefix}${suffix}`);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-brand-300 border border-white/10 transition-colors"
                        >
                          {suffix}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="At least 6 characters"
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

                    {form.password && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pwdStrength.color}`} style={{ width: `${(pwdStrength.score / 5) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">{pwdStrength.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit button to dispatch OTP */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white font-semibold text-xs shadow-glow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ─── STEP 2: 6-Digit OTP Verification ─── */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-brand-400" />
                    <div>
                      <div className="text-[11px] text-slate-400">Sending OTP code to:</div>
                      <div className="text-xs font-semibold text-white">{form.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-brand-400 hover:text-brand-300 underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Dev OTP Helper Banner (when SMTP credentials pending in .env) */}
                {devOtpCode && (
                  <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                        Dev Mode OTP Code:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = devOtpCode.split('');
                          setOtpDigits(digits);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 hover:bg-brand-500/40"
                      >
                        Auto-Fill
                      </button>
                    </div>
                    <div className="font-mono text-sm font-bold tracking-widest text-accent-cyan">
                      {devOtpCode}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      (To send real emails to your Gmail inbox, add your Gmail App Password to SMTP_USER & SMTP_PASS in .env)
                    </p>
                  </div>
                )}

                {/* 6-Digit OTP Inputs */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block text-center">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
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
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Verify OTP Button */}
                <button
                  type="submit"
                  disabled={isLoading || otpDigits.join('').length !== 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-semibold text-xs shadow-glow-emerald hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code & Continue</span>
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend Countdown */}
                <div className="text-center">
                  {resendCooldown > 0 ? (
                    <span className="text-xs text-slate-400">
                      Resend code in <span className="text-brand-300 font-semibold">{resendCooldown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleResendOtp}
                      className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center justify-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Didn't receive code? Resend OTP</span>
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* ─── STEP 3: Career Preferences & Finalize ─── */}
            {step === 3 && (
              <form onSubmit={handleCompleteRegistration} className="space-y-4">
                {/* Experience Level */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Experience Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {experienceLevels.map(lvl => (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => updateField('experienceLevel', lvl.value)}
                        className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                          form.experienceLevel === lvl.value
                            ? 'bg-brand-500/20 border-brand-500/50 text-white font-semibold'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div>{lvl.label}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{lvl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Role */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-accent-cyan" />
                    Target Role
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {popularRoles.map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => updateField('preferredRole', role)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
                          form.preferredRole === role
                            ? 'bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan font-medium'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Locations (Multiple Selection) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Preferred Locations
                    </label>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      {form.locations.length > 0 ? `${form.locations.length} selected` : 'Select one or more'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cities.map(city => {
                      const isSelected = form.locations.includes(city);
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => toggleLocation(city)}
                          className={`px-3 py-1.5 rounded-lg text-xs transition-all border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold shadow-sm'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {isSelected && <span className="text-emerald-400 font-bold text-xs">✓</span>}
                          <span>{city}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Click to select multiple cities or remote opportunities.
                  </p>
                </div>

                {/* Work Mode (Multiple Selection) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-accent-cyan" />
                      Work Mode
                    </label>
                    <span className="text-[10px] text-accent-cyan font-medium">
                      {form.workModes.length > 0 ? `${form.workModes.length} selected` : 'Select one or more'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {workModeOptions.map(mode => {
                      const isSelected = form.workModes.includes(mode.value);
                      return (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => toggleWorkMode(mode.value)}
                          className={`p-2.5 rounded-xl text-center border transition-all text-xs flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'bg-accent-cyan/15 border-accent-cyan/60 text-white font-semibold shadow-sm'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{mode.emoji}</span>
                            <span className="font-semibold text-xs">{mode.label}</span>
                            {isSelected && <span className="text-accent-cyan font-bold text-xs">✓</span>}
                          </div>
                          <div className="text-[9px] text-slate-400 font-normal">{mode.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Select all modes you are interested in (e.g. Remote, Hybrid, On-site).
                  </p>
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => updateField('agreeTerms', e.target.checked)}
                    className="mt-0.5 rounded bg-white/5 border-white/20 text-brand-500 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-400 leading-tight">
                    I agree to the CareerLens Terms of Service and Privacy Policy. My email is verified and genuine.
                  </span>
                </label>

                {/* Complete Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white font-semibold text-xs shadow-glow-primary hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration & Launch</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Sign In Link */}
            <p className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-white/10">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Google Account Chooser Modal (Displays all accounts on device) */}
      <GoogleAccountChooserModal
        isOpen={googleChooserOpen}
        onClose={() => setGoogleChooserOpen(false)}
        onAuthSuccess={async (data) => {
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
