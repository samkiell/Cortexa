import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUp, 
  X, 
  Mic,
  Paperclip,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface MessageInputProps {
  onSend: (message: string, image?: string, searchEnabled?: boolean) => void;
  isLoading: boolean;
  isVisionCapable: boolean;
  supportsTools?: boolean;
}

export default function MessageInput({ onSend, isLoading, isVisionCapable, supportsTools = false }: MessageInputProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [searchEnabled, setSearchEnabled] = useLocalStorage('cortexaSearchEnabled', false);
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
    onSend(text, image || undefined, searchEnabled);
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const canSend = (text.trim().length > 0 || image) && !isLoading;

  return (
    <div className="w-full bg-[#0d0d0d] pb-6 px-4 shrink-0">
      <div className="max-w-[680px] mx-auto">
        <div className="relative flex flex-col w-full bg-[#161616] border border-[#2a2a2a] rounded-[20px] transition-all duration-200 focus-within:border-[#3b82f6]/40 focus-within:ring-1 focus-within:ring-[#3b82f6]/10">
            
            {/* Image Preview */}
            <AnimatePresence>
              {image && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3"
                >
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-[#2a2a2a]">
                    <img src={image} alt="" className="h-full w-full object-cover" />
                    <button 
                      onClick={() => setImage(null)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
              className="w-full bg-transparent py-3 px-4 text-[14px] text-[#f9fafb] placeholder-[#4b5563] outline-none resize-none min-h-[48px] leading-normal"
            />

            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                {isVisionCapable && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center p-1.5 rounded-md text-[#6b7280] hover:text-[#d1d5db] transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </button>
                )}
                
                {isVoiceSupported && (
                  <div className="relative flex items-center justify-center">
                    <button
                      onClick={toggleVoice}
                      className={`p-1.5 rounded-md transition-colors relative z-10 flex items-center justify-center ${
                        isListening ? 'text-[#3b82f6]' : 'text-[#6b7280] hover:text-[#d1d5db]'
                      }`}
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    {isListening && (
                      <motion.div
                        layoutId="mic-pulse"
                        className="absolute inset-0 rounded-md bg-[#3b82f6]/20"
                        animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                )}

                {supportsTools && (
                  <button
                    onClick={() => setSearchEnabled(!searchEnabled)}
                    className={`flex items-center justify-center p-1.5 rounded-md transition-all group relative ${
                      searchEnabled 
                        ? 'text-[#3b82f6] bg-[#3b82f6]/10' 
                        : 'text-[#6b7280] hover:text-[#d1d5db]'
                    }`}
                    title="Web search"
                  >
                    <Globe className="h-4 w-4" />
                  </button>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleSend}
                disabled={!canSend}
                className={`flex items-center justify-center h-8 w-8 rounded-full transition-all duration-150 ${
                  canSend 
                    ? 'bg-[#ffffff] text-[#0d0d0d]' 
                    : 'bg-[#1e1e1e] text-[#4b5563] cursor-not-allowed'
                }`}
              >
                <ArrowUp className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-[#4b5563]">
            Cortexa can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
  );
}
