'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw,
  X,
  Maximize2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp?: Date;
  modelId?: string;
}

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  onRegenerate?: () => void;
}

export default function MessageBubble({ message, isLast, onRegenerate }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const isAssistant = message.role === 'assistant';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`group flex w-full flex-col gap-2 p-4 sm:p-6 ${isAssistant ? 'items-start' : 'items-end'}`}>
      {/* Model Name Label for Assistant */}
      {isAssistant && message.modelId && (
        <span className="ml-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          {message.modelId}
        </span>
      )}

      <div className={`relative flex max-w-[85%] sm:max-w-[75%] flex-col gap-2 ${isAssistant ? 'items-start' : 'items-end'}`}>
        {/* Image Attachment */}
        {message.imageUrl && (
          <div 
            className="relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 group/image"
            onClick={() => setShowLightbox(true)}
          >
            <img 
              src={message.imageUrl} 
              alt="Uploaded content" 
              className="max-h-60 w-auto object-contain bg-black/20"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity">
              <Maximize2 className="h-6 w-6 text-white" />
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`relative px-4 py-3 text-sm leading-relaxed shadow-sm transition-all
          ${isAssistant 
            ? 'bg-surface border border-white/5 rounded-2xl rounded-tl-sm text-foreground' 
            : 'bg-accent/10 border border-accent/20 rounded-2xl rounded-tr-sm text-foreground'
          }`}
        >
          {isAssistant ? (
            <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/5 prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1 prose-code:rounded">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Typing Indicator if content is empty and assistant */}
          {isAssistant && !message.content && (
            <div className="flex gap-1 py-1 px-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Row */}
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="flex items-center gap-1 mt-1 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground transition-colors"
              title="Copy"
            >
              {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            
            {isAssistant && (
              <>
                <button
                  onClick={() => setIsLiked(isLiked === true ? null : true)}
                  className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${isLiked === true ? 'text-accent' : 'text-muted-foreground'}`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsLiked(isLiked === false ? null : false)}
                  className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${isLiked === false ? 'text-red-400' : 'text-muted-foreground'}`}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
                {isLast && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Timestamp */}
        {message.timestamp && (
          <span className="text-[10px] text-muted-foreground/60 mt-1">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-20"
            onClick={() => setShowLightbox(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-full max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={message.imageUrl} 
                className="max-h-[85vh] max-w-full object-contain rounded-lg"
                alt="Enlarged"
              />
              <button 
                onClick={() => setShowLightbox(false)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
