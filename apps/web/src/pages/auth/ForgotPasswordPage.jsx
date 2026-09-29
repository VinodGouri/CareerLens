import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Sparkles, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate password reset email send
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-[#070a12]" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(16,185,129,0.08) 0%, transparent 50%)'
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-[2px] shadow-glow-primary">
            <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-cyan" />
            </div>
          </div>
          <span className="font-extrabold text-xl bg-gradient-to-r from-white to-brand-300 bg-clip-text text-transparent">CareerLens AI</span>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-white/10">
          {!isSubmitted ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Reset your password</h2>
                <p className="text-sm text-slate-400">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white font-semibold text-sm shadow-glow-primary hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ─── Success State ─── */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-accent-emerald/15 border border-accent-emerald/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-accent-emerald" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                We've sent a password reset link to{' '}
                <span className="text-white font-medium">{email}</span>.
                <br />
                Please check your inbox (and spam folder) and follow the instructions.
              </p>
              <button
                onClick={() => { setIsSubmitted(false); setEmail(''); }}
                className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-white/10">
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
