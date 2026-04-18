'use client';

import { useState, useEffect } from 'react';
import { CURATED_MODELS } from '@/lib/featherless';
import { 
  Loader2, 
  Sliders, 
  Search, 
  Plus, 
  Globe, 
  Zap, 
  ChevronDown, 
  Cpu, 
  ShieldCheck, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModelVisibilityPage() {
  const [visibleModels, setVisibleModels] = useState<string[]>([]);
  const [allModels, setAllModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingLibrary, setIsFetchingLibrary] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch visible models from settings
      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setVisibleModels(settings.visibleModels || []);
      }

      // Fetch all models from library
      setIsFetchingLibrary(true);
      const libraryRes = await fetch('/api/admin/models/fetch');
      if (libraryRes.ok) {
        const libraryData = await libraryRes.json();
        // Featherless returns { data: [...] }
        setAllModels(libraryData.data || []);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
      setIsFetchingLibrary(false);
    }
  };

  const toggleModel = async (modelId: string) => {
    let nextVisible = [...visibleModels];
    const isCurrentlyVisible = nextVisible.includes(modelId);

    if (isCurrentlyVisible) {
      if (nextVisible.length <= 1) {
        toast.error('Minimum 1 model must always be enabled');
        return;
      }
      nextVisible = nextVisible.filter(id => id !== modelId);
    } else {
      nextVisible.push(modelId);
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibleModels: nextVisible }),
      });
      if (res.ok) {
        setVisibleModels(nextVisible);
        toast.success(isCurrentlyVisible ? 'Model hidden' : 'Model enabled');
      } else {
        toast.error('Failed to update visibility');
      }
    } catch (err) {
      toast.error('Error updating visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredLibrary = allModels
    .filter(m => 
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !CURATED_MODELS.some(cm => cm.id === m.id)
    )
    .slice(0, searchQuery ? 500 : 100);

  const dynamicModels = visibleModels.filter(id => !CURATED_MODELS.some(cm => cm.id === id));

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-accent" />
      <p className="text-[#6b7280] text-sm font-medium">Initializing model management...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
          <Sliders className="h-8 w-8 text-accent text-glow" />
        </div>
        <div>
          <h1 className="font-syne text-3xl font-bold text-[#f9fafb] tracking-tight">Model Visibility</h1>
          <p className="text-[#6b7280] text-sm">Deploy and manage which AI models are accessible to your users.</p>
        </div>
      </div>

      {/* Primary Curated Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-accent" />
          <h2 className="text-[18px] font-bold text-[#f9fafb]">Featured Models</h2>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 ml-2">STATIC LIST</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURATED_MODELS.map((model) => {
            const isVisible = visibleModels.includes(model.id);
            return (
              <motion.div 
                key={model.id}
                layout
                className={`group relative bg-[#131313] border-[0.5px] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 overflow-hidden ${
                  isVisible ? 'border-accent shadow-lg shadow-accent/10' : 'border-[#2a2a2a] opacity-60 grayscale'
                }`}
              >
                {/* Background Decor */}
                <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full blur-3xl transition-opacity duration-500 ${isVisible ? 'bg-accent/10 opacity-100' : 'bg-transparent opacity-0'}`} />
                
                <div>
                  <div className="flex justify-between items-start mb-4 relative">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] text-[10px] font-bold text-[#888888]">
                        {model.size}
                      </span>
                      {model.vision && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-500">
                          VISION
                        </span>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isVisible}
                        onChange={() => toggleModel(model.id)}
                        disabled={isUpdating}
                      />
                      <div className="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f9fafb] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent ring-1 ring-[#333]"></div>
                    </label>
                  </div>
                  
                  <h3 className="text-[17px] font-bold text-[#f9fafb] mb-1 group-hover:text-glow transition-all">{model.name}</h3>
                  <p className="text-[11px] text-[#6b7280] mb-4 truncate font-mono">{model.id}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {model.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-[#0d0d0d] border border-[#232323] text-[10px] uppercase font-bold text-[#6b7280]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-[12px] text-[#9ca3af] italic leading-relaxed border-l-2 border-accent/20 pl-3">"{model.description}"</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Dynamic Models Section (Show when non-curated models are enabled) */}
      {dynamicModels.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-2 text-glow-blue">
            <Zap className="h-4 w-4 text-blue-400" />
            <h2 className="text-[18px] font-bold text-[#f9fafb]">Custom Enabled Models</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 ml-2">DYNAMIC</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dynamicModels.map((modelId) => (
              <motion.div 
                key={modelId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#131313] border-blue-500/40 border-[1px] rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-blue-500/5"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
                      CUSTOM
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={true}
                        onChange={() => toggleModel(modelId)}
                        disabled={isUpdating}
                      />
                      <div className="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f9fafb] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 ring-1 ring-[#333]"></div>
                    </label>
                  </div>
                  <h3 className="text-[16px] font-bold text-[#f9fafb] mb-1 truncate">{modelId.split('/').pop()}</h3>
                  <p className="text-[11px] text-[#6b7280] mb-0 font-mono truncate">{modelId}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Model Library Section */}
      <section className="pt-10 space-y-8 border-t border-[#1a1a1a]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#f9fafb] flex items-center gap-2">
              <Plus className="h-5 w-5 text-accent" />
              Model Library
            </h2>
            <p className="text-[#6b7280] text-[13px]">Explore and enable thousands of models directly from Featherless.</p>
          </div>
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4b5563]" />
            <input 
              type="text" 
              placeholder="Search library by model ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-3 text-sm text-[#f9fafb] focus:border-accent/40 outline-none transition-all placeholder:text-[#333]"
            />
          </div>
        </div>

        {isFetchingLibrary ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d0d0d] rounded-3xl border border-dashed border-[#1a1a1a]">
            <Loader2 className="h-8 w-8 animate-spin text-[#333] mb-3" />
            <p className="text-[#6b7280] text-sm">Syncing with Featherless repository...</p>
          </div>
        ) : allModels.length === 0 && !isFetchingLibrary ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d0d0d] rounded-3xl border border-dashed border-red-500/20">
            <p className="text-red-500 text-sm font-medium mb-2">Failed to connect to Featherless</p>
            <p className="text-[#4b4b4b] text-[12px] max-w-[300px] text-center mb-6">Make sure your API key is correct in Platform Settings.</p>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-[#1a1a1a] text-[#f9fafb] rounded-xl text-xs font-bold hover:bg-[#222] transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-3xl overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#161616] z-10 border-b border-[#2a2a2a]">
                  <tr>
                    <th className="px-6 py-4 text-[12px] font-bold text-[#6b7280] uppercase tracking-widest">Provider / Model ID</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-[#6b7280] uppercase tracking-widest text-center w-32">Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818]">
                  {filteredLibrary.map((model) => {
                    const isVisible = visibleModels.includes(model.id);
                    return (
                      <tr key={model.id} className="group hover:bg-[#151515] transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-[#0d0d0d] border border-[#222] ${isVisible ? 'text-accent' : 'text-[#444]'}`}>
                              <Cpu className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-[#f9fafb] group-hover:text-accent transition-colors">{model.id}</p>
                                <p className="text-[11px] text-[#4b4b4b] uppercase tracking-wider mt-0.5">Updated {new Date(model.created * 1000).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button
                            disabled={isUpdating}
                            onClick={() => toggleModel(model.id)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                              isVisible 
                                ? 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20' 
                                : 'bg-transparent text-[#6b7280] border-[#2a2a2a] hover:border-accent/40 hover:text-accent'
                            }`}
                          >
                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {isVisible ? 'HIDE' : 'SHOW'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLibrary.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-20 text-center text-[#6b7280] bg-[#0d0d0d]/50">
                        No models match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
