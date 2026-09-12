import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MapPin, Zap, ShieldCheck, Star } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { Spinner } from '@/components/ui';
import { clsx } from 'clsx';

const ROLES = [
  {
    id: 'USER',
    emoji: '👤',
    label: 'Passenger',
    desc: 'Book rides, track trips',
    accent: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-50 border-indigo-200',
    active: 'bg-gradient-to-br from-indigo-500 to-violet-600 border-transparent text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)]',
  },
  {
    id: 'DRIVER',
    emoji: '🏍️',
    label: 'Driver',
    desc: 'Accept rides, earn more',
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
  { icon: Zap,    label: 'Dynamic Pricing',   sub: 'Apache Flink surge engine' },
  { icon: ShieldCheck, label: 'Safety First', sub: 'Number masking & SOS' },
  { icon: Star,   label: '4.9★ Rated',        sub: 'Trusted by 50K+ riders' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('rahul@ridetracker.in');
  const [password, setPassword] = useState('password123');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [role, setRole] = useState('USER');
  const { loginWithCredentials } = useAuthStore();
  const navigate = useNavigate();

  const fillRoleCredentials = (selectedRole) => {
    setRole(selectedRole);
    setErrorMsg('');
    if (selectedRole === 'ADMIN') {
      setEmail('admin@ridetracker.in');
      setPassword('admin123');
    } else if (selectedRole === 'DRIVER') {
      setEmail('rajesh@ridetracker.in');
      setPassword('password123');
    } else {
      setEmail('rahul@ridetracker.in');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const targetEmail = email.trim() || (role === 'ADMIN' ? 'admin@ridetracker.in' : role === 'DRIVER' ? 'rajesh@ridetracker.in' : 'rahul@ridetracker.in');
    const targetPassword = password || (role === 'ADMIN' ? 'admin123' : 'password123');

    const result = await loginWithCredentials({
      email: targetEmail,
      password: targetPassword,
      expectedRole: role,
    });

    setLoading(false);
    if (result.success) {
      navigate(result.redirectUrl || (role === 'ADMIN' ? '/admin/dashboard' : role === 'DRIVER' ? '/driver/dashboard' : '/app/home'));
    } else {
      setErrorMsg(result.error || 'Invalid credentials');
    }
  };

  const activeRole = ROLES.find(r => r.id === role);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left — Brand Panel ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 flex-col items-center justify-center p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="Ride Tracker" className="w-10 h-10 rounded-xl object-cover shadow-lg border border-white/20" />
            <div>
              <span className="text-2xl font-black text-white tracking-tight">Ride Tracker</span>
              <p className="text-indigo-300 text-xs font-semibold">Mobility Platform</p>
            </div>
          </div>

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
            {FEATURES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
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
      <div className="flex-1 flex items-center justify-center px-5 py-12 bg-slate-50">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <img src="/logo.png" alt="Ride Tracker" className="w-9 h-9 rounded-xl object-cover border border-indigo-200 shadow" />
            <span className="text-xl font-black text-slate-900">Ride Tracker</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your Ride Tracker account</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => fillRoleCredentials(r.id)}
                className={clsx(
                  'flex flex-col items-center gap-1 p-3 rounded-2xl border text-xs font-bold transition-all duration-200',
                  role === r.id ? r.active : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <span className="text-xl">{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Pre-fill Credentials Pill */}
          <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700">Pre-filled Account:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
              {role === 'ADMIN' ? 'admin@ridetracker.in' : role === 'DRIVER' ? 'rajesh@ridetracker.in' : 'rahul@ridetracker.in'}
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 hover:border-slate-300 transition-all"
                required
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
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 hover:border-slate-300 transition-all"
                  required
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
              className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Spinner size="sm" className="text-white" /> Signing in…</>
              ) : (
                <>Sign in as {activeRole?.label} →</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            No account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Create one free</Link>
          </p>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-center text-xs text-slate-400">
              🔒 Connected to PostgreSQL backend · Role-isolated routes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
