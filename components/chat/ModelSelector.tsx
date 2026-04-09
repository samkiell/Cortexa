'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  Eye, 
  ShieldAlert, 
  Cpu, 
  Check,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { useModels } from '@/contexts/ModelContext';

interface ModelSelectorProps {
  currentModel: string;
  onSelect: (modelId: string) => void;
}

export default function ModelSelector({ currentModel, onSelect }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { models, isLoading } = useModels();
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

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  const selectedModel = models.find((m) => m.id === currentModel) || models[4] || {
    id: currentModel,
    name: 'Select Model',
    vision: false,
    tags: [],
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-border-custom bg-surface px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-border-custom transition-all"
      >
        <span className="max-w-[80px] sm:max-w-[150px] truncate">{selectedModel.name}</span>
        <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 overflow-hidden rounded-2xl border border-border-custom bg-surface shadow-2xl z-50 px-2 py-2"
          >
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                autoFocus
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border-custom bg-base py-2 pl-10 pr-4 text-sm text-text-custom outline-none transition-all focus:border-accent"
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1 scrollbar-thin">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted">
                  <Cpu className="h-6 w-6 animate-pulse" />
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted">No models found</div>
              ) : (
                filteredModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelect(model.id);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col w-full rounded-xl px-3 py-2 text-left transition-all hover:bg-base group ${
                      currentModel === model.id ? 'bg-base' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-semibold truncate ${currentModel === model.id ? 'text-accent' : 'text-text-custom group-hover:text-white'}`}>
                          {model.name}
                        </span>
                        <span className="text-[10px] text-muted truncate">{model.description}</span>
                      </div>
                      {currentModel === model.id && <Check className="h-4 w-4 text-accent flex-shrink-0" />}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[9px] uppercase font-bold text-muted-foreground">
                        {model.size}
                      </span>
                      {model.vision && (
                        <span className="inline-flex items-center gap-1 rounded bg-accent/10 px-1.5 py-0.5 text-[9px] uppercase font-bold text-accent">
                          <Eye className="h-2 w-2" />
                          Vision
                        </span>
                      )}
                      {model.tags.includes('uncensored') && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] uppercase font-bold text-red-500">
                          <ShieldAlert className="h-2 w-2" />
                          Uncensored
                        </span>
                      )}
                      {model.tags.includes('abliterated') && (
                        <span className="inline-flex items-center gap-1 rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] uppercase font-bold text-green-500">
                          <BrainCircuit className="h-2 w-2" />
                          Abliterated
                        </span>
                      )}
                      {model.id.includes('8B') && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] uppercase font-bold text-amber-500">
                          <Zap className="h-2 w-2" />
                          Fast
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
