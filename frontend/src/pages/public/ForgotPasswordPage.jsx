import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles, Lock } from 'lucide-react';
import { clsx } from 'clsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Simulate sending password reset instructions
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* ── Left — Brand Hero Panel ────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 flex-col items-center justify-center p-12 text-white">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-sm animate-fade-up">
          <Link to="/" className="flex items-center gap-3 mb-10 group" title="Ride Tracker - Home">
            <img
              src="/toto-logo.svg"
              alt="Ride Tracker"
              className="w-10 h-10 object-contain drop-shadow-md transition-transform group-hover:scale-105"
            />
            <div>
              <span className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">Ride Tracker</span>
              <p className="text-indigo-300 text-xs font-semibold">Account Recovery</p>
            </div>
          </Link>

          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-6 shadow-inner">
            <Lock size={28} className="animate-pulse" />
          </div>

          <h2 className="text-3xl font-black text-white leading-tight mb-3">
            Secure & Instant<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
              Account Recovery
            </span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Don't worry — it happens to the best of us. We'll send a high-security one-time password reset link to your verified email.
          </p>

          <div className="space-y-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
              <span>256-bit encrypted verification tokens</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <KeyRound size={18} className="text-indigo-400 shrink-0" />
              <span>Valid for 15 minutes for maximum safety</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Sparkles size={18} className="text-amber-400 shrink-0" />
              <span>Instant auto-unlock across all devices</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right — Recovery Card ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile Brand Header */}
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden group" title="Ride Tracker - Home">
            <img src="/toto-logo.svg" alt="Ride Tracker" className="w-9 h-9 object-contain drop-shadow-sm" />
            <div>
              <span className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">Ride Tracker</span>
              <p className="text-xs text-slate-500">Fast & Transparent Mobility</p>
            </div>
          </Link>

          {!submitted ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
              <div className="mb-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-4 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Login</span>
                </Link>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forgot password?</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                  Enter your registered email address and we'll send you an encrypted password reset link.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-start gap-2.5">
                  <span className="text-base leading-none">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="e.g. rahul@ridetracker.in"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending secure link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Remember your password?{' '}
                  <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">
                    Log in here
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                We've sent a password reset link to <strong className="text-slate-800">{email}</strong>. Please check your inbox and spam folder.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left mb-6 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Next Steps:</span>
                </div>
                <p>1. Open the email from <strong>noreply@ridetracker.in</strong></p>
                <p>2. Click the <strong>Reset Password</strong> button</p>
                <p>3. Set your new password and sign in instantly</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20"
                >
                  Return to Sign In
                </button>
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors"
                >
                  Try another email address
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
