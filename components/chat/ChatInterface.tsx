'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Code, PenTool, Lightbulb, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useSidebar } from '@/components/providers/SidebarProvider';
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
  initialModels?: any[];
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
  initialModels = []
}: ChatInterfaceProps) {
  const { toggle } = useSidebar();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<any[]>(initialModels);
  const [selectedModel, setSelectedModel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (models.length > 0) {
      if (!selectedModel) {
        setSelectedModel(models[0].id);
      }
      return;
    }

    const fetchModels = async () => {
      try {
        const res = await fetch('/api/models');
        if (res.ok) {
          const data = await res.json();
          setModels(data);
          if (!selectedModel && data.length > 0) {
            setSelectedModel(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch models');
      }
    };
    fetchModels();
  }, [models, selectedModel]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string, imageUrl?: string) => {
    if (!content.trim() && !imageUrl) return;

    const userMessage: Message = { 
      role: 'user', 
      content, 
      imageUrl, 
      timestamp: new Date() 
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
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
          router.replace(`/chat/${currentConvId}`);
        }
      } else {
        await fetch(`/api/conversations/${currentConvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages }),
        });
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modelId: selectedModel, 
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
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
      setMessages([...newMessages, assistantMessage]);

      let accumulatedContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const token = new TextDecoder().decode(value);
        accumulatedContent += token;
        
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: accumulatedContent }];
          }
          return prev;
        });
      }

      if (currentConvId) {
        await fetch(`/api/conversations/${currentConvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [...newMessages, { role: 'assistant', content: accumulatedContent, modelId: selectedModel, timestamp: new Date() }] 
          }),
        });
      }

    } catch (error: any) {
      toast.error(error.message || 'Error in chat interface');
      console.error(error);
    } finally {
      setIsLoading(true); // Small hack to show typing for a brief moment if needed, but actually set to false
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove last assistant message if exists
      if (messages[messages.length - 1].role === 'assistant') {
        setMessages(prev => prev.slice(0, -1));
      }
      handleSend(lastUserMessage.content, lastUserMessage.imageUrl);
    }
  };

  const isVisionCapable = selectedModel.toLowerCase().includes('vision') || 
                          selectedModel.toLowerCase().includes('multimodal') ||
                          models.find(m => m.id === selectedModel)?.isVision;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* Header */}
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

      {/* Messages Scroll Area */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative"
      >
        {/* Scroll Fade Overlay */}
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
            <div className="flex flex-col py-8 pb-32">
              <AnimatePresence initial={false}>
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <MessageBubble 
                      message={m} 
                      isLast={idx === messages.length - 1}
                      onRegenerate={handleRegenerate}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && messages[messages.length-1].role === 'user' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <MessageBubble 
                    message={{ role: 'assistant', content: '', modelId: selectedModel }} 
                  />
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-32" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent pt-20 pb-4 z-20 pointer-events-none">
        <div className="max-w-4xl mx-auto w-full flex justify-center pointer-events-auto">
          <MessageInput 
            onSend={handleSend} 
            isLoading={isLoading}
            isVisionCapable={!!isVisionCapable}
          />
        </div>
      </div>
    </div>
  );
}
