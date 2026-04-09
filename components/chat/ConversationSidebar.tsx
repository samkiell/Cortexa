'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  MessageCircle,
  Trash2,
  Sparkles,
  X
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { useSidebar } from '@/components/providers/SidebarProvider';
import Modal from '@/components/ui/Modal';

export default function ConversationSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      // Fetch if session exists AND (on desktop OR the sidebar drawer is open on mobile)
      if (!session || (isMobile && !isOpen)) return;
      
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
  }, [session, pathname, isOpen, isMobile]);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTargetDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetDeleteId) return;
    try {
      const res = await fetch(`/api/conversations/${targetDeleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c._id !== targetDeleteId));
      }
    } catch (err) {
      console.error('Failed to delete conversation');
    } finally {
      setDeleteModalOpen(false);
      setTargetDeleteId(null);
    }
  };

  return (
    <>
      <Modal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        description="Are you sure you want to permanently delete this conversation history? This action cannot be undone."
        confirmText="Delete History"
        variant="danger"
      />
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 300,
          x: isMobile ? (isOpen ? 0 : -300) : 0
        }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/5 bg-background transition-all duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'shadow-2xl' : ''}`}
      >
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-white/5">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-mono text-sm font-bold text-foreground tracking-widest uppercase">Cortexa</span>
          </div>
        )}
        <button 
          onClick={isMobile ? () => setIsOpen(false) : () => setIsCollapsed(!isCollapsed)}
          className={`rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isMobile ? (
            <X className="h-4 w-4" />
          ) : (
            isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Link 
          href="/chat"
          className={`flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-surface/80 hover:border-accent/30 transition-all group ${isCollapsed ? 'w-12 px-0 mx-auto' : 'w-full'}`}
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          {!isCollapsed && <span>New Conversation</span>}
        </Link>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
        <div>
          {!isCollapsed && (
            <h3 className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">History</h3>
          )}
          <div className="space-y-1">
            {isLoading ? (
              <div className="px-4 py-8 flex justify-center">
                <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              !isCollapsed && <div className="px-4 py-4 text-[10px] text-muted-foreground/30 uppercase font-mono italic">Void</div>
            ) : (
              conversations.map((conv) => {
                const isActive = pathname === `/chat/${conv._id}`;
                return (
                  <Link
                    key={conv._id}
                    href={`/chat/${conv._id}`}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all border border-transparent ${
                      isActive 
                        ? 'bg-accent/5 border-accent/20 text-foreground' 
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute left-0 top-2 bottom-2 w-0.5 bg-accent rounded-full"
                      />
                    )}
                    <MessageCircle className={`h-4 w-4 shrink-0 ${isActive ? 'text-accent' : 'text-muted-foreground/60'}`} />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{conv.title || 'Untitled Session'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono text-muted-foreground/40 truncate uppercase">
                            {conv.modelId?.split('/').pop() || 'Model'}
                          </span>
                          <span className="text-[9px] text-muted-foreground/30">•</span>
                          <span className="text-[9px] text-muted-foreground/30 whitespace-nowrap">
                            {conv.updatedAt ? formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false }) : 'just now'}
                          </span>
                        </div>
                      </div>
                    )}
                    {!isCollapsed && (
                      <button 
                        onClick={(e) => handleDeleteClick(conv._id, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer / User Info */}
      <div className="mt-auto border-t border-white/5 p-4 space-y-2">
        {session?.user?.role === 'admin' && !isCollapsed && (
          <Link 
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all group"
          >
            <TrendingUp className="h-4 w-4 text-muted-foreground/60 group-hover:text-accent transition-colors" />
            <span>Admin Interface</span>
          </Link>
        )}
        
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-surface/50 ${isCollapsed ? 'justify-center px-0 bg-transparent border-none' : ''}`}>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 p-1">
              <p className="text-xs font-bold text-foreground truncate">{session?.user?.name || 'Authorized User'}</p>
              <p className="text-[10px] text-muted-foreground/50 truncate font-mono uppercase tracking-tighter">{session?.user?.role || 'Guest'}</p>
            </div>
          )}
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-lg p-2 text-muted-foreground hover:bg-red-400/10 hover:text-red-400 transition-all"
            title="Deauthorize"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.aside>
    </>
  );
}
