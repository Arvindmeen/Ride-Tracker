import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores';
import { Spinner } from '@/components/ui';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('USER'); // 'USER' | 'DRIVER'
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleCategory: 'ECONOMY',
    vehicleModel: '',
    vehiclePlate: '',
  });

  const { signupWithCredentials } = useAuthStore();
  const navigate = useNavigate();

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
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
      navigate(result.redirectUrl || (role === 'DRIVER' ? '/driver/dashboard' : '/app/home'));
    } else {
      setErrorMsg(result.error || 'Failed to create account. Please check your inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="group flex flex-col items-center">
            <img
              src="/logo.png"
              alt="Ride Tracker Logo"
              className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-indigo-200 mb-3 transition-transform group-hover:scale-105"
            />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h1>
          </Link>
          <p className="text-slate-500 text-xs mt-1 text-center">
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
                    ? 'bg-blue-600 text-white shadow-sm'
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
                <span>🏍️</span>
                <span>Driver Partner</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder={role === 'DRIVER' ? 'Subhash Mondal' : 'Rahul Mehra'}
                value={form.name}
                onChange={update('name')}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 hover:border-slate-300 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update('email')}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 hover:border-slate-300 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={update('phone')}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 hover:border-slate-300 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={update('password')}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 hover:border-slate-300 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Driver Partner Specific Vehicle Fields */}
            {role === 'DRIVER' && (
              <div className="pt-2 border-t border-slate-200/80 space-y-3 animate-in fade-in-50">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Category</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      ['MOTO', '🏍️', 'Bike'],
                      ['ECONOMY', '🚗', 'Cab'],
                      ['AUTO', '🛺', 'Auto/Toto'],
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">License Plate</label>
                    <input
                      type="text"
                      placeholder="DL 01 AB 1042"
                      value={form.vehiclePlate}
                      onChange={update('vehiclePlate')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              By creating an account, you agree to our{' '}
              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Terms of Service</span> and{' '}
              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full text-white font-black py-3 rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-xs disabled:opacity-60',
                role === 'DRIVER'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
              )}
            >
              {loading ? (
                <><Spinner size="sm" className="text-white" /> Creating account…</>
              ) : (
                <>Create {role === 'DRIVER' ? 'Driver Partner' : 'Passenger'} Account →</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-4">
            Already registered?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
