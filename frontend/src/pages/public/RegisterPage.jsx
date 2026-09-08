import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Spinner } from '@/components/ui';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    login('USER');
    navigate('/?fromLogin=true&askLocation=true');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Veloq Logo" className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-indigo-200 mb-4" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">Join Veloq — start riding in seconds</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name',     label: 'Full name',  type: 'text',     placeholder: 'Rahul Mehra' },
              { key: 'email',    label: 'Email',       type: 'email',    placeholder: 'you@example.com' },
              { key: 'phone',    label: 'Mobile number', type: 'tel',   placeholder: '+91 9XXXXXXXXX' },
              { key: 'password', label: 'Password',    type: 'password', placeholder: 'Min. 8 characters' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={update(key)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 hover:border-slate-300 transition-all placeholder:text-slate-400"
                />
              </div>
            ))}

            <p className="text-xs text-slate-500 leading-relaxed">
              By continuing you agree to our{' '}
              <span className="text-indigo-600 cursor-pointer hover:underline font-medium">Terms of Service</span>{' '}
              and{' '}
              <span className="text-indigo-600 cursor-pointer hover:underline font-medium">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {loading ? <><Spinner size="sm" className="text-white" /> Creating account…</> : 'Create account →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
