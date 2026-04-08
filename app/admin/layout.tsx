import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, 
  Settings as SettingsIcon, 
  Users, 
  ChevronLeft,
  LayoutDashboard
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    redirect('/chat');
  }

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-border-custom bg-surface flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border-custom">
          <Link href="/chat" className="flex items-center gap-2 text-muted hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span className="font-syne font-bold text-white">Admin Central</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-base hover:text-white transition-all"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-base hover:text-white transition-all"
          >
            <Users className="h-5 w-5" />
            User Management
          </Link>
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-base hover:text-white transition-all"
          >
            <SettingsIcon className="h-5 w-5" />
            Platform Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-border-custom">
          <div className="rounded-xl bg-accent/10 p-4">
            <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Status</p>
            <p className="text-sm text-text-custom">Systems Operational</p>
          </div>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
