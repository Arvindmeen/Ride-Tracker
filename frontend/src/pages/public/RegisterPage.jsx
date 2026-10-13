import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, MapPin, Wallet, Users, Activity, Radio, KeyRound, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores';

const ROLES = [
  {
    id: 'USER',
    emoji: '👤',
    label: 'Passenger',
    desc: 'Book rides & travel safe',
    badge: '12% Fee Cap',
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    activeClass: 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30',
    btnClass: 'bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30',
  },
  {
    id: 'DRIVER',
    emoji: '🚗',
    label: 'Driver Partner',
    desc: 'Keep 88% of every fare',
    badge: 'Keep 88% Fare',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    activeClass: 'bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-600/30',
    btnClass: 'bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-600/30',
  },
  {
    id: 'ADMIN',
    emoji: '⚡',
    label: 'Operations',
    desc: 'Fleet command & dispatch',
    badge: 'Fleet Ops Command',
    badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
    activeClass: 'bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-md shadow-slate-900/40',
    btnClass: 'bg-gradient-to-br from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 shadow-slate-900/40',
  },
];

const PERKS_BY_ROLE = {
  USER: [
    { icon: MapPin, label: 'Live GPS Tracking', sub: 'Real-time telemetry & precise driver ETA' },
    { icon: Wallet, label: 'Transparent Pricing', sub: 'Guaranteed 12% fee cap, zero hidden surge' },
    { icon: ShieldCheck, label: 'Verified Partners', sub: 'DPDP number masking & 24/7 SOS support' },
    { icon: Users, label: 'Split Fare Ready', sub: 'Seamless UPI split with co-passengers' },
  ],
  DRIVER: [
    { icon: Wallet, label: 'Keep 88% of Fare', sub: 'Direct UPI cashout daily to your bank account' },
    { icon: MapPin, label: 'Nearest Job Radar', sub: 'Intelligent spatial matching with shortest deadhead' },
    { icon: ShieldCheck, label: 'Driver Safety First', sub: '4-digit OTP rider verification on pickup' },
    { icon: Users, label: 'All Vehicles Welcome', sub: 'Cab, Auto/Toto, Bike & Transporter supported' },
  ],
  ADMIN: [
    { icon: Radio, label: 'Real-Time Fleet Grid', sub: 'Supervise 10,000+ drivers across Indian metros' },
    { icon: Activity, label: 'Dynamic Dispatching', sub: 'Live surge zones, trip routing & completion rates' },
    { icon: ShieldCheck, label: 'DPDP Privacy Masking', sub: 'Regulatory-compliant masked PII viewing' },
    { icon: Building2, label: 'Multi-Hub Operations', sub: 'Manage regional dispatch hubs & fleet telemetry' },
  ],
};

const VEHICLE_CATEGORIES = [
  { id: 'MOTO', emoji: '🏍️', label: 'Bike', defaultModel: 'Hero Splendor Plus' },
  { id: 'AUTO', emoji: '🛺', label: 'Auto / Toto', defaultModel: 'Bajaj RE E-Rickshaw' },
  { id: 'ECONOMY', emoji: '🚗', label: 'Cab (Dzire)', defaultModel: 'Maruti Suzuki Dzire' },
  { id: 'XL', emoji: '🚐', label: 'Transporter', defaultModel: 'Tata Winger XL' },
];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const urlRoleParam = searchParams.get('role')?.toUpperCase();
  const initialRole = ['DRIVER', 'ADMIN'].includes(urlRoleParam) ? urlRoleParam : 'USER';
  const redirectTo = searchParams.get('redirect');

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(initialRole); // 'USER' | 'DRIVER' | 'ADMIN'
  const [errorMsg, setErrorMsg] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    // Driver fields
    vehicleCategory: 'ECONOMY',
    vehicleModel: '',
    vehiclePlate: '',
    // Admin fields
    department: 'Central Fleet Operations Command',
    adminKey: 'ADMIN2026',
  });

  const { signupWithCredentials, isAuthenticated, role: currentRole } = useAuthStore();
  const navigate = useNavigate();

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated && currentRole) {
      const redirectMap = { ADMIN: '/admin/dashboard', DRIVER: '/' };
      navigate(redirectTo || redirectMap[currentRole] || '/app/home', { replace: true });
    }
  }, [isAuthenticated, currentRole, navigate, redirectTo]);

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrorMsg('');
  };

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
        vehicleModel: form.vehicleModel.trim() || (VEHICLE_CATEGORIES.find((c) => c.id === form.vehicleCategory)?.defaultModel || 'Maruti Suzuki Dzire'),
        vehiclePlate: (form.vehiclePlate.trim() || 'DL 01 AB 1042').toUpperCase(),
      }),
      ...(role === 'ADMIN' && {
        department: form.department || 'Central Fleet Operations Command',
        adminKey: form.adminKey ? form.adminKey.trim() : 'ADMIN2026',
      }),
    };

    const result = await signupWithCredentials(payload);
    setLoading(false);

    if (result.success) {
      const redirectMap = { ADMIN: '/admin/dashboard', DRIVER: '/' };
      const targetUrl = redirectTo || (role === 'DRIVER' ? '/' : result.redirectUrl) || redirectMap[role] || '/app/home';
      navigate(targetUrl, { replace: true });
    } else {
      setErrorMsg(result.error || 'Failed to create account. Please check your inputs.');
    }
  };

  const activeRoleConfig = ROLES.find((r) => r.id === role) || ROLES[0];
  const perks = PERKS_BY_ROLE[role] || PERKS_BY_ROLE.USER;
  const pwStrength = passwordStrength();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left — Brand Panel ────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden flex-col items-center justify-center p-12 transition-colors duration-500',
          role === 'USER' && 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950',
          role === 'DRIVER' && 'bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950',
          role === 'ADMIN' && 'bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950'
        )}
      >
        {/* Background ambient lighting */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={clsx(
              'absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl animate-float',
              role === 'USER' && 'bg-indigo-500/20',
              role === 'DRIVER' && 'bg-emerald-500/20',
              role === 'ADMIN' && 'bg-cyan-500/15'
            )}
          />
          <div
            className={clsx(
              'absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl',
              role === 'USER' && 'bg-violet-500/20',
              role === 'DRIVER' && 'bg-teal-500/20',
              role === 'ADMIN' && 'bg-blue-500/15'
            )}
            style={{ animationDelay: '1.5s' }}
          />
        </div>

        <div className="relative z-10 max-w-sm animate-fade-up">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 group" title="Ride Tracker - Home">
            <img
              src="/toto-logo.svg"
              alt="Ride Tracker"
              className="w-10 h-10 object-contain drop-shadow-md transition-transform group-hover:scale-105"
            />
            <div>
              <span className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                Ride Tracker
              </span>
              <p className="text-slate-300 text-xs font-semibold">
                {role === 'ADMIN' ? 'Operations Command' : role === 'DRIVER' ? 'Partner Network' : 'Passenger Mobility'}
              </p>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold mb-4 bg-white/10 text-white border border-white/15 backdrop-blur-sm">
            <span>{activeRoleConfig.emoji}</span>
            <span>{activeRoleConfig.label} Registration</span>
          </div>

          <h2 className="text-4xl font-black text-white leading-tight mb-3">
            {role === 'USER' && (
              <>Move smarter.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">Ride in minutes.</span></>
            )}
            {role === 'DRIVER' && (
              <>Drive & earn.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">Keep 88% fare.</span></>
            )}
            {role === 'ADMIN' && (
              <>Fleet command.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Real-time control.</span></>
            )}
          </h2>

          <p className="text-slate-200 text-sm leading-relaxed mb-8">
            {role === 'USER' && 'Transparent pricing with only 12% platform fee, live map tracking, and verified drivers across India.'}
            {role === 'DRIVER' && 'Daily direct UPI settlements, lowest platform commission (12%), and verified passenger ride requests.'}
            {role === 'ADMIN' && 'Supervise pan-India fleet dispatches, monitor safety telemetry, and manage operations with real SQL database persistence.'}
          </p>

          {/* Role perks */}
          <div className="space-y-3.5">
            {perks.map(({ icon: Icon, label, sub }, i) => (
              <div
                key={label}
                className="flex items-center gap-3 animate-fade-up"
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-slate-300">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-300">Already registered?</p>
            <Link
              to={`/login?role=${role}`}
              className="inline-flex items-center gap-1.5 mt-1.5 text-sm font-bold text-white hover:text-emerald-300 transition-colors"
            >
              Sign in as {activeRoleConfig.label} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right — Registration Form ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-slate-50">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <Link to="/" className="group flex flex-col items-center" title="Ride Tracker - Home">
              <img
                src="/toto-logo.svg"
                alt="Ride Tracker Logo"
                className="w-11 h-11 object-contain drop-shadow-sm mb-1.5 transition-transform group-hover:scale-105"
              />
              <span className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                Ride Tracker
              </span>
            </Link>
            <p className="text-slate-500 text-xs mt-1 text-center">
              Real Database Authentication · All 3 Roles Supported
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 text-xs mt-1">
              Select your role below. Data is saved directly in real persistent database tables.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
            {/* ── 3 Roles Segmented Switcher ────────────────────────────────────── */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2 text-center">
                Choose your account role
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRole(r.id);
                      setErrorMsg('');
                    }}
                    className={clsx(
                      'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all',
                      role === r.id
                        ? r.activeClass
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    )}
                  >
                    <span className="text-sm">{r.emoji}</span>
                    <span className="truncate">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-fade-up">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder={
                    role === 'ADMIN' ? 'Operations Officer' :
                    role === 'DRIVER' ? 'Rajesh Kumar' : 'Rahul Mehra'
                  }
                  value={form.name}
                  onChange={update('name')}
                  required
                  autoComplete="name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 hover:border-slate-300 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {role === 'ADMIN' ? 'Official Work Email' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    placeholder={
                      role === 'ADMIN' ? 'admin@ridetracker.in' :
                      role === 'DRIVER' ? 'driver@ridetracker.in' : 'passenger@ridetracker.in'
                    }
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

              {/* Password */}
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
                {/* Password strength */}
                {form.password && (
                  <div className="flex items-center gap-2 mt-2 animate-fade-up">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={clsx(
                            'h-1 flex-1 rounded-full transition-all duration-300',
                            i <= pwStrength.level ? pwStrength.color : 'bg-slate-200'
                          )}
                        />
                      ))}
                    </div>
                    <span
                      className={clsx('text-[10px] font-bold', {
                        'text-rose-600': pwStrength.level === 1,
                        'text-amber-600': pwStrength.level === 2,
                        'text-emerald-600': pwStrength.level === 3,
                      })}
                    >
                      {pwStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* ── DRIVER SPECIFIC FIELDS ────────────────────────────────────── */}
              {role === 'DRIVER' && (
                <div className="pt-3 border-t border-slate-200/80 space-y-3 animate-fade-up">
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <span>🚗</span> Vehicle Information (Partner Fleet)
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {VEHICLE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, vehicleCategory: cat.id }))}
                          className={clsx(
                            'p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all',
                            form.vehicleCategory === cat.id
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          <span className="text-base">{cat.emoji}</span>
                          <span className="truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Model</label>
                      <input
                        type="text"
                        placeholder={
                          VEHICLE_CATEGORIES.find((c) => c.id === form.vehicleCategory)?.defaultModel || 'Maruti Dzire'
                        }
                        value={form.vehicleModel}
                        onChange={update('vehicleModel')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">License Plate Number</label>
                      <input
                        type="text"
                        placeholder="DL 01 AB 1042"
                        value={form.vehiclePlate}
                        onChange={update('vehiclePlate')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono uppercase outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── ADMIN SPECIFIC FIELDS ─────────────────────────────────────── */}
              {role === 'ADMIN' && (
                <div className="pt-3 border-t border-slate-200/80 space-y-3 animate-fade-up">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <KeyRound size={14} className="text-cyan-600" />
                    <span>Operations Command Center Clearance</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Operations Department</label>
                    <select
                      value={form.department}
                      onChange={update('department')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    >
                      <option value="Central Fleet Operations Command">Central Fleet Operations Command</option>
                      <option value="Regional Telemetry & Live Dispatch">Regional Telemetry & Live Dispatch</option>
                      <option value="Safety, DPDP & Compliance Control">Safety, DPDP & Compliance Control</option>
                      <option value="Airport & Transit Hub Operations">Airport & Transit Hub Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Admin Security Access Code <span className="text-slate-400 font-normal">(Default: ADMIN2026)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ADMIN2026"
                      value={form.adminKey}
                      onChange={update('adminKey')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600">
                    ⚡ Grants operational access to manage pan-India dispatches, driver approvals, and masked DPDP fleet telemetry.
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                By creating an account, you agree to our{' '}
                <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Terms of Service</span> and{' '}
                <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">DPDP Privacy Policy</span>.
              </p>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  'w-full text-white font-bold py-3 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0',
                  activeRoleConfig.btnClass
                )}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving to real database…
                  </>
                ) : (
                  <>
                    Register as {activeRoleConfig.label}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-4">
              Already have an account?{' '}
              <Link to={`/login?role=${role}`} className="text-indigo-600 font-bold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
