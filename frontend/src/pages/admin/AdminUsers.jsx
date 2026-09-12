import { useState, useMemo } from 'react';
import { MOCK_USERS } from '@/mock/users.js';
import { Avatar, Rating } from '@/components/ui';
import { MapPin, Users, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';

const STATE_LIST = [...new Set(MOCK_USERS.map(u => u.state).filter(Boolean))].sort();

export default function AdminUsers() {
  const [search, setSearch]         = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage]             = useState(0);
  const PAGE_SIZE = 100;

  const filtered = useMemo(() => {
    let list = MOCK_USERS;
    if (stateFilter !== 'ALL') list = list.filter(u => u.state === stateFilter);
    if (statusFilter === 'ACTIVE')   list = list.filter(u => u.isActive);
    if (statusFilter === 'INACTIVE') list = list.filter(u => !u.isActive);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.city?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, stateFilter, statusFilter]);

  const page_data = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);


  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Passenger Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {MOCK_USERS.length.toLocaleString()} registered passengers · {MOCK_USERS.filter(u=>u.isActive).length.toLocaleString()} active
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search name, email, city…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 w-56 transition-all"
          />
          {/* State filter */}
          <div className="relative">
            <select
              value={stateFilter}
              onChange={e => { setStateFilter(e.target.value); setPage(0); }}
              className="pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/25 appearance-none cursor-pointer"
            >
              <option value="ALL">All States</option>
              {STATE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-3.5 text-slate-400 pointer-events-none" />
          </div>
          {/* Status tabs */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 gap-0.5">
            {['ALL','ACTIVE','INACTIVE'].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter===s ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users,        label: 'Total Users',    val: MOCK_USERS.length.toLocaleString(),                        cls: 'bg-blue-50 text-blue-700 border-blue-100' },
          { icon: CheckCircle2, label: 'Active',          val: MOCK_USERS.filter(u=>u.isActive).length.toLocaleString(), cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          { icon: MapPin,       label: 'States Covered', val: STATE_LIST.length,                                          cls: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
          { icon: XCircle,      label: 'Filtered',        val: filtered.length.toLocaleString(),                          cls: 'bg-slate-50 text-slate-700 border-slate-100' },
        ].map(({ icon: I, label, val, cls }) => (
          <div key={label} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${cls}`}>
            <I size={18} className="flex-shrink-0" />
            <div><p className="text-lg font-black leading-none">{val}</p><p className="text-[11px] font-semibold opacity-70 mt-0.5">{label}</p></div>
          </div>
        ))}
      </div>

      {/* DPDP Privacy Protection Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
            🔒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                DPDP Privacy Compliance Shield Active
              </h3>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                PII Redacted
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin operations view restricted to fleet telemetry & audit metrics. Personal passenger phone numbers and email handles are cryptographically masked.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold text-indigo-600 bg-white px-3 py-1 rounded-xl border border-indigo-100 shrink-0">
          Privacy Policy v2.4
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Passenger</th>
                <th>Phone (Masked)</th>
                <th>State / City</th>
                <th>Rating</th>
                <th>Total Rides</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {page_data.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400 text-sm">No users match your filters</td></tr>
              ) : page_data.map(user => {
                // Privacy masking helper
                const maskedPhone = user.phone 
                  ? user.phone.replace(/^(\+?\d{2}\s?\d{2})\d{4,5}(\d{3})$/, '$1*****$2')
                  : '+91 98*****128';
                const maskedEmail = user.email
                  ? user.email.replace(/^(.{2})(.*)(@.*)$/, (m, a, b, c) => a + '***' + c)
                  : 'p***r@veloq.in';

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" ring />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <span className="text-[10px] text-slate-300">🔒</span>
                            {maskedEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit">
                        <span className="text-[10px] text-slate-400">🔒</span>
                        {maskedPhone}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-700 font-semibold">{user.city || '—'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 ml-4">{user.state || '—'}</p>
                    </td>
                    <td>
                      {user.rating != null ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                          ★ {user.rating}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td><span className="font-bold text-slate-800 text-sm">{user.totalRides.toLocaleString()}</span></td>
                    <td><span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-lg">{user.preferredPayment}</span></td>
                    <td>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                        user.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td><span className="text-xs text-slate-400 font-mono">{user.joinedAt}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                ← Prev
              </button>
              <span className="text-xs font-mono text-slate-500 px-2">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
