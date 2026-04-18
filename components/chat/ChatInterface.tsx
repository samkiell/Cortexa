'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SquarePen, ArrowDown, Menu, PanelLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSidebar } from '@/components/providers/SidebarProvider';
import { useModels } from '@/contexts/ModelContext';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSession } from 'next-auth/react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import NextImage from 'next/image';
import ModelSelector from './ModelSelector';

import { Message, Source } from '@/types/chat';

interface ChatInterfaceProps {
  initialMessages?: Message[];
  conversationId?: string;
  initialModels?: unknown[];
}

export default function ChatInterface({ 
  initialMessages = [], 
  conversationId: initialConvId,
}: ChatInterfaceProps) {
  const { isOpen, setIsOpen, toggle } = useSidebar();
  const { data: session } = useSession();
  const { models, getModelById, isLoading: isModelsLoading } = useModels();
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Reset when navigating to 'New Chat'
  useEffect(() => {
    if (pathname === '/chat' && messages.length > 0) {
      setMessages([]);
      setConversationId(undefined);
    }
  }, [pathname]);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingBufferRef = useRef('');
  const animationFrameRef = useRef<number | null>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isVisionCapable) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please drop an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Max 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      toast.success("Image attached");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!isVisionCapable) {
      toast.error("Selected model doesn't support images.");
      return;
    }

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      const saved = localStorage.getItem('last_selected_model');
      setSelectedModel(saved || models[0].id);
    }
  }, [models, selectedModel]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('last_selected_model', selectedModel);
    }
  }, [selectedModel]);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'smooth') => {
    if (scrollAreaRef.current) {
      const scrollHeight = scrollAreaRef.current.scrollHeight;
      scrollAreaRef.current.scrollTo({
        top: scrollHeight,
        behavior
      });
    }
  }, []);

  useEffect(() => {
    // Only scroll automatically on mount/reset if there's history
    if (messages.length > 0 && messages[messages.length-1].role === 'user' && !isLoading) {
       scrollToBottom('smooth');
    }
  }, [messages.length, scrollToBottom]); 

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      // Show button if we are more than 150px from the bottom
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 150);
    }
  }, []);

  const updateLastMessage = useCallback((update: Partial<Message>) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'assistant') {
        return [...prev.slice(0, -1), { ...last, ...update }];
      }
      return prev;
    });
  }, []);

  const executeChat = async (currentMessages: Message[], convId: string | undefined, imageUrl?: string, searchEnabled?: boolean) => {
    setIsLoading(true);
    // Explicitly scroll to user message
    setTimeout(() => scrollToBottom('smooth'), 50);
    
    try {
      let currentConvId = convId;
      const lastUserMsg = currentMessages[currentMessages.length - 1];

      // New conversation handling
      if (!currentConvId) {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: lastUserMsg.content.slice(0, 40) + (lastUserMsg.content.length > 40 ? '...' : ''), 
            modelId: selectedModel,
            messages: [lastUserMsg]
          }),
        });
        if (createRes.ok) {
          const conv = await createRes.json();
          currentConvId = conv._id;
          setConversationId(currentConvId);
          window.history.replaceState(null, '', `/chat/${currentConvId}`);
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modelId: selectedModel, 
          messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
          imageBase64: imageUrl || lastUserMsg.imageUrl,
          searchEnabled
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        // If the error is an HTML page (standard Next.js error), show a generic message
        if (errorData.includes('<!DOCTYPE html>') || errorData.includes('<html')) {
          throw new Error('A server error occurred. Please try again later.');
        }
        
        try {
          const parsed = JSON.parse(errorData);
          throw new Error(parsed.error || parsed.message || 'Error occurred');
        } catch (e) {
          throw new Error(errorData || 'Failed to get response');
        }
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: '', 
        timestamp: new Date(),
        modelId: selectedModel
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      streamingBufferRef.current = '';

      const flush = () => {
        updateLastMessage({ content: streamingBufferRef.current });
        animationFrameRef.current = null;
      };

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        if (chunk.startsWith('data: ')) {
          const lines = chunk.split('\n\n').filter(Boolean);
          for (const line of lines) {
            const jsonStr = line.replace('data: ', '').trim();
            if (!jsonStr) continue;
            try {
              const data = JSON.parse(jsonStr);
              if (data.type === 'search_start') {
                updateLastMessage({ isSearching: true, searchQuery: data.query });
              } else if (data.type === 'sources') {
                updateLastMessage({ isSearching: false, sources: data.sources });
              }
            } catch (e) {
              streamingBufferRef.current += jsonStr;
              if (!animationFrameRef.current) animationFrameRef.current = requestAnimationFrame(flush);
            }
          }
        } else {
          streamingBufferRef.current += chunk;
          if (!animationFrameRef.current) animationFrameRef.current = requestAnimationFrame(flush);
        }
      }

      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      flush();

      // Final save to DB
      if (currentConvId) {
        const lastMsg = { 
          role: 'assistant', 
          content: streamingBufferRef.current, 
          modelId: selectedModel, 
          timestamp: new Date(),
        };
        
        await fetch(`/api/conversations/${currentConvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...currentMessages, lastMsg] }),
        });
      }

    } catch (error: any) {
      // Professional error handling: don't show full HTML or object logs
      const msg = typeof error === 'string' ? error : (error.message || 'An unexpected error occurred');
      toast.error(msg);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (index: number) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    setMessages(updatedMessages);

    if (conversationId) {
      try {
        await fetch(`/api/conversations/${conversationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) }),
        });
      } catch (error) {
        console.error('Failed to update conversation after delete:', error);
      }
    }
  };

  const handleEditMessage = async (index: number, newContent: string) => {
    const messageToEdit = messages[index];
    if (!messageToEdit) return;

    if (messageToEdit.role === 'user') {
      // Truncate and resend
      const truncatedMessages = messages.slice(0, index + 1);
      truncatedMessages[index] = { ...messageToEdit, content: newContent };
      setMessages(truncatedMessages);
      executeChat(truncatedMessages, conversationId);
    } else {
      // Just update assistant message
      const updatedMessages = [...messages];
      updatedMessages[index] = { ...messageToEdit, content: newContent };
      setMessages(updatedMessages);
      if (conversationId) {
        await fetch(`/api/conversations/${conversationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) }),
        });
      }
    }
  };

  const handleSend = async (content: string, imageUrl?: string, searchEnabled?: boolean) => {
    if (!content.trim() && !imageUrl) return;

    const userMessage: Message = { 
      role: 'user', 
      content, 
      imageUrl, 
      timestamp: new Date() 
    };
    
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    executeChat(nextMessages, conversationId, imageUrl, searchEnabled);
  };

  const modelInfo = useMemo(() => {
    return getModelById(selectedModel);
  }, [selectedModel, getModelById]);

  const isVisionCapable = modelInfo?.vision || false;
  const supportsTools = (modelInfo as { supportsTools?: boolean })?.supportsTools || false;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 24) return 'Good evening';
    return 'Good night';
  };

  const userName = session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : '';

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-full bg-[#0d0d0d] overflow-hidden relative font-inter"
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-[#3b82f6]/10 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-[#3b82f6]/40 m-4 rounded-[24px]"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
                <NextImage src="/logo.png" alt="" width={32} height={32} className="opacity-80" />
              </div>
              <p className="text-lg font-medium text-[#3b82f6]">Drop image to attach</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimal Top Bar */}
      <header className="flex items-center justify-between h-14 px-4 shrink-0 z-40">
        <div className="flex items-center gap-2">
          {!isOpen && (
            <button 
              onClick={() => setIsOpen(true)}
              className="hidden lg:block p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#6b7280] transition-colors"
              title="Open sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}
          <button 
            onClick={toggle}
            className="lg:hidden p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#6b7280] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <ModelSelector 
            currentModel={selectedModel} 
            onSelect={setSelectedModel} 
          />
        </div>

        <button 
          onClick={() => router.push('/chat')}
          className="p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#9ca3af] transition-colors"
          title="New chat"
        >
          <SquarePen className="h-[18px] w-[18px]" />
        </button>
      </header>

      <div 
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-none relative"
      >
        <div className="max-w-[680px] mx-auto w-full h-full px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full pb-32">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full text-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex justify-center mb-6"
                >
                  <NextImage 
                    src="/logo.png" 
                    alt="Cortexa Logo" 
                    width={80}
                    height={80}
                    className="h-20 w-20 opacity-90" 
                  />
                </motion.div>
                <h2 className="text-[28px] font-medium text-[#f9fafb] tracking-tight">
                  {getGreeting()}{userName}.
                </h2>
                <p className="text-[16px] text-[#6b7280] mt-2">
                  How can I help you today?
                </p>
              </motion.div>
            </div>
          ) : (
            <div 
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
              className="pt-6 pb-40"
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const m = messages[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <MessageBubble 
                      message={m} 
                      isLast={virtualRow.index === messages.length - 1}
                      onRegenerate={() => handleSend(messages[messages.length-2].content, messages[messages.length-2].imageUrl)}
                      onDelete={() => handleDeleteMessage(virtualRow.index)}
                      onEdit={(newContent) => handleEditMessage(virtualRow.index, newContent)}
                    />
                  </div>
                );
              })}
              {isLoading && messages[messages.length-1].role === 'user' && (
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${rowVirtualizer.getTotalSize()}px)`,
                  }}
                >
                  <MessageBubble message={{ role: 'assistant', content: '' }} />
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Scroll to bottom button - Now relative to chat column */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scrollToBottom('smooth')}
              className="absolute bottom-6 right-6 h-9 w-9 flex items-center justify-center rounded-full bg-[#161616] border border-[#2a2a2a] text-[#6b7280] hover:text-[#f9fafb] transition-all shadow-xl z-50 lg:flex"
            >
              <ArrowDown className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <MessageInput 
        onSend={handleSend} 
        isLoading={isLoading}
        isVisionCapable={isVisionCapable}
        supportsTools={supportsTools}
        image={image}
        setImage={setImage}
      />
    </div>
  );
}
