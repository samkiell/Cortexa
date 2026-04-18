'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Mail,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/support');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      toast.error('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setTickets(tickets.map(t => t._id === id ? { ...t, status: newStatus } : t));
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteTicket = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`/api/admin/support?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTickets(tickets.filter(t => t._id !== id));
        toast.success('Report deleted');
      }
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'closed': return <AlertCircle className="h-4 w-4 text-[#6b7280]" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-3xl font-bold text-[#f9fafb] mb-2 text-glow">Support & Reports</h1>
          <p className="text-[#6b7280] text-sm flex items-center gap-2">
            <LifeBuoy className="h-4 w-4" />
            Manage user submissions and platform feedback.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
          <input 
            type="text" 
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f9fafb] focus:border-accent/40 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#6b7280]" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-[#f9fafb] focus:border-accent/40 outline-none transition-all"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-[#6b7280] text-sm">Loading submissions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTickets.map((ticket, idx) => (
              <motion.div
                key={ticket._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden group hover:border-[#333333] transition-all"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[17px] font-semibold text-[#f9fafb] leading-tight">{ticket.subject}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                          ticket.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          ticket.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          ticket.status === 'closed' ? 'bg-[#2a2a2a] text-[#6b7280] border-[#333333]' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[12px] text-[#6b7280]">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {ticket.userEmail}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        value={ticket.status}
                        onChange={(e) => updateStatus(ticket._id, e.target.value)}
                        className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-2 py-1 text-[11px] text-[#9ca3af] outline-none hover:border-accent/40 transition-all"
                      >
                        <option value="open">Mark Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button 
                        onClick={() => deleteTicket(ticket._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#6b7280] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0d0d0d] rounded-xl p-4 border border-[#1f1f1f]">
                    <p className="text-[14px] text-[#d1d5db] leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTickets.length === 0 && (
            <div className="text-center py-20 bg-[#111111] rounded-2xl border border-dashed border-[#2a2a2a]">
              <LifeBuoy className="h-12 w-12 text-[#2a2a2a] mx-auto mb-4" />
              <p className="text-[#6b7280] text-sm">No reports found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
