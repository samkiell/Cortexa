'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp?: Date;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  conversationId?: string;
  initialModels?: any[];
}

export default function ChatInterface({ 
  initialMessages = [], 
  conversationId: initialConvId,
  initialModels = []
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<any[]>(initialModels);
  const [selectedModel, setSelectedModel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Only fetch if models weren't preloaded
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
          // If no initial model or starting new chat, set first available
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

  // Fetch conversation details if ID exists to sync model
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

    const userMessage: Message = { role: 'user', content, imageUrl, timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 1. Get or create conversation if not exists
      let currentConvId = conversationId;
      if (!currentConvId) {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: content.slice(0, 30) + '...', 
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
        // Append user message to existing conversation
        await fetch(`/api/conversations/${currentConvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages }),
        });
      }

      // 2. Call chat API with streaming
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

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const assistantMessage: Message = { role: 'assistant', content: '', timestamp: new Date() };
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

      // 3. Final update to conversation in DB with assistant response
      if (currentConvId) {
        await fetch(`/api/conversations/${currentConvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [...newMessages, { role: 'assistant', content: accumulatedContent }] 
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

  return (
    <div className="flex flex-col h-full bg-base">
      {/* Header with Model Selector */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-border-custom bg-base/50 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="font-syne font-bold text-white tracking-tight truncate max-w-[200px]">
            {conversationId ? 'Chat Session' : 'New Chat'}
          </span>
        </div>
        <ModelSelector 
          currentModel={selectedModel} 
          onSelect={setSelectedModel} 
        />
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-custom">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-20 text-center space-y-12">
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h2 className="font-syne text-3xl font-bold text-white tracking-tight">How can I help you today?</h2>
              <p className="text-muted max-w-md mx-auto">
                Select from thousands of uncensored models and start chatting. Vision and reasoning capabilities available.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
              {[
                { title: "Creative Writing", prompt: "Write a short story about a neon-noir city." },
                { title: "Code Assistant", prompt: "Help me optimize this Go function." },
                { title: "General Knowledge", prompt: "Explain quantum entanglement like I'm five." },
                { title: "Image Analysis", prompt: "Analyze this image and describe the scene." }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  className="group flex flex-col items-start gap-2 rounded-2xl border border-border-custom bg-surface p-5 text-left transition-all hover:border-accent/50 hover:bg-base"
                >
                  <h3 className="text-sm font-bold text-white group-hover:text-accent transition-colors">{item.title}</h3>
                  <p className="text-xs text-muted truncate w-full">{item.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((m, idx) => (
              <MessageBubble key={idx} message={m} />
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 flex justify-center bg-gradient-to-t from-base via-base/80 to-transparent pt-10 px-4">
        <MessageInput 
          onSend={handleSend} 
          isLoading={isLoading}
          isVisionCapable={selectedModel.toLowerCase().includes('vision') || selectedModel.toLowerCase().includes('multimodal')}
        />
      </div>
    </div>
  );
}
