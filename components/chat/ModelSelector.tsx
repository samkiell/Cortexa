'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  Sparkles, 
  Eye, 
  ShieldAlert, 
  Cpu, 
  Check,
  BrainCircuit
} from 'lucide-react';

interface Model {
  id: string;
  name: string;
  isVision: boolean;
  isUncensored: boolean;
  isReasoning: boolean;
}

interface ModelSelectorProps {
  currentModel: string;
  onSelect: (modelId: string) => void;
}

export default function ModelSelector({ currentModel, onSelect }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('/api/models');
        if (res.ok) {
          const data = await res.json();
          setModels(data);
        }
      } catch (err) {
        console.error('Failed to fetch models', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredModels = models.filter((m) =>
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  const selectedModel = models.find((m) => m.id === currentModel) || {
    id: currentModel,
    name: currentModel.split('/').pop() || currentModel,
    isVision: false,
    isUncensored: false,
    isReasoning: false,
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-border-custom bg-surface px-4 py-2 text-sm font-medium text-white hover:bg-border-custom transition-all"
      >
        <span className="max-w-[150px] truncate">{selectedModel.name}</span>
        <ChevronDown className={`h-4 w-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-border-custom bg-surface shadow-2xl z-50 px-2 py-2"
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
                      <span className={`text-sm font-semibold truncate ${currentModel === model.id ? 'text-accent' : 'text-text-custom group-hover:text-white'}`}>
                        {model.name}
                      </span>
                      {currentModel === model.id && <Check className="h-4 w-4 text-accent" />}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-1">
                      {model.isVision && (
                        <span className="inline-flex items-center gap-1 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] uppercase font-bold text-accent">
                          <Eye className="h-2.5 w-2.5" />
                          Vision
                        </span>
                      )}
                      {model.isUncensored && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] uppercase font-bold text-red-500">
                          <ShieldAlert className="h-2.5 w-2.5" />
                          Uncensored
                        </span>
                      )}
                      {model.isReasoning && (
                        <span className="inline-flex items-center gap-1 rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] uppercase font-bold text-green-500">
                          <BrainCircuit className="h-2.5 w-2.5" />
                          Reasoning
                        </span>
                      )}
                      {!model.isVision && !model.isUncensored && !model.isReasoning && (
                        <span className="text-[10px] text-muted">Text completion</span>
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
