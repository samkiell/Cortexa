'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Check,
} from 'lucide-react';
import { useModels } from '@/contexts/ModelContext';

interface ModelSelectorProps {
  currentModel: string;
  onSelect: (modelId: string) => void;
}

export default function ModelSelector({ currentModel, onSelect }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { models } = useModels();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedModel = models.find((m) => m.id === currentModel) || models[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-medium text-[#e5e7eb] hover:bg-[#1a1a1a] transition-colors rounded-md"
      >
        <span>{selectedModel?.name || 'Loading...'}</span>
        <ChevronDown className={`h-[14px] w-[14px] text-[#6b7280] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.12 }}
            style={{ originY: 0 }}
            className="absolute left-0 mt-2 w-64 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] shadow-xl z-50 p-1"
          >
            <div className="space-y-0.5">
              {models.slice(0, 5).map((model) => {
                const isActive = currentModel === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelect(model.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-left transition-all hover:bg-[#2a2a2a] ${
                      isActive ? 'text-[#f9fafb]' : 'text-[#9ca3af]'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium truncate">{model.name}</span>
                        <div className="flex gap-1">
                          {model.vision && (
                            <span className="px-1 py-0.5 rounded-[4px] bg-[#3b82f6]/10 text-[#3b82f6] text-[9px] font-bold uppercase tracking-tighter">Vision</span>
                          )}
                          {model.tags.includes('uncensored') && (
                            <span className="px-1 py-0.5 rounded-[4px] bg-[#3b82f6]/10 text-[#3b82f6] text-[9px] font-bold uppercase tracking-tighter">Ghost</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-[#3b82f6]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
