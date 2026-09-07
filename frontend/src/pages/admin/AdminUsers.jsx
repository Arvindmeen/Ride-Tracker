import { useState, useEffect } from 'react';
import { userService } from '@/services';
import { Card, Spinner, SectionHeader, Badge, Avatar, Rating } from '@/components/ui';
import { clsx } from 'clsx';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getUsers().then(u => { setUsers(u); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;

  return (
    <div className="p-5 space-y-5">
      <SectionHeader title="User Management" subtitle={`${users.length} registered users`} />
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>User</th><th>Phone</th><th>Rating</th><th>Rides</th><th>Payment</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm text-slate-600">{user.phone}</td>
                  <td><Rating value={user.rating} /></td>
                  <td className="text-center font-semibold">{user.totalRides}</td>
                  <td><Badge>{user.preferredPayment}</Badge></td>
                  <td><Badge variant={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="text-slate-500 text-xs">{user.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
