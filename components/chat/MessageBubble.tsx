'use client';

import { motion } from 'framer-motion';
import { Copy, Check, MessageCircle, Bot, User } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp?: Date;
}

export default function MessageBubble({ message }: { message: Message }) {
  const [isCopied, setIsCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full gap-4 px-4 py-6 ${isAssistant ? 'bg-surface/30' : ''}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-custom bg-base shadow-sm">
        {isAssistant ? (
          <Bot className="h-6 w-6 text-accent" />
        ) : (
          <User className="h-6 w-6 text-muted" />
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="font-syne text-sm font-bold text-white">
            {isAssistant ? 'Cortexa' : 'You'}
          </span>
          {isAssistant && (
            <button
              onClick={copyToClipboard}
              className="rounded-lg p-1.5 text-muted hover:bg-base hover:text-white transition-all"
              title="Copy message"
            >
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </div>

        {message.imageUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-64 w-full max-w-lg overflow-hidden rounded-2xl border border-border-custom"
          >
            <img 
              src={message.imageUrl} 
              alt="Uploaded context" 
              className="h-full w-full object-cover"
            />
          </motion.div>
        )}

        <div className={`prose prose-invert max-w-none text-text-custom leading-relaxed font-dm-sans ${isAssistant ? '' : 'text-right'}`}>
          {isAssistant ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
