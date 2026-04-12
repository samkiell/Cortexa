'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Activity, 
  Zap,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: data?.stats?.totalUsers || 0, icon: Users },
    { label: 'Total Conversations', value: data?.stats?.totalConversations || 0, icon: MessageSquare },
    { label: 'Total Messages', value: data?.stats?.totalMessages || 0, icon: Zap },
    { label: 'Active Today', value: data?.stats?.activeToday || 0, icon: Activity },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-syne text-3xl font-bold text-[#f9fafb] mb-2 text-glow">Dashboard</h1>
        <p className="text-[#6b7280] text-sm">Real-time platform metrics and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#161616] border-[0.5px] border-[#2a2a2a] rounded-[12px] p-5 shadow-lg group hover:border-accent/40 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-[12px] text-[#6b7280] uppercase tracking-widest font-semibold">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-[#6b7280] group-hover:text-accent transition-colors" />
            </div>
            <p className="text-[32px] font-semibold text-[#f9fafb] leading-none">{stat.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-[18px] font-semibold text-[#f9fafb]">Recent Conversations</h2>
        <div className="overflow-hidden rounded-[12px] border-[0.5px] border-[#2a2a2a] bg-[#161616]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#111111]">
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">Model</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">Messages</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {data?.recentConversations?.map((conv: any) => (
                <tr key={conv.id} className="hover:bg-[#1a1a1a] transition-colors group">
                  <td className="px-6 py-4 text-[14px] text-[#f9fafb]">{conv.userEmail}</td>
                  <td className="px-6 py-4 text-[13px] text-[#9ca3af]">
                    <span className="px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] text-[11px]">
                      {conv.modelId.split('/').pop()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#f9fafb] font-medium">{conv.messageCount}</td>
                  <td className="px-6 py-4 text-[13px] text-[#6b7280]">
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
              {(!data?.recentConversations || data.recentConversations.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#6b7280] text-sm">No recent activity.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
