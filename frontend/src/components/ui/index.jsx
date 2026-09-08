import { clsx } from 'clsx';

// ── Button ─────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className, loading, disabled, pill, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const rounding = pill ? 'rounded-full' : 'rounded-xl';
  const variants = {
    primary: 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-transparent shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-indigo-500',
    secondary: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm focus-visible:ring-slate-400',
    danger: 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-transparent shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 focus-visible:ring-red-500',
    ghost: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
    outline: 'bg-transparent text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 focus-visible:ring-indigo-500',
    success: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white border-transparent shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 focus-visible:ring-emerald-500',
    dark: 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800 focus-visible:ring-slate-500',
  };
  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
    xl: 'px-6 py-3 text-base',
  };
  return (
    <button className={clsx(base, rounding, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', glow, className }) {
  const variants = {
    default:  'bg-slate-100 text-slate-600 border border-slate-200',
    blue:     'bg-blue-50 text-blue-700 border border-blue-100',
    indigo:   'bg-indigo-50 text-indigo-700 border border-indigo-100',
    green:    'bg-emerald-50 text-emerald-700 border border-emerald-100',
    yellow:   'bg-amber-50 text-amber-700 border border-amber-100',
    red:      'bg-rose-50 text-rose-700 border border-rose-100',
    orange:   'bg-orange-50 text-orange-700 border border-orange-100',
    purple:   'bg-purple-50 text-purple-700 border border-purple-100',
    dark:     'bg-slate-800 text-slate-200 border border-slate-700',
  };
  const glowMap = {
    green:  'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    red:    'shadow-[0_0_8px_rgba(244,63,94,0.4)]',
    blue:   'shadow-[0_0_8px_rgba(59,130,246,0.4)]',
    indigo: 'shadow-[0_0_8px_rgba(99,102,241,0.4)]',
  };
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', variants[variant], glow && glowMap[variant], className)}>
      {children}
    </span>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7', xl: 'w-10 h-10' };
  return (
    <svg className={clsx('animate-spin', sizes[size], className || 'text-indigo-500')} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
export function Card({ children, className, padding = true, hover, dark }) {
  return (
    <div className={clsx(
      dark
        ? 'bg-[#0e1629] border border-[#1e2d4a] rounded-2xl'
        : 'bg-white border border-slate-200 rounded-2xl shadow-sm',
      padding && 'p-5',
      hover && !dark && 'hover:shadow-md hover:border-slate-300 transition-all cursor-pointer',
      hover && dark && 'hover:border-slate-600 transition-all cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────────
export function Input({ label, error, className, prefix, suffix, dark, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className={clsx('text-sm font-semibold', dark ? 'text-slate-300' : 'text-slate-700')}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3.5 text-slate-400 pointer-events-none">{prefix}</span>}
        <input
          className={clsx(
            'w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all duration-200',
            'placeholder:text-slate-400',
            dark
              ? 'bg-slate-800/80 border border-slate-700 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
              : 'bg-white border text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400',
            error ? 'border-rose-400' : dark ? '' : 'border-slate-200 hover:border-slate-300',
            prefix && 'pl-10',
            suffix && 'pr-10',
          )}
          {...props}
        />
        {suffix && <span className="absolute right-3.5 text-slate-400 pointer-events-none">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-rose-500 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
export function Skeleton({ className, lines = 1 }) {
  if (lines > 1) {
    return (
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={clsx('skeleton h-4 rounded-lg', i === lines - 1 && 'w-3/4', className)} />
        ))}
      </div>
    );
  }
  return <div className={clsx('skeleton h-4 rounded-lg', className)} />;
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, change, changeLabel, icon: Icon, gradient, className }) {
  const isPositive = change >= 0;
  const gradients = {
    indigo:  'from-indigo-500 to-violet-600',
    emerald: 'from-emerald-500 to-green-600',
    amber:   'from-amber-400 to-orange-500',
    rose:    'from-rose-500 to-red-600',
    blue:    'from-blue-500 to-cyan-600',
    purple:  'from-purple-500 to-pink-600',
  };
  return (
    <div className={clsx('bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all', className)}>
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-sm', gradient ? gradients[gradient] : gradients.indigo)}>
            <Icon size={18} />
          </div>
        )}
        {change !== undefined && (
          <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', isPositive ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-600 bg-rose-50 border border-rose-200')}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-1.5 font-medium">{label}</p>
      {changeLabel && <p className="text-xs text-slate-400 mt-0.5">{changeLabel}</p>}
    </div>
  );
}

// ── Status Dot ─────────────────────────────────────────────────────────────────
export function StatusDot({ status, className }) {
  const colors = {
    AVAILABLE: 'bg-emerald-500',
    ON_RIDE:   'bg-amber-400',
    OFFLINE:   'bg-slate-400',
    ONLINE:    'bg-emerald-500',
    ARRIVING:  'bg-blue-500',
    ACTIVE:    'bg-emerald-500',
    OPEN:      'bg-rose-500',
    ACKNOWLEDGED: 'bg-amber-400',
    RESOLVED:  'bg-emerald-500',
  };
  const color = colors[status] || 'bg-slate-400';
  const shouldPulse = status !== 'OFFLINE' && status !== 'RESOLVED';
  return (
    <span className={clsx('inline-block w-2 h-2 rounded-full', color, shouldPulse && 'pulse', className)} />
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in border border-slate-200', className)}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-lg leading-none">✕</button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action, dark }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className={clsx('w-16 h-16 rounded-2xl flex items-center justify-center mb-4', dark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-200')}>
          <Icon size={28} className={dark ? 'text-slate-500' : 'text-slate-400'} />
        </div>
      )}
      <h3 className={clsx('text-base font-bold mt-1', dark ? 'text-white' : 'text-slate-800')}>{title}</h3>
      {description && <p className={clsx('text-sm mt-1.5 max-w-xs leading-relaxed', dark ? 'text-slate-400' : 'text-slate-500')}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md', className, ring }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const gradients = [
    'from-indigo-500 to-violet-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-400 to-orange-500',
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-violet-600',
  ];
  const g = gradients[name?.charCodeAt(0) % gradients.length] || gradients[0];
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 bg-gradient-to-br select-none', sizes[size], g, ring && 'ring-2 ring-white ring-offset-1', className)}>
      {initials}
    </div>
  );
}

// ── Rating Stars ───────────────────────────────────────────────────────────────
export function Rating({ value, size = 'sm' }) {
  const sizes = { sm: 'text-xs', md: 'text-sm' };
  return (
    <span className={clsx('inline-flex items-center gap-1 font-semibold', sizes[size])}>
      <span className="text-amber-400">★</span>
      <span className="text-slate-700">{value?.toFixed(1)}</span>
    </span>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, className, dark }) {
  return (
    <div className={clsx('flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className={clsx('text-lg font-bold tracking-tight', dark ? 'text-white' : 'text-slate-900')}>{title}</h2>
        {subtitle && <p className={clsx('text-sm mt-0.5', dark ? 'text-slate-400' : 'text-slate-500')}>{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────
export function Divider({ className }) {
  return <hr className={clsx('border-0 border-t border-slate-100', className)} />;
}

// ── Severity Badge ─────────────────────────────────────────────────────────────
export function SeverityBadge({ severity }) {
  const map = {
    CRITICAL: { label: 'Critical', cls: 'bg-rose-50 text-rose-700 border border-rose-200 shadow-[0_0_8px_rgba(244,63,94,0.2)]' },
    WARNING:  { label: 'Warning',  cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    INFO:     { label: 'Info',     cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  };
  const { label, cls } = map[severity] || map.INFO;
  return <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-bold', cls)}>{label}</span>;
}

// ── Progress Bar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'indigo', className }) {
  const pct = Math.min((value / max) * 100, 100);
  const colors = {
    indigo:  'from-indigo-500 to-violet-500',
    emerald: 'from-emerald-400 to-green-500',
    amber:   'from-amber-400 to-orange-400',
    rose:    'from-rose-400 to-red-500',
  };
  return (
    <div className={clsx('h-1.5 bg-slate-100 rounded-full overflow-hidden', className)}>
      <div className={clsx('h-full bg-gradient-to-r rounded-full transition-all duration-500', colors[color] || colors.indigo)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={clsx('flex gap-0.5 bg-slate-100 p-1 rounded-xl', className)}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'flex-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-200',
            active === tab.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50',
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx('ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold', active === tab.value ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export { VehicleIcon } from './VehicleIcon';
