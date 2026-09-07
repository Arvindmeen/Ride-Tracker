import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Button, Input } from '@/components/ui';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    login('USER');
    navigate('/?fromLogin=true&askLocation=true');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Veloq Logo"
            className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-sky-500/25 border border-sky-400/40 mx-auto mb-4"
          />
          <h1 className="text-2xl font-black text-slate-900">Create your Veloq account</h1>
          <p className="text-slate-500 text-sm mt-1">Start riding across campus & cities with Veloq today</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" placeholder="Rahul Mehra" value={form.name} onChange={update('name')} required />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
            <Input label="Phone" type="tel" placeholder="+91 9XXXXXXXXX" value={form.phone} onChange={update('phone')} required />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={update('password')} required />
            <p className="text-xs text-slate-500">
              By continuing you agree to our <span className="text-blue-600 cursor-pointer">Terms</span> and <span className="text-blue-600 cursor-pointer">Privacy Policy</span>.
            </p>
            <Button type="submit" className="w-full" loading={loading}>Create account</Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
