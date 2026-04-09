import React, { useState, memo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  RefreshCw,
  Globe,
  ExternalLink,
  Pencil,
  Trash2
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
  isSearching?: boolean;
  searchQuery?: string;
  sources?: { title: string; url: string; content: string }[];
}

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onEdit?: (newContent: string) => void;
}

const MessageBubble = memo(function MessageBubble({ message, isLast, onRegenerate, onDelete, onEdit }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const isAssistant = message.role === 'assistant';

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = 'auto';
      editRef.current.style.height = `${editRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() !== message.content) {
      onEdit?.(editValue);
    }
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`group flex w-full flex-col ${isAssistant ? 'items-start' : 'items-end'} mb-6 relative`}
    >
      <div className={`relative flex flex-col gap-2 ${isAssistant ? 'w-full' : 'max-w-[85%] items-end'}`}>
        
        {/* User Message Pill or Editor */}
        {!isAssistant ? (
          <div className="w-full flex flex-col items-end">
            {isEditing ? (
              <div className="w-full min-w-[300px] bg-[#1a1a1a] border border-[#3b82f6]/30 rounded-xl p-3">
                <textarea
                  ref={editRef}
                  value={editValue}
                  onChange={(e) => {
                    setEditValue(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  className="w-full bg-transparent text-[14px] text-[#f9fafb] outline-none resize-none leading-relaxed"
                  rows={1}
                />
                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[#2a2a2a]">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 rounded-md text-[12px] text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#2a2a2a] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="px-3 py-1 rounded-md text-[12px] bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group/userbubble">
                {/* User Hover Actions (to the left) */}
                <div className="absolute left-0 -translate-x-full top-0 h-full pr-2 flex items-start pt-1 opacity-0 group-hover/userbubble:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg p-0.5 shadow-xl">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1 px-1.5 rounded hover:bg-[#1a1a1a] text-[#6b7280] hover:text-[#d1d5db] transition-all" title="Edit"
                    >
                      <Pencil className="h-[13px] w-[13px]" />
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className="p-1 px-1.5 rounded hover:bg-[#1a1a1a] text-[#6b7280] hover:text-[#d1d5db] transition-all" title="Copy"
                    >
                      {isCopied ? <Check className="h-[13px] w-[13px]" /> : <Copy className="h-[13px] w-[13px]" />}
                    </button>
                    <button 
                      onClick={onDelete}
                      className="p-1 px-1.5 rounded hover:bg-[#1a1a1a] text-[#6b7280] hover:text-red-400 transition-all" title="Delete"
                    >
                      <Trash2 className="h-[13px] w-[13px]" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[18px] px-4 py-2.5 text-[14px] text-[#f9fafb]">
                  {message.imageUrl && (
                    <div className="mb-2 overflow-hidden rounded-lg border border-[#2e2e2e]">
                      <img src={message.imageUrl} alt="Uploaded" className="max-h-64 object-contain" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-normal font-normal">{message.content}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Assistant Message Content */
          <div className="w-full text-[14px] text-[#d4d4d4] leading-[1.8] font-normal">
            
            {/* Search Activity Indicator */}
            {message.isSearching && (
              <div className="flex items-center gap-2 mb-4 animate-pulse">
                <Globe className="h-3 w-3 text-[#3b82f6]" />
                <span className="text-[12px] text-[#6b7280] italic">Searching the web for "{message.searchQuery}"...</span>
              </div>
            )}

            {isEditing ? (
              <div className="w-full bg-[#1a1a1a] border border-[#3b82f6]/30 rounded-xl p-3">
                <textarea
                  ref={editRef}
                  value={editValue}
                  onChange={(e) => {
                    setEditValue(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  className="w-full bg-transparent text-[14px] text-[#f9fafb] outline-none resize-none leading-relaxed"
                  rows={1}
                />
                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[#2a2a2a]">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1 rounded-md text-[12px] text-[#9ca3af] hover:text-[#f9fafb] transition-all">Cancel</button>
                  <button onClick={handleSaveEdit} className="px-3 py-1 rounded-md text-[12px] bg-[#3b82f6] text-white transition-all">Save</button>
                </div>
              </div>
            ) : message.content ? (
              <>
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

                {/* Sources Section */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-6 border-t border-[#1f1f1f] pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-3 w-3 text-[#6b7280]" />
                      <span className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wider">Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.slice(0, 3).map((source, idx) => {
                        const domain = new URL(source.url).hostname.replace('www.', '');
                        return (
                          <a 
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 hover:bg-[#1a1a1a] hover:border-[#3b82f6]/30 transition-all group"
                          >
                            <img 
                              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
                              alt="" 
                              className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[12px] font-medium text-[#c9c9c9] group-hover:text-[#f9fafb] truncate max-w-[140px]">
                                {source.title}
                              </span>
                              <span className="text-[10px] text-[#6b7280]">{domain}</span>
                            </div>
                            <ExternalLink className="h-2.5 w-2.5 text-[#4b5563] ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Bouncing Dots Indicator */
              !message.isSearching && (
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
              )
            )}

            {/* Assistant Action Row */}
            {!isEditing && message.content && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              >
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyToClipboard}
                    className="p-1 px-1.5 rounded hover:bg-[#1a1a1a] text-[#6b7280] hover:text-[#d1d5db] transition-all"
                    title="Copy"
                  >
                    {isCopied ? <Check className="h-[15px] w-[15px]" /> : <Copy className="h-[15px] w-[15px]" />}
                  </button>
                  {isLast && onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      className="p-1 px-1.5 rounded hover:bg-[#1a1a1a] text-[#6b7280] hover:text-[#d1d5db] transition-all"
                      title="Regenerate"
                    >
                      <RefreshCw className="h-[15px] w-[15px]" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default MessageBubble;
