'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Code, PenTool, Lightbulb, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useSidebar } from '@/components/providers/SidebarProvider';
import { useModels } from '@/contexts/ModelContext';
import { useVirtualizer } from '@tanstack/react-virtual';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp?: Date;
  modelId?: string;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  conversationId?: string;
}

const EXAMPLE_PROMPTS = [
  { icon: PenTool, title: "Creative Writing", prompt: "Write a short story about a neon-noir city." },
  { icon: Code, title: "Code Assistant", prompt: "Help me optimize this React component." },
  { icon: Lightbulb, title: "General Knowledge", prompt: "Explain quantum entanglement like I'm five." },
  { icon: MessageSquare, title: "Roleplay", prompt: "Act as a futuristic philosopher debating AI consciousness." }
];

export default function ChatInterface({ 
  initialMessages = [], 
  conversationId: initialConvId,
}: ChatInterfaceProps) {
  const { toggle } = useSidebar();
  const { models, getModelById } = useModels();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingBufferRef = useRef('');
  const animationFrameRef = useRef<number | null>(null);
  const router = useRouter();

  // Set default model once models are loaded
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[4]?.id || models[0]?.id);
    }
  }, [models, selectedModel]);

  // Sync model with conversation
  useEffect(() => {
    if (conversationId) {
      const fetchConv = async () => {
        try {
          const res = await fetch(`/api/conversations/${conversationId}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedModel(data.modelId);
          }
        } catch (err) {
          console.error('Failed to sync conversation model');
        }
      };
      fetchConv();
    }
  }, [conversationId]);

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => 100, // Estimated height of a message bubble
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

  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'assistant') {
        return [...prev.slice(0, -1), { ...last, content }];
      }
      return prev;
    });
  }, []);

  const handleSend = async (content: string, imageUrl?: string) => {
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
            title: content.slice(0, 30) + (content.length > 30 ? '...' : ''), 
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
      } else {
        await fetch(`/api/conversations/${currentConvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages }),
        });
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modelId: selectedModel, 
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          imageBase64: imageUrl 
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
      
      setMessages([...nextMessages, assistantMessage]);
      streamingBufferRef.current = '';

      const flush = () => {
        updateLastMessage(streamingBufferRef.current);
        animationFrameRef.current = null;
      };

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const token = decoder.decode(value);
        streamingBufferRef.current += token;
        
        if (!animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(flush);
        }
      }

      // Final flush
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      flush();

      if (currentConvId) {
        await fetch(`/api/conversations/${currentConvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [...nextMessages, { role: 'assistant', content: streamingBufferRef.current, modelId: selectedModel, timestamp: new Date() }] 
          }),
        });
      }

    } catch (error: any) {
      toast.error(error.message || 'Error in chat interface');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      if (messages[messages.length - 1].role === 'assistant') {
        setMessages(prev => prev.slice(0, -1));
      }
      handleSend(lastUserMessage.content, lastUserMessage.imageUrl);
    }
  }, [messages, handleSend]);

  const isVisionCapable = useMemo(() => {
    return getModelById(selectedModel)?.vision || false;
  }, [selectedModel, getModelById]);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-white/5 bg-background/50 backdrop-blur-xl z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={toggle}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden sm:flex p-1 rounded-lg bg-accent/10">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-foreground tracking-tight uppercase font-mono truncate max-w-[100px] sm:max-w-none">
            {conversationId ? 'SessionActive' : 'NewInterface'}
          </span>
        </div>
        <ModelSelector 
          currentModel={selectedModel} 
          onSelect={setSelectedModel} 
        />
      </header>

      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative"
      >
        <div className="sticky top-0 left-0 right-0 h-10 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-4 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="relative">
                  <Sparkles className="h-24 w-24 text-accent/5 mx-auto" />
                  <motion.div 
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Sparkles className="h-12 w-12 text-accent/20" />
                  </motion.div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Start a conversation</h2>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Choose a model and explore the boundaries of uncensored AI.
                  </p>
                </div>

                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full"
                >
                  {EXAMPLE_PROMPTS.map((item, idx) => (
                    <motion.button
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      onClick={() => handleSend(item.prompt)}
                      className="group flex items-center gap-4 rounded-xl border border-white/5 bg-surface p-4 text-left transition-all hover:border-accent/30 hover:bg-surface/80"
                    >
                      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-accent/10 transition-colors">
                        <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-foreground">{item.title}</h3>
                        <p className="text-[10px] text-muted-foreground truncate w-full max-w-[150px]">{item.prompt}</p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <div 
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
              className="py-8 pb-32"
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
                      onRegenerate={handleRegenerate}
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
                  <MessageBubble 
                    message={{ role: 'assistant', content: '', modelId: selectedModel }} 
                  />
                </div>
              )}
              <div ref={messagesEndRef} className="h-32" />
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent pt-20 pb-4 z-20 pointer-events-none">
        <div className="max-w-4xl mx-auto w-full flex justify-center pointer-events-auto">
          <MessageInput 
            onSend={handleSend} 
            isLoading={isLoading}
            isVisionCapable={isVisionCapable}
          />
        </div>
      </div>
    </div>
  );
}
