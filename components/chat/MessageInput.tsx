'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SendHorizontal, 
  Image as ImageIcon, 
  X, 
  Mic,
  Loader2,
  Paperclip
} from 'lucide-react';
import { toast } from 'sonner';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface MessageInputProps {
  onSend: (message: string, image?: string) => void;
  isLoading: boolean;
  isVisionCapable: boolean;
}

export default function MessageInput({ onSend, isLoading, isVisionCapable }: MessageInputProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isListening, transcript, startListening, stopListening, isSupported: isVoiceSupported } = useVoiceInput();

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Update text when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setText(prev => prev ? `${prev} ${transcript}` : transcript);
    }
  }, [transcript]);

  const handleSend = () => {
    if ((!text.trim() && !image) || isLoading) return;
    onSend(text, image || undefined);
    setText('');
    setImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Max 5MB.");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear the input so the same file can be selected again if removed
    e.target.value = '';
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="w-full max-w-4xl px-4 pb-6">
      <div className="relative flex flex-col w-full bg-surface border border-white/10 rounded-2xl shadow-2xl focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 transition-all overflow-hidden">
        
        {/* Image Preview (Inside Container) */}
        <AnimatePresence>
          {image && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 border-b border-white/5"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 shadow-lg">
                <img src={image} alt="Preview" className="h-full w-full object-cover" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black transition-all"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col p-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message Cortexa..."
            className="w-full bg-transparent py-3 px-4 text-sm text-foreground outline-none resize-none min-h-[52px] scrollbar-none"
          />

          <div className="flex items-center justify-between px-2 pb-2 mt-1">
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Vision Button */}
              {isVisionCapable && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
                    title="Upload image"
                  >
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/webp"
                  />
                </>
              )}

              {/* Voice Button */}
              {isVoiceSupported && (
                <div className="relative flex items-center">
                  <button
                    onClick={toggleVoice}
                    className={`p-1.5 sm:p-2 rounded-xl transition-all relative z-10 ${
                      isListening ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                    title={isListening ? "Stop listening" : "Voice input"}
                  >
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  {isListening && (
                    <>
                      <motion.div
                        layoutId="pulse"
                        className="absolute inset-0 rounded-xl bg-accent/20"
                        animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="hidden sm:inline-block ml-2 text-xs font-medium text-accent animate-pulse">Listening...</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {text.length > 0 && (
                <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono">
                  {text.length}
                </span>
              )}
              
              <button
                onClick={handleSend}
                disabled={(!text.trim() && !image) || isLoading}
                className={`flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-xl shadow-lg transition-all ${
                  (!text.trim() && !image) || isLoading
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50' 
                    : 'bg-accent text-white hover:scale-105 active:scale-95 shadow-accent/20'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <SendHorizontal className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
