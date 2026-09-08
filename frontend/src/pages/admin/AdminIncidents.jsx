import { useState, useEffect } from 'react';
import { incidentService } from '@/services';
import { SeverityBadge, StatusDot, Spinner, EmptyState } from '@/components/ui';
import { AlertTriangle, CheckCircle, Eye, ShieldAlert, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_ORDER = { CRITICAL: 0, WARNING: 1, INFO: 2 };

const SUMMARY_CARDS = [
  { key: 'critical', label: 'Critical',  gradient: 'from-rose-500 to-red-600',    bg: 'bg-rose-50 border-rose-200',   text: 'text-rose-600' },
  { key: 'warning',  label: 'Warning',   gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-600' },
  { key: 'resolved', label: 'Resolved',  gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600' },
];

const FILTER_PILLS = ['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'CRITICAL', 'WARNING', 'INFO'];

export default function AdminIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    incidentService.getIncidents().then(i => { setIncidents(i); setLoading(false); });
  }, []);

  const acknowledge = async (id) => {
    await incidentService.acknowledgeIncident(id);
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'ACKNOWLEDGED' } : i));
  };

  const resolve = async (id) => {
    await incidentService.resolveIncident(id);
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : i));
  };

  const filtered = incidents
    .filter(i => filter === 'ALL' || i.status === filter || i.severity === filter)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const counts = {
    critical: incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
    warning:  incidents.filter(i => i.severity === 'WARNING'  && i.status !== 'RESOLVED').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <Spinner size="xl" className="text-indigo-500" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Incidents & SOS Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time operational alerts and safety monitoring</p>
        </div>
        {counts.critical > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 animate-pulse">
            <ShieldAlert size={15} className="text-rose-600" />
            <span className="text-xs font-black text-rose-700">{counts.critical} Critical Active</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {SUMMARY_CARDS.map(({ key, label, gradient, bg, text }) => (
          <div key={key} className={clsx('rounded-2xl border p-5 flex items-center gap-4', bg)}>
            <div className={clsx('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl font-black text-white', gradient)}>
              {counts[key]}
            </div>
            <div>
              <p className={clsx('text-base font-black', text)}>{counts[key]}</p>
              <p className="text-xs font-semibold text-slate-600">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_PILLS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              filter === f
                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-transparent shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Incident List */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState icon={CheckCircle} title="No incidents" description="All clear — no active incidents match this filter" />
          ) : filtered.map(inc => (
            <div
              key={inc.id}
              onClick={() => setSelected(inc)}
              className={clsx(
                'p-4 rounded-2xl border cursor-pointer transition-all',
                selected?.id === inc.id
                  ? 'border-indigo-300 bg-indigo-50 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm',
                inc.severity === 'CRITICAL' && inc.status === 'OPEN' && 'border-l-4 border-l-rose-500',
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <StatusDot status={inc.status} />
                  <p className="text-sm font-bold text-slate-900">{inc.title}</p>
                </div>
                <SeverityBadge severity={inc.severity} />
              </div>

              <p className="text-xs text-slate-500 mb-3 leading-relaxed">{inc.description.slice(0, 120)}…</p>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {inc.autoDetected && (
                    <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-lg font-semibold">Auto-detected</span>
                  )}
                  <Clock size={10} />
                  <span>{formatDistanceToNow(new Date(inc.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="flex gap-1.5">
                  {inc.status === 'OPEN' && (
                    <button
                      onClick={e => { e.stopPropagation(); acknowledge(inc.id); }}
                      className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 font-bold transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {inc.status !== 'RESOLVED' && (
                    <button
                      onClick={e => { e.stopPropagation(); resolve(inc.id); }}
                      className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 font-bold transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selected.title}</h2>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{selected.id}</p>
                </div>
                <SeverityBadge severity={selected.severity} />
              </div>

              <p className="text-sm text-slate-700 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selected.description}
              </p>

              <div className="space-y-2.5 text-sm border-t border-slate-100 pt-4">
                {[
                  { label: 'Category',    value: selected.category.replace('_', ' ') },
                  { label: 'Status',      value: selected.status },
                  { label: 'Area',        value: selected.affectedArea || '—' },
                  { label: 'Grid Cell',   value: selected.affectedGridCell || '—' },
                  { label: 'Assigned to', value: selected.assignedTo || 'Unassigned' },
                  { label: 'Auto detected', value: selected.autoDetected ? 'Yes' : 'No' },
                  { label: 'Created',     value: formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true }) },
                  { label: 'Updated',     value: formatDistanceToNow(new Date(selected.updatedAt), { addSuffix: true }) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500 font-medium">{label}</span>
                    <span className="font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
                {Object.entries(selected.metadata || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center py-20 text-center">
              <Eye size={32} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">Select an incident</p>
              <p className="text-xs text-slate-400 mt-1">Click any incident to view full details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
