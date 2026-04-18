'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Loader2, 
  Shield,
  Ban,
  Settings as SettingsIcon,
  Globe,
  Lock,
  MessageCircle,
  Wrench
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlatformSettings() {
  const [data, setData] = useState({
    siteName: 'Cortexa',
    allowRegistration: true,
    maxConversations: 50,
    maintenanceMode: false,
    featherlessApiKey: '',
  });
  
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    }));
  };

  if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  return (
    <form onSubmit={handleSave} className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Core Config Section */}
        <section className="bg-[#161616] border-[0.5px] border-[#2a2a2a] rounded-2xl p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-accent" />
            <h2 className="text-[16px] font-bold text-[#f9fafb]">Core Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] text-[#6b7280] font-semibold uppercase tracking-wider">Site Name</label>
              <input 
                type="text"
                name="siteName"
                value={data.siteName}
                onChange={handleChange}
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-[#f9fafb] focus:border-accent/50 outline-none transition-all"
                placeholder="Cortexa"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] text-[#6b7280] font-semibold uppercase tracking-wider">Featherless API Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  name="featherlessApiKey"
                  value={data.featherlessApiKey}
                  onChange={handleChange}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-[#f9fafb] focus:border-accent/50 outline-none transition-all"
                  placeholder="v1_sk-••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#6b7280] hover:text-[#f9fafb] transition-all"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#6b7280]">Key is masked for security. Overwrite to update.</p>
            </div>
          </div>
        </section>

        {/* Platform Policy Section */}
        <section className="bg-[#161616] border-[0.5px] border-[#2a2a2a] rounded-2xl p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-accent" />
            <h2 className="text-[16px] font-bold text-[#f9fafb]">Access Control</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-xl border border-[#2a2a2a]">
              <div>
                <p className="text-[14px] font-medium text-[#f9fafb]">Allow Registration</p>
                <p className="text-[12px] text-[#6b7280]">Allow new users to create accounts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="allowRegistration"
                  checked={data.allowRegistration}
                  onChange={handleChange} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f9fafb] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-xl border border-[#2a2a2a]">
              <div>
                <p className="text-[14px] font-medium text-[#f9fafb]">Maintenance Mode</p>
                <p className="text-[12px] text-[#6b7280]">Show maintenance page to non-admins.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="maintenanceMode"
                  checked={data.maintenanceMode}
                  onChange={handleChange} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f9fafb] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] text-[#6b7280] font-semibold uppercase tracking-wider">Max Conversations (Per User)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number"
                  name="maxConversations"
                  value={data.maxConversations}
                  onChange={handleChange}
                  className="w-24 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-[#f9fafb] focus:border-accent/50 outline-none transition-all"
                />
                <p className="text-[12px] text-[#6b7280]">Limit the total number of chats a user can have.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-3 rounded-xl bg-[#f9fafb] text-[#0d0d0d] px-8 py-4 text-sm font-bold hover:bg-[#e2e8f0] transition-all shadow-xl disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Update Platform Settings
        </button>
      </div>
    </form>
  );
}
