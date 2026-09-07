import { useAuthStore } from '@/stores';
import { Avatar, Card, Badge, Rating } from '@/components/ui';
import { MapPin, Star, Clock, Shield, Phone, Mail, Home, Briefcase, ChevronRight } from 'lucide-react';

export default function UserProfile() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
      {/* Header */}
      <Card className="flex items-center gap-4">
        <Avatar name={user.name} size="xl" />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <Rating value={user.rating} size="md" />
            <span className="text-sm text-slate-500">{user.totalRides} rides</span>
          </div>
        </div>
      </Card>

      {/* Contact */}
      <Card>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Contact info</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone size={15} className="text-slate-400" />
            <span className="text-slate-700">{user.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail size={15} className="text-slate-400" />
            <span className="text-slate-700">{user.email}</span>
          </div>
        </div>
      </Card>

      {/* Saved places */}
      {user.savedPlaces?.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Saved places</h2>
          <div className="space-y-2">
            {user.savedPlaces.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.icon === 'HOME' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                  {p.icon === 'HOME' ? <Home size={14} /> : <Briefcase size={14} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{p.label}</p>
                  <p className="text-xs text-slate-500 truncate">{p.address}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Emergency contacts */}
      {user.emergencyContacts?.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={15} className="text-red-500" />
            <h2 className="text-sm font-semibold text-slate-900">Emergency contacts</h2>
          </div>
          {user.emergencyContacts.map(c => (
            <div key={c.id} className="flex items-center gap-3 py-2">
              <Avatar name={c.name} size="sm" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">{c.relation} · {c.phone}</p>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Account actions */}
      <Card padding={false}>
        {[
          { label: 'Payment methods', icon: '💳' },
          { label: 'Notifications', icon: '🔔' },
          { label: 'Privacy & safety', icon: '🔒' },
          { label: 'Help & support', icon: '❓' },
        ].map(({ label, icon }) => (
          <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5 border-b last:border-0 border-slate-100 hover:bg-slate-50 text-left transition-colors">
            <span className="text-lg">{icon}</span>
            <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
        ))}
      </Card>
    </div>
  );
}
