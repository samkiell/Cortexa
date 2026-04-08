'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Loader2, 
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsForm() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [visibleModels, setVisibleModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, allModelsRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/models') // This fetches all for admin if possible, but for now we'll fetch general
        ]);

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setApiKey(settings.featherlessApiKey || '');
          setVisibleModels(settings.visibleModels || []);
        }

        if (allModelsRes.ok) {
          const m = await allModelsRes.json();
          setModels(m);
        }
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featherlessApiKey: apiKey,
          visibleModels,
        }),
      });

      if (res.ok) {
        toast.success('Settings updated successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      toast.error('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModel = (id: string) => {
    setVisibleModels((prev) => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const filteredModels = models.filter(m => m.id.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-10">
      {/* API Key Section */}
      <section className="rounded-2xl border border-border-custom bg-surface p-8">
        <div className="flex items-center gap-3 mb-6">
          <Key className="h-6 w-6 text-accent" />
          <h2 className="font-syne text-xl font-bold text-white tracking-tight">Featherless API Configuration</h2>
        </div>
        
        <div className="space-y-4">
          <label className="text-sm font-medium text-muted">API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-xl border border-border-custom bg-base py-3 pl-4 pr-12 text-sm text-white outline-none focus:border-accent transition-all"
              placeholder="v1_sk-..."
            />
            <button 
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-white transition-all"
            >
              {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-muted">This key will be used for all user chat completions. Stored securely and encrypted at rest.</p>
        </div>
      </section>

      {/* Model Whitelist Section */}
      <section className="rounded-2xl border border-border-custom bg-surface p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Search className="h-6 w-6 text-accent" />
            <h2 className="font-syne text-xl font-bold text-white tracking-tight">Model Whitelist</h2>
          </div>
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search available models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border-custom bg-base py-2 px-4 text-xs text-white outline-none focus:border-accent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((m) => (
            <button
              key={m.id}
              onClick={() => toggleModel(m.id)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                visibleModels.includes(m.id) 
                  ? 'bg-accent/10 border-accent text-white' 
                  : 'bg-base border-border-custom text-muted hover:border-accent/40'
              }`}
            >
              <div className="text-left overflow-hidden">
                <p className="text-sm font-bold truncate">{m.name}</p>
                <p className="text-[10px] opacity-60 truncate">{m.id}</p>
              </div>
              {visibleModels.includes(m.id) ? (
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 opacity-20 shrink-0" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-xl bg-base/40 text-xs text-muted">
          Only items selected here will be visible to end users in the chat model selector.
        </div>
      </section>

      <div className="flex justify-end p-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-sm font-bold text-white hover:bg-accent-dim transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Save Platform Configuration
        </button>
      </div>
    </div>
  );
}
