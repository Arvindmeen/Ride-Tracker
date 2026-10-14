import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, MapPin, Zap, ShieldCheck, Star, ArrowRight, Loader2, Check, Copy, Sparkles, Wrench, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { clsx } from 'clsx';

const ROLES = [
  {
    id: 'USER',
    emoji: '👤',
    label: 'Passenger',
    desc: 'Book rides & track trips',
    accent: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-50 border-indigo-200',
    active: 'bg-gradient-to-br from-indigo-500 to-violet-600 border-transparent text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)]',
  },
  {
    id: 'DRIVER',
    emoji: '🚗',
    label: 'Driver Partner',
    desc: 'Accept rides & earn money',
    accent: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50 border-emerald-200',
    active: 'bg-gradient-to-br from-emerald-500 to-green-600 border-transparent text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)]',
  },
  {
    id: 'ADMIN',
    emoji: '⚡',
    label: 'Operations',
    desc: 'Fleet command center',
    accent: 'from-slate-700 to-slate-900',
    bg: 'bg-slate-50 border-slate-200',
    active: 'bg-gradient-to-br from-slate-700 to-slate-900 border-transparent text-white shadow-[0_4px_14px_rgba(15,23,42,0.4)]',
  },
];

const FEATURES = [
  { icon: MapPin, label: 'Live GPS Tracking', sub: 'Real-time route monitoring' },
  { icon: Zap,    label: 'Transparent Pricing', sub: 'Only 12% platform fee' },
  { icon: ShieldCheck, label: 'Safety First', sub: 'Number masking & SOS' },
  { icon: Star,   label: '4.9★ Rated',        sub: 'Trusted by 50K+ riders' },
];

// Demo credentials for quick testing
const DEMO_ACCOUNTS = {
  USER: {
    role: 'USER',
    label: 'Passenger',
    icon: '👤',
    email: 'rahul@ridetracker.in',
    password: 'password123',
    desc: 'Book rides, track GPS & upfront fares',
    tag: 'Rider Portal',
    tagColor: 'bg-indigo-600 text-white',
  },
  DRIVER: {
    role: 'DRIVER',
    label: 'Driver Partner',
    icon: '🚗',
    email: 'driver@ridetracker.in',
    password: 'password123',
    desc: 'Accept requests & duty toggle',
    tag: 'Driver Portal',
    tagColor: 'bg-emerald-600 text-white',
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Operations Admin',
    icon: '⚡',
    email: 'admin@ridetracker.in',
    password: 'admin123',
    desc: 'Live telemetry, pricing & user db',
    tag: 'Admin Ops',
    tagColor: 'bg-slate-900 text-white',
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [role, setRole] = useState('USER');
  const [showDemo, setShowDemo] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const { loginWithCredentials, isAuthenticated, role: currentRole } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  // Pre-load demo account on initial render or when query param changes
  useEffect(() => {
    const targetRole = (searchParams.get('role') || 'USER').toUpperCase();
    const validRole = DEMO_ACCOUNTS[targetRole] ? targetRole : 'USER';
    setRole(validRole);
    setEmail(DEMO_ACCOUNTS[validRole].email);
    setPassword(DEMO_ACCOUNTS[validRole].password);
    setShowDemo(true);
  }, [searchParams]);

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated && currentRole) {
      const redirectMap = { ADMIN: '/', DRIVER: '/', USER: '/' };
      navigate(redirectTo || redirectMap[currentRole] || '/', { replace: true });
    }
  }, [isAuthenticated, currentRole, navigate, redirectTo]);

  const fillDemoCredentials = (selectedRole) => {
    setRole(selectedRole);
    setErrorMsg('');
    const demo = DEMO_ACCOUNTS[selectedRole];
    setEmail(demo.email);
    setPassword(demo.password);
    setShowDemo(true);
  };

  const copyToClipboard = (text, id, e) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedField(id);
      setTimeout(() => setCopiedField(null), 1800);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    const result = await loginWithCredentials({
      email: email.trim(),
      password: password,
      expectedRole: role,
    });

    setLoading(false);
    if (result.success) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('veloq_show_beta_modal', 'true');
      }
      const redirectMap = { ADMIN: '/', DRIVER: '/', USER: '/' };
      const targetUrl = redirectTo || redirectMap[result.role] || '/';
      navigate(targetUrl, { replace: true });
    } else {
      setErrorMsg(result.error || 'Invalid email or password. Please try again.');
    }
  };

  const activeRole = ROLES.find(r => r.id === role);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left — Brand Panel ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 flex-col items-center justify-center p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-sm animate-fade-up">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12 group" title="Ride Tracker - Home">
            <img src="/toto-logo.svg" alt="Ride Tracker" className="w-10 h-10 object-contain drop-shadow-md transition-transform group-hover:scale-105" />
            <div>
              <span className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">Ride Tracker</span>
              <p className="text-indigo-300 text-xs font-semibold">Mobility Platform</p>
            </div>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-3">
            Move smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
              Travel faster.
            </span>
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-10">
            India's most transparent ride platform. 12% cap on driver fees, real-time GPS, and zero hidden charges.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, sub }, i) => (
              <div key={label} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${(i + 1) * 120}ms` }}>
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-indigo-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-indigo-300">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-xs text-indigo-400">Trusted by 50,000+ riders across India</p>
            <div className="flex -space-x-2 mt-3">
              {['A', 'R', 'P', 'S', 'M'].map((l, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 border-2 border-indigo-900 flex items-center justify-center text-[10px] font-bold text-white">
                  {l}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-200">
                +
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right — Auth Form ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 bg-slate-50 min-h-screen">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-6 group" title="Ride Tracker - Home">
            <img src="/toto-logo.svg" alt="Ride Tracker" className="w-9 h-9 object-contain drop-shadow-sm" />
            <span className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">Ride Tracker</span>
          </Link>

          {/* Under Maintenance / Active Testing Notice */}
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-300/70 flex items-center gap-3 text-xs text-amber-900 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Wrench size={15} className="animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-extrabold text-amber-900 text-xs">Under Maintenance & Beta Testing</p>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 mt-0.5 leading-snug">
                Features are currently undergoing live sandbox calibration. Use the test accounts below.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Ride Tracker</h1>
            <p className="text-slate-500 text-xs mt-1">Select an account below or enter your credentials</p>
          </div>

          {/* Animated 1-Click Testing Credentials Card */}
          <div className="mb-5 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  1-Click Test Credentials
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                <span>⚡ Auto Fill</span>
              </span>
            </div>

            <div className="space-y-2">
              {Object.values(DEMO_ACCOUNTS).map(acc => {
                const isSelected = role === acc.role;
                return (
                  <div
                    key={acc.role}
                    onClick={() => fillDemoCredentials(acc.role)}
                    className={clsx(
                      'p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-2.5 group',
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-50/90 to-violet-50/90 border-indigo-400 shadow-xs ring-1 ring-indigo-400/40'
                        : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg p-1.5 rounded-lg bg-white shadow-2xs border border-slate-100 flex-shrink-0 group-hover:scale-110 transition-transform">
                        {acc.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{acc.label}</span>
                          <span className={clsx('text-[9px] font-extrabold px-1.5 py-0.2 rounded-full', acc.tagColor)}>
                            {acc.tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5 text-slate-600">
                          <span className="truncate font-semibold text-slate-800">{acc.email}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-slate-500">{acc.password}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => copyToClipboard(`${acc.email} / ${acc.password}`, acc.role, e)}
                        title="Copy credentials"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                      >
                        {copiedField === acc.role ? (
                          <Check size={13} className="text-emerald-600 font-bold" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>

                      <span
                        className={clsx(
                          'text-[10px] font-bold px-2 py-1 rounded-lg transition-all',
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 group-hover:border-indigo-300 group-hover:text-indigo-600'
                        )}
                      >
                        {isSelected ? '✓ Ready' : 'Fill'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-fade-up">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 hover:border-slate-300 transition-all"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline font-medium">Forgot?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrorMsg(''); }}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 hover:border-slate-300 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full text-white font-bold py-3 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed',
                role === 'DRIVER' && 'bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-600/30',
                role === 'ADMIN' && 'bg-gradient-to-br from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 shadow-slate-900/40',
                role === 'USER' && 'bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30'
              )}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in…</>
              ) : (
                <>Sign in as {activeRole?.label} <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to={`/register?role=${role}`} className="text-indigo-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-center text-xs text-slate-400">
              🔒 Secure login · Role-based access control · Encrypted passwords
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
