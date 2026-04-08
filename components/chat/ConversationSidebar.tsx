'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquarePlus, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  MessageCircle,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export default function ConversationSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!session) return;
      try {
        const res = await fetch('/api/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [session, pathname]); // Re-fetch on pathname change to catch new chats

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations(conversations.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete conversation');
    }
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: isCollapsed ? 80 : 280 }}
      className="relative flex flex-col border-r border-border-custom bg-surface transition-all duration-300"
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border-custom">
        {!isCollapsed && (
          <span className="font-syne text-lg font-bold text-white tracking-tight">Cortexa</span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 text-muted hover:bg-base hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Link 
          href="/chat"
          className={`flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white hover:bg-accent-dim transition-all shadow-lg shadow-accent/10 ${isCollapsed ? 'w-12 px-0' : 'w-full'}`}
        >
          <MessageSquarePlus className="h-5 w-5" />
          {!isCollapsed && <span>New Chat</span>}
        </Link>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        <div>
          {!isCollapsed && <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted">Recent Chats</h3>}
          <div className="space-y-1">
            {isLoading ? (
              <div className="px-4 py-8 flex justify-center">
                <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-4 text-xs text-muted/50 italic">No history yet</div>
            ) : (
              conversations.map((conv) => (
                <Link
                  key={conv._id}
                  href={`/chat/${conv._id}`}
                  className={`group flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-all hover:bg-base ${
                    pathname === `/chat/${conv._id}` ? 'bg-base text-accent' : 'text-muted'
                  }`}
                >
                  <MessageCircle className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{conv.title}</span>
                      <button 
                        onClick={(e) => handleDelete(conv._id, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer / User Info */}
      <div className="mt-auto border-t border-border-custom p-4 space-y-4">
        {session?.user?.role === 'admin' && !isCollapsed && (
          <Link 
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted hover:bg-base hover:text-white transition-all"
          >
            <TrendingUp className="h-5 w-5" />
            <span>Admin Panel</span>
          </Link>
        )}
        
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold text-white truncate">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-muted truncate">{session?.user?.email}</p>
            </div>
          )}
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500 transition-all"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
