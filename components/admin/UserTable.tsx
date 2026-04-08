'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Users, 
  Shield, 
  User, 
  Mail, 
  Calendar,
  MoreVertical,
  Loader2,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const changeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) => 
          prev.map(u => u._id === userId ? { ...u, role: newRole } : u)
        );
        toast.success('Role updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  return (
    <div className="rounded-2xl border border-border-custom bg-surface overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-base border-b border-border-custom">
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-custom">
            {users.map((u) => (
              <motion.tr 
                key={u._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-base/30 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border border-border-custom bg-base flex items-center justify-center text-accent font-bold">
                      {u.name?.[0] || u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white leading-tight">{u.name || 'Anonymous'}</div>
                      <div className="text-xs text-muted leading-tight">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-green-500 font-bold text-[10px] uppercase tracking-tighter">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    className="bg-base border border-border-custom rounded-lg px-3 py-1.5 text-xs font-medium text-white outline-none focus:border-accent transition-all cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-muted">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
