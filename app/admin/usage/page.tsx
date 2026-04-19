'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Users, 
  Cpu, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Layers,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function UsageDashboard() {
  const [data, setData] = useState<any>(null);
  const [pricing, setPricing] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const [usageRes, settingsRes] = await Promise.all([
          fetch('/api/admin/usage'),
          fetch('/api/admin/settings')
        ]);

        if (usageRes.ok && settingsRes.ok) {
          const usageJson = await usageRes.json();
          const settingsJson = await settingsRes.json();
          setData(usageJson);
          setPricing(settingsJson.modelPricing || {});
        }
      } catch (err) {
        console.error('Failed to fetch usage data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Tokens', value: data?.stats?.totalTokens || 0, icon: Zap, detail: 'Cumulative usage' },
    { label: 'Total Requests', value: data?.stats?.requestCount || 0, icon: Activity, detail: 'Successful calls' },
    { label: 'Today\'s Tokens', value: data?.stats?.todayTokens || 0, icon: Calendar, detail: 'Since midnight' },
    { label: 'Estimated Cost', value: 0, icon: DollarSign, detail: 'Total USD (Estimated)', isUSD: true },
  ];

  // Calculate costs
  const calculateCost = (modelId: string, tokens: number) => {
    const price = pricing[modelId]?.pricePer1kTokens || 0;
    return (tokens / 1000) * price;
  };

  const totalCost = data?.modelUsage?.reduce((acc: number, m: any) => {
    return acc + calculateCost(m.modelId, m.totalTokens);
  }, 0) || 0;

  stats[3].value = totalCost;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-syne text-3xl font-bold text-[#f9fafb] mb-2 text-glow">API Usage</h1>
          <p className="text-[#6b7280] text-sm">Detailed breakdown of token consumption across models and users.</p>
        </div>
      </div>

      {/* Stats Grid */}
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
            <div className="flex items-end gap-2">
              <p className="text-[32px] font-semibold text-[#f9fafb] leading-none">
                {stat.isUSD ? `$${stat.value.toFixed(4)}` : stat.value.toLocaleString()}
              </p>
            </div>
            <p className="text-[11px] text-[#4b5563] mt-2 italic">{stat.detail}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Model Usage List */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-[18px] font-semibold text-[#f9fafb] flex items-center gap-2">
            <Cpu className="h-5 w-5 text-accent" />
            Model Efficiency
          </h2>
          <div className="space-y-4">
            {data?.modelUsage?.map((model: any, idx: number) => (
              <motion.div
                key={model.modelId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#161616] border-[0.5px] border-[#2a2a2a] rounded-[12px] p-4 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[14px] font-medium text-[#f9fafb] break-all">
                    {model.modelId.split('/').pop()}
                  </span>
                  <span className="text-[12px] text-accent font-mono">
                    {((model.totalTokens / (data.stats.totalTokens || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden mb-3">
                  <div 
                    className="bg-accent h-full transition-all duration-1000" 
                    style={{ width: `${(model.totalTokens / (data.stats.totalTokens || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#6b7280]">
                  <span>{model.totalTokens.toLocaleString()} tokens</span>
                  <span className="font-mono text-accent/80">${calculateCost(model.modelId, model.totalTokens).toFixed(4)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* User Usage Table */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-[18px] font-semibold text-[#f9fafb] flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Top Consumers
          </h2>
          <div className="overflow-hidden rounded-[12px] border-[0.5px] border-[#2a2a2a] bg-[#161616]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a2a2a] bg-[#111111]">
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider text-right">Tokens</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider text-right">Cost (Est.)</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider text-center">Models Used</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {data?.userUsage?.map((user: any) => (
                  <tr key={user._id} className="hover:bg-[#1a1a1a] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[14px] text-[#f9fafb] font-medium">{user.userEmail}</span>
                        <span className="text-[10px] text-[#4b5563] font-mono">{user._id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[14px] text-accent font-semibold">{user.totalTokens.toLocaleString()}</span>
                        <span className="text-[10px] text-[#6b7280]">
                          {user.promptTokens.toLocaleString()} / {user.completionTokens.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[14px] text-[#f9fafb] font-mono">
                        ${(user.totalTokens / 1000 * 0.0002).toFixed(4)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {user.models.map((m: any) => (
                          <span key={m} className="px-1.5 py-0.5 rounded bg-[#1e1e1e] border border-[#2a2a2a] text-[9px] text-[#9ca3af]">
                            {m.split('/').pop()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-[13px] text-[#6b7280]">
                      {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
                {(!data?.userUsage || data.userUsage.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#6b7280] text-sm">No usage data recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
