import { useState, useEffect } from 'react';
import { incidentService } from '@/services';
import { SeverityBadge, StatusDot, Card, Spinner, EmptyState, SectionHeader } from '@/components/ui';
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_ORDER = { CRITICAL: 0, WARNING: 1, INFO: 2 };

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
    warning: incidents.filter(i => i.severity === 'WARNING' && i.status !== 'RESOLVED').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;

  return (
    <div className="p-5 space-y-5">
      <SectionHeader title="Incident Center" subtitle="Real-time operational alerts and monitoring" />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{counts.critical}</p>
          <p className="text-xs font-semibold text-red-500 mt-1">Critical</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{counts.warning}</p>
          <p className="text-xs font-semibold text-yellow-500 mt-1">Warning</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{counts.resolved}</p>
          <p className="text-xs font-semibold text-green-500 mt-1">Resolved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'CRITICAL', 'WARNING', 'INFO'].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold transition-colors', filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Incident list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <EmptyState icon={CheckCircle} title="No incidents" description="All clear — no active incidents match this filter" />
          ) : filtered.map(inc => (
            <div key={inc.id}
              onClick={() => setSelected(inc)}
              className={clsx('p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md', selected?.id === inc.id ? 'border-blue-400 bg-blue-50' : 'bg-white border-slate-200', inc.severity === 'CRITICAL' && inc.status === 'OPEN' && 'border-l-4 border-l-red-500')}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <StatusDot status={inc.status} />
                  <p className="text-sm font-semibold text-slate-900">{inc.title}</p>
                </div>
                <SeverityBadge severity={inc.severity} />
              </div>
              <p className="text-xs text-slate-500 mb-2 leading-relaxed">{inc.description.slice(0, 120)}…</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {inc.autoDetected && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Auto-detected</span>}
                  <span>{formatDistanceToNow(new Date(inc.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="flex gap-1.5">
                  {inc.status === 'OPEN' && (
                    <button onClick={(e) => { e.stopPropagation(); acknowledge(inc.id); }}
                      className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 font-medium transition-colors">
                      Acknowledge
                    </button>
                  )}
                  {inc.status !== 'RESOLVED' && (
                    <button onClick={(e) => { e.stopPropagation(); resolve(inc.id); }}
                      className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected ? (
          <Card className="h-fit sticky top-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selected.title}</h2>
                <p className="text-xs text-slate-500 mt-1">{selected.id}</p>
              </div>
              <SeverityBadge severity={selected.severity} />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">{selected.description}</p>
            <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
              {[
                { label: 'Category', value: selected.category.replace('_', ' ') },
                { label: 'Status', value: selected.status },
                { label: 'Area', value: selected.affectedArea || '—' },
                { label: 'Grid Cell', value: selected.affectedGridCell || '—' },
                { label: 'Assigned to', value: selected.assignedTo || 'Unassigned' },
                { label: 'Auto detected', value: selected.autoDetected ? 'Yes' : 'No' },
                { label: 'Created', value: formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true }) },
                { label: 'Updated', value: formatDistanceToNow(new Date(selected.updatedAt), { addSuffix: true }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-800">{value}</span>
                </div>
              ))}
              {Object.entries(selected.metadata || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-mono text-xs text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">{String(v)}</span>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            <div className="text-center">
              <Eye size={32} className="mx-auto mb-2 opacity-30" />
              <p>Select an incident to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
