import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, CheckCircle, Briefcase, MapPin } from 'lucide-react';
import { useCareer } from '../../context/CareerContext';
import OAuthModal from '../../components/auth/OAuthModal';

/* ─── Social Icons ─── */
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { switchPersona } = useCareer();
  const [step, setStep] = useState(1); // 1: basic info, 2: career details
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('google');

  const handleOpenOAuth = (provider) => {
    setSelectedProvider(provider);
    setOauthModalOpen(true);
  };

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    experienceLevel: '',
    preferredRole: '',
    location: '',
    agreeTerms: false
  });

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const experienceLevels = [
    { value: 'STUDENT', label: 'Student', desc: 'Currently pursuing a degree' },
    { value: 'FRESHER', label: 'Fresher', desc: '0-6 months experience' },
    { value: 'JUNIOR', label: 'Junior', desc: '6 months - 2 years' },
    { value: 'MID', label: 'Mid-Level', desc: '2-5 years experience' }
  ];

  const popularRoles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Analyst', 'UI/UX Designer', 'DevOps Engineer',
    'Mobile Developer', 'Product Manager'
  ];

  const cities = [
    'Hyderabad', 'Bangalore', 'Pune', 'Mumbai', 'Delhi NCR',
    'Chennai', 'Kolkata', 'Remote'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      setStep(2);
      return;
    }

    if (!form.agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          experienceLevel: form.experienceLevel,
          preferredRole: form.preferredRole,
          location: form.location
        })
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        localStorage.setItem('careerlens_token', data.data.token);
        await switchPersona(data.data.user.id);
        navigate('/onboarding');
      } else {
        setError(data.error?.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Registration failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
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

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#070a12]" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(16,185,129,0.1) 0%, transparent 50%), radial-gradient(ellipse at 40% 20%, rgba(6,182,212,0.08) 0%, transparent 50%)'
      }} />

      {/* Left Branding — Same as Login but mirrored for variety */}
      <div className="hidden lg:flex lg:w-5/12 relative z-10 flex-col justify-center px-16 xl:px-20">
        <div className="max-w-md">
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

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Start your{' '}
            <span className="bg-gradient-to-r from-accent-emerald via-accent-cyan to-brand-400 bg-clip-text text-transparent">
              career journey
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-10">
            Create your free account and get personalized job recommendations in under 2 minutes.
          </p>

          {/* Steps indicator */}
          <div className="space-y-4">
            {[
              { num: 1, title: 'Create Account', desc: 'Set up your credentials' },
              { num: 2, title: 'Career Preferences', desc: 'Tell us about your goals' },
              { num: 3, title: 'Profile Setup', desc: 'Add skills & experience' },
            ].map((s) => (
              <div key={s.num} className={`flex items-start gap-4 p-3 rounded-xl transition-all ${
                step === s.num ? 'bg-brand-500/10 border border-brand-500/30' : 
                step > s.num ? 'opacity-60' : 'opacity-40'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  step > s.num ? 'bg-accent-emerald text-white' :
                  step === s.num ? 'bg-brand-500 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-slate-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 relative z-10">
        <div className="w-full max-w-lg">

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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                {step === 1 ? 'Create your account' : 'Career preferences'}
              </h2>
              <p className="text-sm text-slate-400">
                {step === 1 ? 'Step 1 of 2 — Your basic information' : 'Step 2 of 2 — Help us personalize your experience'}
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        placeholder="Rahul Sharma"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="you@email.com"
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
                        value={form.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pwdStrength.color}`} style={{ width: `${(pwdStrength.score / 5) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">{pwdStrength.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Experience Level */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Experience Level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {experienceLevels.map(level => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => updateField('experienceLevel', level.value)}
                          className={`p-3 rounded-xl text-left text-xs border transition-all ${
                            form.experienceLevel === level.value
                              ? 'bg-brand-500/15 border-brand-500/40 text-brand-200'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-semibold">{level.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{level.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Role */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      Target Role
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {popularRoles.map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => updateField('preferredRole', role)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            form.preferredRole === role
                              ? 'bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Preferred City
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {cities.map(city => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => updateField('location', city)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            form.location === city
                              ? 'bg-accent-emerald/15 border-accent-emerald/40 text-accent-emerald'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 pt-2 cursor-pointer group">
                    <div
                      onClick={() => updateField('agreeTerms', !form.agreeTerms)}
                      className={`w-5 h-5 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center transition-all ${
                        form.agreeTerms ? 'bg-brand-500 border-brand-500' : 'border-white/20 group-hover:border-white/40'
                      }`}
                    >
                      {form.agreeTerms && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-slate-400 leading-relaxed" onClick={() => updateField('agreeTerms', !form.agreeTerms)}>
                      I agree to the <span className="text-brand-400">Terms of Service</span> and <span className="text-brand-400">Privacy Policy</span>. CareerLens uses your data solely to provide personalized career recommendations.
                    </span>
                  </label>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 transition-all"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white font-semibold text-sm shadow-glow-primary hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {step === 1 ? 'Continue' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {step === 1 && (
              <>
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0e1424] px-3 text-slate-500 font-medium">or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button 
                    type="button"
                    onClick={() => handleOpenOAuth('google')}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs text-slate-300 font-medium group"
                    title="Sign up with Google"
                  >
                    <GoogleIcon />
                    <span className="hidden sm:inline">Google</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleOpenOAuth('linkedin')}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#0A66C2]/40 transition-all text-xs text-slate-300 font-medium group"
                    title="Sign up with LinkedIn"
                  >
                    <LinkedInIcon />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleOpenOAuth('github')}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/40 transition-all text-xs text-slate-300 font-medium group"
                    title="Sign up with GitHub"
                  >
                    <GitHubIcon />
                    <span className="hidden sm:inline">GitHub</span>
                  </button>
                </div>

                <OAuthModal 
                  isOpen={oauthModalOpen}
                  onClose={() => setOauthModalOpen(false)}
                  provider={selectedProvider}
                  redirectPath="/"
                />
              </>
            )}

            <p className="text-center text-sm text-slate-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
