'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MoreHorizontal,
  ChevronLeft, 
  ChevronRight,
  MessageCircle,
  Trash2,
  Settings,
  X,
  SquarePen,
  PanelLeftClose,
  LogOut,
  Search
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { isToday, isWithinInterval, subDays, startOfDay } from 'date-fns';
import { useSidebar } from '@/components/providers/SidebarProvider';
import Modal from '@/components/ui/Modal';
import NextImage from 'next/image';

interface Conversation {
  _id: string;
  title: string;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: any;
}

export default function ConversationSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userProfile, setUserProfile] = useState<{ avatarUrl?: string; name?: string } | null>(null);
  
  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return;
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, [session]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  }, [session, pathname]);

  const groupedConversations = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = subDays(startOfDay(now), 7);

    const groups: { [key: string]: Conversation[] } = {
      Today: [],
      'Previous 7 Days': [],
      Older: []
    };

    const filtered = conversations.filter(conv => 
      !searchQuery || (conv.title && conv.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filtered.forEach(conv => {
      const dateStr = conv.updatedAt || conv.createdAt;
      if (!dateStr) return; // Skip if no date
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return; // Skip invalid dates

      if (isToday(date)) {
        groups.Today.push(conv);
      } else if (date >= sevenDaysAgo) {
        groups['Previous 7 Days'].push(conv);
      } else {
        groups.Older.push(conv);
      }
    });

    return groups;
  }, [conversations, searchQuery]);

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
    } catch (_err) {
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
        description="Are you sure you want to permanently delete this conversation? This cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
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
          width: isOpen ? 240 : 0,
          x: isMobile ? (isOpen ? 0 : -240) : 0
        }}
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#1f1f1f] bg-[#0d0d0d] overflow-hidden transition-all duration-300 lg:relative ${!isOpen && !isMobile ? 'border-r-0' : ''}`}
      >
        {/* App Logo/Name & Toggle */}
        <div className="flex h-12 items-center justify-between px-4 shrink-0">
          <NextImage 
            src="/landscape_logo.png" 
            alt="Cortexa" 
            width={120}
            height={26}
            className="h-[26px] w-auto opacity-90" 
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#6b7280] transition-colors"
            title="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 pb-4">
          <Link 
            href="/chat"
            onClick={() => isMobile && setIsOpen(false)}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-[13px] text-[#9ca3af] hover:bg-[#1a1a1a] transition-all group"
          >
            <Plus className="h-4 w-4" />
            <span className="font-bold">New chat</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="px-3 mb-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b5563] group-focus-within:text-accent transition-colors" />
            <input 
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-9 pr-8 py-2 text-[12px] text-[#f9fafb] outline-none focus:border-accent/40 transition-all placeholder:text-[#333]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#4b5563] hover:text-[#f9fafb] transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-2 scrollbar-none pb-4">
          {Object.entries(groupedConversations).map(([group, items]) => (
            items.length > 0 && (
              <div key={group} className="space-y-0.5">
                <h3 className="px-3 py-3 text-[11px] font-medium text-[#6b7280]">{group}</h3>
                <div className="space-y-0.5">
                  {items.map((conv) => {
                    const isActive = pathname === `/chat/${conv._id}`;
                    return (
                      <Link
                        key={conv._id}
                        href={`/chat/${conv._id}`}
                        onClick={() => isMobile && setIsOpen(false)}
                        className={`group relative flex items-center justify-between rounded-lg px-3 py-2 text-[13px] line-height-[1.4] transition-all ${
                          isActive 
                            ? 'bg-[#1f1f1f] text-[#f9fafb]' 
                            : 'text-[#c9c9c9] hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <span className="truncate flex-1 pr-2">{conv.title || 'Untitled'}</span>
                        <div className="flex items-center">
                          <button 
                            onClick={(e) => handleDeleteClick(conv._id, e)}
                            className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity p-1"
                          >
                            <MoreHorizontal className="h-4 w-4 text-[#6b7280]" />
                          </button>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )
          ))}
          {isLoading && !conversations.length && (
            <div className="flex justify-center py-8">
              <div className="h-4 w-4 border-2 border-[#2a2a2a] border-t-[#6b7280] rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* User / Settings Footer */}
        <div className="mt-auto border-t border-[#1f1f1f] p-3 flex flex-col gap-3 group/footer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-full bg-[#1d4ed8] flex items-center justify-center shrink-0 overflow-hidden">
                {userProfile?.avatarUrl ? (
                  <NextImage 
                    src={userProfile.avatarUrl} 
                    alt="User" 
                    width={28}
                    height={28}
                    className="h-full w-full object-cover" 
                  />
                ) : session?.user?.image ? (
                  <NextImage 
                    src={session.user.image} 
                    alt="User" 
                    width={28}
                    height={28}
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <span className="text-[11px] font-medium text-[#93c5fd]">
                    {session?.user?.name ? (
                      session.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    ) : 'U'}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#d1d5db] truncate">{session?.user?.name || 'User'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Link
                href="/settings"
                className="p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#6b7280] hover:text-[#d1d5db] transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#6b7280] hover:text-red-400 transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
