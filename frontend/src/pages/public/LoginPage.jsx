import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('USER');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    login(role);
    navigate(role === 'ADMIN' ? '/admin/dashboard' : role === 'DRIVER' ? '/driver/dashboard' : '/?fromLogin=true&askLocation=true');
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
          <h1 className="text-2xl font-black text-slate-900">Sign in to Veloq</h1>
          <p className="text-slate-500 text-sm mt-1">Access your Veloq mobility account</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* Role selector */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
            {['USER', 'DRIVER', 'ADMIN'].map(r => (
              <button key={r}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${role === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setRole(r)}>
                {r === 'USER' ? '👤 User' : r === 'DRIVER' ? '🚗 Driver' : '🖥️ Admin'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Password" type={showPw ? 'text' : 'password'} placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              suffix={<button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>}
              required />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Sign in as {role.charAt(0) + role.slice(1).toLowerCase()}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            No account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Sign up free</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Demo mode — any credentials work
        </p>
      </div>
    </div>
  );
}
