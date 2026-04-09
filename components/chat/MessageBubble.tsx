'use client';

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

const MessageBubble = memo(function MessageBubble({ message, isLast, onRegenerate }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const isAssistant = message.role === 'assistant';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`group flex w-full flex-col ${isAssistant ? 'items-start' : 'items-end'} mb-6`}
    >
      <div className={`relative flex flex-col gap-2 ${isAssistant ? 'w-full' : 'max-w-[85%]'}`}>
        
        {/* User Message Pill */}
        {!isAssistant ? (
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[18px] px-4 py-2.5 text-[14px] text-[#f9fafb]">
            {message.imageUrl && (
              <div className="mb-2 overflow-hidden rounded-lg border border-[#2e2e2e]">
                <img src={message.imageUrl} alt="Uploaded" className="max-h-64 object-contain" />
              </div>
            )}
            <p className="whitespace-pre-wrap leading-normal font-normal">{message.content}</p>
          </div>
        ) : (
          /* Assistant Message Content */
          <div className="w-full text-[14px] text-[#d4d4d4] leading-[1.8] font-normal">
            {message.content ? (
              <div className="prose prose-invert prose-sm max-w-none 
                prose-p:leading-[1.8] prose-p:mb-4 last:prose-p:mb-0
                prose-headings:text-[#f9fafb] prose-headings:font-medium prose-headings:mt-6 prose-headings:mb-3
                prose-code:text-[#a5b4fc] prose-code:bg-[#1a1a1a] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-[#111] prose-pre:border prose-pre:border-[#222] prose-pre:rounded-xl prose-pre:p-0
                prose-strong:text-[#f9fafb] prose-strong:font-semibold
                prose-ul:my-4 prose-ol:my-4 prose-li:my-1
                prose-blockquote:border-l-[#3b82f6] prose-blockquote:bg-[#1a1a1a]/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: ({ children }) => {
                      const [copied, setCopied] = useState(false);
                      const codeElement = React.Children.toArray(children)[0] as React.ReactElement;
                      const lang = (codeElement?.props as any)?.className?.replace('language-', '') || 'code';
                      const handleCopy = () => {
                        const code = (codeElement?.props as any)?.children;
                        if (code) {
                          navigator.clipboard.writeText(String(code));
                          setCopied(true);
                          toast.success('Code copied');
                          setTimeout(() => setCopied(false), 2000);
                        }
                      };
                      return (
                        <div className="my-4 overflow-hidden rounded-xl border border-[#222] bg-[#111]">
                          <div className="flex items-center justify-between border-b border-[#1e1e1e] bg-[#111] px-4 py-2 text-[11px] font-mono text-[#6b7280]">
                            <span>{lang}</span>
                            <button 
                              onClick={handleCopy}
                              className="flex items-center gap-1.5 hover:text-[#d1d5db] transition-colors"
                            >
                              {copied ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-4 overflow-x-auto text-[13px] text-[#d1d5db]">
                            {children}
                          </div>
                        </div>
                      );
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              /* Bouncing Dots Indicator */
              <div className="flex items-center gap-1.5 py-2">
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
                    className="h-1.5 w-1.5 rounded-full bg-[#6b7280]"
                  />
                ))}
              </div>
            )}

            {/* Assistant Action Row */}
            {message.content && (
              <motion.div 
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="flex items-center gap-2 mt-2 opacity-0 transition-opacity duration-150"
              >
                <button
                  onClick={copyToClipboard}
                  className="p-1 px-1.5 rounded hover:bg-[#1a1a1a] text-[#6b7280] hover:text-[#d1d5db] transition-all"
                >
                  {isCopied ? <Check className="h-[15px] w-[15px]" /> : <Copy className="h-[15px] w-[15px]" />}
                </button>
                <button
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  className={`p-1 px-1.5 rounded hover:bg-[#1a1a1a] transition-all ${feedback === 'up' ? 'text-[#3b82f6]' : 'text-[#6b7280] hover:text-[#d1d5db]'}`}
                >
                  <ThumbsUp className="h-[15px] w-[15px]" />
                </button>
                <button
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  className={`p-1 px-1.5 rounded hover:bg-[#1a1a1a] transition-all ${feedback === 'down' ? 'text-gray-400' : 'text-[#6b7280] hover:text-[#d1d5db]'}`}
                >
                  <ThumbsDown className="h-[15px] w-[15px]" />
                </button>
                {isLast && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1 px-1.5 rounded hover:bg-[#1a1a1a] text-[#6b7280] hover:text-[#d1d5db] transition-all"
                  >
                    <RefreshCw className="h-[15px] w-[15px]" />
                  </button>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default MessageBubble;
