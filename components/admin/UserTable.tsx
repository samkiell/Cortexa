'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Shield, 
  Search,
  Loader2,
  Trash2,
  User,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Ban,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
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

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        toast.success(`Role updated to ${newRole}`);
      }
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const toggleSuspension = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: newStatus }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, suspended: newStatus } : u));
        toast.success(newStatus ? 'User suspended' : 'User activated');
      }
    } catch (err) {
      toast.error('Failed to update suspension status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user and all their conversations?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        toast.success('User deleted');
      }
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
          <input 
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#161616] border-[0.5px] border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f9fafb] outline-none focus:border-accent/50 transition-all"
          />
        </div>
        <div className="text-[13px] text-[#6b7280]">
          Showing {filteredUsers.length} users
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-xl border-[0.5px] border-[#2a2a2a] bg-[#161616] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#2a2a2a]">
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">Chats</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              <AnimatePresence mode="popLayout">
                {paginatedUsers.map((u) => (
                  <motion.tr 
                    key={u._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-accent/20 border border-accent/30 overflow-hidden flex items-center justify-center text-accent text-sm font-bold">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span>{u.name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-[#f9fafb] leading-tight flex items-center gap-2">
                            {u.name || 'Anonymous'}
                            {u.role === 'admin' && (
                              <ShieldCheck className="h-3 w-3 text-accent" />
                            )}
                          </div>
                          <div className="text-[12px] text-[#6b7280] leading-tight">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleRole(u._id, u.role)}
                        className={`text-[12px] px-2.5 py-1 rounded-full font-medium transition-all ${
                          u.role === 'admin' 
                          ? 'bg-accent/10 text-accent border border-accent/20' 
                          : 'bg-[#1a1a1a] text-[#6b7280] border border-[#2a2a2a]'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1.5 text-[12px] font-medium ${u.suspended ? 'text-red-500' : 'text-green-500'}`}>
                        {u.suspended ? (
                          <><Ban className="h-3 w-3" /> Suspended</>
                        ) : (
                          <><UserCheck className="h-3 w-3" /> Active</>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#f9fafb]">
                      {u.conversationCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleSuspension(u._id, !!u.suspended)}
                          className={`p-2 rounded-lg transition-colors ${u.suspended ? 'text-green-500 hover:bg-green-500/10' : 'text-amber-500 hover:bg-amber-500/10'}`}
                          title={u.suspended ? "Activate User" : "Suspend User"}
                        >
                          {u.suspended ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => deleteUser(u._id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6b7280] text-sm">No users found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-[#111111] border-t border-[#2a2a2a] flex items-center justify-between">
            <p className="text-[13px] text-[#6b7280]">Page {currentPage} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-[#f9fafb] disabled:opacity-40 hover:bg-[#252525] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-[#f9fafb] disabled:opacity-40 hover:bg-[#252525] transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
