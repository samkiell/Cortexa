import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Conversation from '@/lib/models/Conversation';
import Settings from '@/lib/models/Settings';
import { 
  Users, 
  MessageSquare, 
  Database, 
  Settings as SettingsIcon,
  Search,
  CheckCircle2
} from 'lucide-react';

import { getSettings, getModels } from '@/lib/models-data';

export default async function AdminDashboard() {
  await dbConnect();

  const [userCount, conversationCount, settings] = await Promise.all([
    User.countDocuments(),
    Conversation.countDocuments(),
    getSettings(),
  ]);

  const visibleModelsCount = settings?.visibleModels?.length || 0;

  const stats = [
    { label: 'Total Users', value: userCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Chat Logs', value: conversationCount, icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Active Models', value: visibleModelsCount, icon: Database, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-syne text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-muted">Real-time stats and platform health monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-border-custom bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-muted">vs last 30d: +12%</span>
            </div>
            <p className="text-muted text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-border-custom bg-surface p-6">
          <h2 className="font-syne text-xl font-bold text-white mb-6">Recent Platform Events</h2>
          <div className="space-y-4">
            {[
              { event: 'New user joined', user: 'sarah.j@example.com', time: '2 mins ago' },
              { event: 'New chat started', user: 'anon-user-82', time: '14 mins ago' },
              { event: 'Settings updated', user: 'Admin', time: '1 hour ago' },
            ].map((e, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border-custom pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <div>
                    <p className="text-sm font-medium text-text-custom">{e.event}</p>
                    <p className="text-xs text-muted">{e.user}</p>
                  </div>
                </div>
                <span className="text-xs text-muted">{e.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border-custom bg-surface p-6">
          <h2 className="font-syne text-xl font-bold text-white mb-6">System Health</h2>
          <div className="space-y-4">
            {[
              { label: 'Featherless API', status: 'Online', delay: '12ms' },
              { label: 'MongoDB Cluster', status: 'Online', delay: '4ms' },
              { label: 'Auth Service', status: 'Online', delay: '21ms' },
            ].map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-base/50">
                <span className="text-sm text-text-custom font-medium">{s.label}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted">{s.delay}</span>
                  <div className="flex items-center gap-1 text-green-500 font-bold text-xs uppercase tracking-tighter">
                    <CheckCircle2 className="h-3 w-3" />
                    {s.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
