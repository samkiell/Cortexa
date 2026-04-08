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
}

export default function ChatInterface({ 
  initialMessages = [], 
  conversationId: initialConvId 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConvId);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('huihui-ai/Llama-3.3-70B-Instruct-abliterated');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
          <div className="flex items-center justify-center h-full text-muted py-20">
            <p>Start a conversation with {selectedModel.split('/').pop()}</p>
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
