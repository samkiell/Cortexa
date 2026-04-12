'use client';

import { useState, useEffect } from 'react';
import { CURATED_MODELS } from '@/lib/featherless';
import { Loader2, Sliders, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ModelVisibilityPage() {
  const [visibleModels, setVisibleModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setVisibleModels(data.visibleModels || []);
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModel = async (modelId: string) => {
    let nextVisible = [...visibleModels];
    if (nextVisible.includes(modelId)) {
      // Trying to disable. Check if it's the last one.
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
        toast.success('Model visibility updated');
      } else {
        toast.error('Failed to update visibility');
      }
    } catch (err) {
      toast.error('Error updating visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-accent/10">
          <Sliders className="h-8 w-8 text-accent" />
        </div>
        <div>
          <h1 className="font-syne text-3xl font-bold text-[#f9fafb] tracking-tight">Model Visibility</h1>
          <p className="text-[#6b7280] text-sm">Control which models appear in the user-facing model selector.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CURATED_MODELS.map((model) => {
          const isVisible = visibleModels.includes(model.id);
          return (
            <div 
              key={model.id}
              className={`bg-[#161616] border-[0.5px] rounded-2xl p-6 flex flex-col justify-between transition-all ${
                isVisible ? 'border-accent shadow-lg shadow-accent/5' : 'border-[#2a2a2a] opacity-75'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] text-[10px] font-bold text-[#6b7280]">
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
                    <div className="w-10 h-5 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f9fafb] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
                
                <h3 className="text-[16px] font-bold text-[#f9fafb] mb-1">{model.name}</h3>
                <p className="text-[12px] text-[#6b7280] mb-4 truncate">{model.id}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {model.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-[#0d0d0d] border border-[#2a2a2a] text-[10px] uppercase font-semibold text-[#9ca3af]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="text-[12px] text-[#d1d5db] italic">"{model.description}"</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
