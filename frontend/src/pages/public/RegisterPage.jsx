import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, MapPin, Wallet, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores';

const PERKS = [
  { icon: MapPin, label: 'Live GPS Tracking', sub: 'Track your ride in real-time' },
  { icon: Wallet, label: 'Fair Pricing', sub: 'Only 12% platform fee, no surge tricks' },
  { icon: ShieldCheck, label: 'Verified Drivers', sub: 'Background checked & rated' },
  { icon: Users, label: 'Split Fare', sub: 'Share ride cost with co-passengers' },
];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'DRIVER' ? 'DRIVER' : 'USER';
  const redirectTo = searchParams.get('redirect');

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(initialRole); // 'USER' | 'DRIVER'
  const [errorMsg, setErrorMsg] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleCategory: 'ECONOMY',
    vehicleModel: '',
    vehiclePlate: '',
  });

  const { signupWithCredentials, isAuthenticated, role: currentRole } = useAuthStore();
  const navigate = useNavigate();

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated && currentRole) {
      const redirectMap = { ADMIN: '/admin/dashboard', DRIVER: '/driver/dashboard' };
      navigate(redirectTo || redirectMap[currentRole] || '/app/home', { replace: true });
    }
  }, [isAuthenticated, currentRole, navigate, redirectTo]);

  const update = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrorMsg(''); };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { level: 2, label: 'Medium', color: 'bg-amber-500' };
    return { level: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setErrorMsg('Please fill all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      password: form.password,
      role,
      ...(role === 'DRIVER' && {
        vehicleCategory: form.vehicleCategory,
        vehicleModel: form.vehicleModel || (form.vehicleCategory === 'MOTO' ? 'Hero Splendor Plus' : form.vehicleCategory === 'AUTO' ? 'Bajaj RE Auto' : 'Maruti Suzuki Dzire'),
        vehiclePlate: form.vehiclePlate || 'DL 01 AB 1042',
      }),
    };

    const result = await signupWithCredentials(payload);
    setLoading(false);

    if (result.success) {
      navigate(redirectTo || result.redirectUrl || (role === 'DRIVER' ? '/driver/dashboard' : '/app/home'), { replace: true });
    } else {
      setErrorMsg(result.error || 'Failed to create account. Please check your inputs.');
    }
  };

  const pwStrength = passwordStrength();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left — Brand Panel ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 flex-col items-center justify-center p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-sm animate-fade-up">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12 group" title="Ride Tracker - Home">
            <img src="/toto-logo.svg" alt="Ride Tracker" className="w-10 h-10 object-contain drop-shadow-md transition-transform group-hover:scale-105" />
            <div>
              <span className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">Ride Tracker</span>
              <p className="text-emerald-300 text-xs font-semibold">Create Your Account</p>
            </div>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-3">
            Start riding<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
              in minutes.
            </span>
          </h2>
          <p className="text-emerald-200 text-sm leading-relaxed mb-10">
            Join thousands of riders and drivers across India. Transparent pricing, verified partners, and 24/7 safety support.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {PERKS.map(({ icon: Icon, label, sub }, i) => (
              <div key={label} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${(i + 1) * 120}ms` }}>
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-emerald-300">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-xs text-emerald-400">Already have an account?</p>
            <Link to="/login" className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold text-white hover:text-emerald-200 transition-colors">
              Sign in instead <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right — Registration Form ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 bg-slate-50">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <Link to="/" className="group flex flex-col items-center" title="Ride Tracker - Home">
              <img
                src="/toto-logo.svg"
                alt="Ride Tracker Logo"
                className="w-12 h-12 object-contain drop-shadow-sm mb-2 transition-transform group-hover:scale-105"
              />
              <h1 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">Create your account</h1>
            </Link>
            <p className="text-slate-500 text-xs mt-1 text-center">
              Join Ride Tracker — transparent 12% fee, zero hidden charges
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-7">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">
              Join Ride Tracker — transparent 12% fee, zero hidden charges
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            {/* Role Choice Segmented Control */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 text-center">
                Choose your account type
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={clsx(
                    'flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all',
                    role === 'USER'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <span>👤</span>
                  <span>Passenger</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('DRIVER')}
                  className={clsx(
                    'flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all',
                    role === 'DRIVER'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <span>🚗</span>
                  <span>Driver Partner</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-fade-up">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder={role === 'DRIVER' ? 'Rajesh Kumar' : 'Rahul Mehra'}
                  value={form.name}
                  onChange={update('name')}
                  required
                  autoComplete="name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 hover:border-slate-300 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={update('email')}
                    required
                    autoComplete="email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 hover:border-slate-300 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={update('phone')}
                    autoComplete="tel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 hover:border-slate-300 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={update('password')}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 hover:border-slate-300 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {form.password && (
                  <div className="flex items-center gap-2 mt-2 animate-fade-up">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={clsx(
                            'h-1 flex-1 rounded-full transition-all duration-300',
                            i <= pwStrength.level ? pwStrength.color : 'bg-slate-200'
                          )}
                        />
                      ))}
                    </div>
                    <span className={clsx('text-[10px] font-bold', {
                      'text-rose-600': pwStrength.level === 1,
                      'text-amber-600': pwStrength.level === 2,
                      'text-emerald-600': pwStrength.level === 3,
                    })}>
                      {pwStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Driver Partner Specific Vehicle Fields */}
              {role === 'DRIVER' && (
                <div className="pt-3 border-t border-slate-200/80 space-y-3 animate-fade-up">
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <span>🚗</span> Vehicle Information
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Category</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        ['MOTO', '🏍️', 'Bike'],
                        ['ECONOMY', '🚗', 'Cab'],
                        ['AUTO', '🛺', 'Auto / Toto'],
                      ].map(([cat, emoji, label]) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, vehicleCategory: cat }))}
                          className={clsx(
                            'p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all',
                            form.vehicleCategory === cat
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          <span className="text-base">{emoji}</span>
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Model</label>
                      <input
                        type="text"
                        placeholder={form.vehicleCategory === 'MOTO' ? 'Hero Splendor Plus' : form.vehicleCategory === 'AUTO' ? 'Bajaj RE Auto' : 'Maruti Dzire'}
                        value={form.vehicleModel}
                        onChange={update('vehicleModel')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">License Plate</label>
                      <input
                        type="text"
                        placeholder="DL 01 AB 1042"
                        value={form.vehiclePlate}
                        onChange={update('vehiclePlate')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                By creating an account, you agree to our{' '}
                <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Terms of Service</span> and{' '}
                <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  'w-full text-white font-bold py-3 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0',
                  role === 'DRIVER'
                    ? 'bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-600/30'
                    : 'bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30'
                )}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                ) : (
                  <>Create {role === 'DRIVER' ? 'Driver Partner' : 'Passenger'} Account <ArrowRight size={14} /></>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
