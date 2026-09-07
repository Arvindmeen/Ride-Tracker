import { clsx } from 'clsx';

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className, loading, disabled, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 select-none';
  const variants = {
    primary: 'bg-blue-600 text-white border-transparent hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50',
    secondary: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50',
    danger: 'bg-red-600 text-white border-transparent hover:bg-red-700 disabled:opacity-50',
    ghost: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 disabled:opacity-50',
    outline: 'bg-transparent text-blue-600 border-blue-200 hover:bg-blue-50 disabled:opacity-50',
  };
  const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
    orange: 'bg-orange-50 text-orange-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7', xl: 'w-10 h-10' };
  return (
    <svg className={clsx('animate-spin text-blue-500', sizes[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className, padding = true }) {
  return (
    <div className={clsx('bg-white border border-slate-200 rounded-xl', padding && 'p-4', className)}>
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, className, prefix, suffix, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-slate-400">{prefix}</span>}
        <input
          className={clsx(
            'w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition',
            'placeholder:text-slate-400',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300',
            prefix && 'pl-9',
            suffix && 'pr-9',
          )}
          {...props}
        />
        {suffix && <span className="absolute right-3 text-slate-400">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className, lines = 1 }) {
  if (lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={clsx('skeleton h-4 rounded', i === lines - 1 && 'w-3/4', className)} />
        ))}
      </div>
    );
  }
  return <div className={clsx('skeleton h-4 rounded', className)} />;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, change, changeLabel, icon: Icon, iconColor = 'text-blue-500', iconBg = 'bg-blue-50', className }) {
  const isPositive = change >= 0;
  return (
    <Card className={clsx('flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between">
        <div className={clsx('p-2 rounded-lg', iconBg)}>
          {Icon && <Icon size={18} className={iconColor} />}
        </div>
        {change !== undefined && (
          <span className={clsx('text-xs font-medium px-1.5 py-0.5 rounded', isPositive ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50')}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
        {changeLabel && <p className="text-xs text-slate-400 mt-0.5">{changeLabel}</p>}
      </div>
    </Card>
  );
}

// ── Status Dot ────────────────────────────────────────────────────────────────
export function StatusDot({ status, className }) {
  const colors = {
    AVAILABLE: 'bg-green-500',
    ON_RIDE: 'bg-yellow-500',
    OFFLINE: 'bg-slate-400',
    ONLINE: 'bg-green-500',
    ARRIVING: 'bg-blue-500',
    ACTIVE: 'bg-green-500',
    OPEN: 'bg-red-500',
    ACKNOWLEDGED: 'bg-yellow-500',
    RESOLVED: 'bg-green-500',
  };
  const color = colors[status] || 'bg-slate-400';
  return <span className={clsx('inline-block w-2 h-2 rounded-full', color, status !== 'OFFLINE' && status !== 'RESOLVED' && 'pulse', className)} />;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto slide-up', className)}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && <div className="p-4 bg-slate-100 rounded-full mb-4"><Icon size={28} className="text-slate-400" /></div>}
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md', className }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
  const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-blue-500';
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0', sizes[size], color, className)}>
      {initials}
    </div>
  );
}

// ── Rating Stars ──────────────────────────────────────────────────────────────
export function Rating({ value, size = 'sm' }) {
  const sizes = { sm: 'text-xs', md: 'text-sm' };
  return (
    <span className={clsx('inline-flex items-center gap-0.5 font-medium text-amber-500', sizes[size])}>
      ★ <span className="text-slate-700">{value?.toFixed(1)}</span>
    </span>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, className }) {
  return (
    <div className={clsx('flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ className }) {
  return <hr className={clsx('border-0 border-t border-slate-100', className)} />;
}

// ── Severity Badge ─────────────────────────────────────────────────────────────
export function SeverityBadge({ severity }) {
  const map = {
    CRITICAL: { label: 'Critical', cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
    WARNING: { label: 'Warning', cls: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200' },
    INFO: { label: 'Info', cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  };
  const { label, cls } = map[severity] || map.INFO;
  return <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', cls)}>{label}</span>;
}
