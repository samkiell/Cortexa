'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SquarePen, ArrowDown, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useSidebar } from '@/components/providers/SidebarProvider';
import { useModels } from '@/contexts/ModelContext';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSession } from 'next-auth/react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp?: Date;
  modelId?: string;
  isSearching?: boolean;
  searchQuery?: string;
  sources?: any[];
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  conversationId?: string;
  initialModels?: any[];
}

export default function ChatInterface({ 
  initialMessages = [], 
  conversationId: initialConvId,
}: ChatInterfaceProps) {
  const { toggle } = useSidebar();
  const { data: session } = useSession();
  const { models, getModelById, isLoading: isModelsLoading } = useModels();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingBufferRef = useRef('');
  const animationFrameRef = useRef<number | null>(null);
  const router = useRouter();

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

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
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
    setIsLoading(true);

    try {
      let currentConvId = conversationId;
      if (!currentConvId) {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: content.slice(0, 40) + (content.length > 40 ? '...' : ''), 
            modelId: selectedModel,
            messages: [userMessage]
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
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          imageBase64: imageUrl,
          searchEnabled
        }),
      });

      if (!response.ok) throw new Error(await response.text());

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
        
        // Handle SSE search events
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
              // Not JSON, probably plain text token
              streamingBufferRef.current += jsonStr;
              if (!animationFrameRef.current) {
                animationFrameRef.current = requestAnimationFrame(flush);
              }
            }
          }
        } else {
          // Plain text token
          streamingBufferRef.current += chunk;
          if (!animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(flush);
          }
        }
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      flush();

      // Final save to DB
      if (currentConvId) {
        const lastMsg = { 
          role: 'assistant', 
          content: streamingBufferRef.current, 
          modelId: selectedModel, 
          timestamp: new Date(),
          sources: (messages[messages.length-1] as any)?.sources // Access via ref or state
        };
        
        await fetch(`/api/conversations/${currentConvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [...nextMessages, lastMsg] 
          }),
        });
      }

    } catch (error: any) {
      toast.error(error.message || 'Error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const modelInfo = useMemo(() => {
    return getModelById(selectedModel);
  }, [selectedModel, getModelById]);

  const isVisionCapable = modelInfo?.vision || false;
  const supportsTools = (modelInfo as any)?.supportsTools || false;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 24) return 'Good evening';
    return 'Good night';
  };

  const userName = session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : '';

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] overflow-hidden relative font-inter">
      {/* Minimal Top Bar */}
      <header className="flex items-center justify-between h-14 px-4 shrink-0 z-40">
        <div className="flex items-center gap-2">
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
                  <img src="/logo.png" alt="Cortexa Logo" className="h-16 w-16 opacity-90" />
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

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scrollToBottom()}
              className="fixed bottom-32 right-1/2 translate-x-[340px] transform hidden lg:flex h-8 w-8 items-center justify-center rounded-full bg-[#161616] border border-[#2a2a2a] text-[#6b7280] hover:text-[#f9fafb] transition-all shadow-lg z-20"
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
      />
    </div>
  );
}
