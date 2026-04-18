'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings as SettingsIcon, 
  Monitor, 
  Shield, 
  Trash2, 
  ArrowLeft,
  ChevronRight,
  Camera,
  Loader2,
  LifeBuoy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  
  // Support State
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'general', name: 'General', icon: Monitor },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'support', name: 'Support', icon: LifeBuoy },
  ];

  // Sync state when session loads
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setAvatar(session.user.image || '');
    }
  }, [session]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Avatar too large. Max 2MB.");
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Use JPEG, PNG or WebP.");
        return;
      }

      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAvatar = async () => {
    if (!newAvatarFile) return;
    setIsAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', newAvatarFile);

      const res = await fetch('/api/user/avatar', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Avatar updated');
        setAvatar(data.avatarUrl);
        setNewAvatarFile(null);
        await update({ image: data.avatarUrl });
      } else {
        toast.error(data.error || 'Failed to update avatar');
      }
    } catch (err) {
      toast.error('Error uploading avatar');
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          image: avatar, 
          currentPassword, 
          newPassword 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Settings updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        await update();
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to delete ALL chats? This cannot be undone.')) {
      try {
        const res = await fetch('/api/conversations/clear', { method: 'DELETE' });
        if (res.ok) {
          toast.success('All history cleared');
          router.push('/chat');
        } else {
          toast.error('Failed to clear history');
        }
      } catch (err) {
        toast.error('Error clearing history');
      }
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmittingSupport(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: supportSubject, message: supportMessage }),
      });
      
      if (res.ok) {
        toast.success('Report submitted successfully. We will look into it.');
        setSupportSubject('');
        setSupportMessage('');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit report');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] font-inter overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-6 border-b border-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#6b7280] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-[15px] font-medium text-[#f9fafb]">Settings</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Tabs Sidebar */}
            <aside className="w-full md:w-48 shrink-0">
              <nav className="flex md:flex-col gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-[#1f1f1f] text-[#f9fafb]' 
                        : 'text-[#6b7280] hover:bg-[#1a1a1a] hover:text-[#9ca3af]'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 min-w-0 pb-20">
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <form onSubmit={handleUpdate} className="space-y-8">
                    <section>
                      <h2 className="text-[15px] font-medium text-[#f9fafb] mb-4">Profile</h2>
                      <div className="p-6 rounded-2xl bg-[#111111] border border-[#1a1a1a] space-y-6">
                        <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center shrink-0 overflow-hidden text-2xl font-medium text-white border-2 border-transparent group-hover:border-accent/50 transition-all">
                              {isAvatarLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                              ) : avatar ? (
                                <img src={avatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span>{name?.[0]?.toUpperCase() || 'U'}</span>
                              )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="h-5 w-5 text-white" />
                            </div>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleAvatarChange} 
                              className="hidden" 
                              accept="image/jpeg,image/png,image/webp" 
                            />
                          </div>
                          {newAvatarFile && !isAvatarLoading && (
                            <button
                              type="button"
                              onClick={saveAvatar}
                              className="px-3 py-1 bg-accent text-white rounded-full text-[11px] font-semibold hover:bg-accent-dim transition-all"
                            >
                              Save
                            </button>
                          )}
                        </div>
                          <div className="flex-1 space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[12px] text-[#6b7280]">Name</label>
                              <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-3 py-2 text-[13px] text-[#f9fafb] focus:border-[#3b82f6]/40 focus:ring-1 focus:ring-[#3b82f6]/10 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[12px] text-[#6b7280]">Email</label>
                              <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-3 py-2 text-[13px] text-[#f9fafb] focus:border-[#3b82f6]/40 focus:ring-1 focus:ring-[#3b82f6]/10 outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="space-y-1 mb-4">
                        <h2 className="text-[15px] font-medium text-[#f9fafb]">Security</h2>
                        <p className="text-[12px] text-[#6b7280]">Change your password to keep your account secure.</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-[#111111] border border-[#1a1a1a] space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[12px] text-[#6b7280]">Current Password</label>
                          <input 
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-3 py-2 text-[13px] text-[#f9fafb] focus:border-[#3b82f6]/40 focus:ring-1 focus:ring-[#3b82f6]/10 outline-none transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[12px] text-[#6b7280]">New Password</label>
                          <input 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-3 py-2 text-[13px] text-[#f9fafb] focus:border-[#3b82f6]/40 focus:ring-1 focus:ring-[#3b82f6]/10 outline-none transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </section>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-[#f9fafb] text-[#0d0d0d] px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#e2e8f0] transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'general' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <section>
                    <div className="space-y-1 mb-4">
                      <h2 className="text-[15px] font-medium text-[#f9fafb]">Interface</h2>
                      <p className="text-[12px] text-[#6b7280]">Customize how Cortexa looks and feels.</p>
                    </div>
                    <div className="rounded-2xl bg-[#111111] border border-[#1a1a1a] overflow-hidden divide-y divide-[#1a1a1a]">
                      <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-medium text-[#d1d5db]">Theme</p>
                          <p className="text-[12px] text-[#6b7280]">Dark (System Default)</p>
                        </div>
                        <div className="px-2 py-1 rounded bg-[#1a1a1a] text-[11px] text-[#6b7280] border border-[#2a2a2a]">
                          Changes locked
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <section>
                    <div className="space-y-1 mb-4">
                      <h2 className="text-[15px] font-medium text-[#f9fafb]">Danger Zone</h2>
                      <p className="text-[12px] text-[#6b7280]">Irreversible actions related to your account and data.</p>
                    </div>
                    <div className="rounded-2xl bg-[#111111] border border-red-900/20 overflow-hidden divide-y divide-red-900/10">
                      <button 
                        onClick={handleClearHistory}
                        className="w-full text-left p-4 flex items-center justify-between group cursor-pointer hover:bg-red-500/5 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-medium text-red-500">Delete all chats</p>
                          <p className="text-[12px] text-red-900/60">This will permanently delete your entire conversation history.</p>
                        </div>
                        <Trash2 className="h-4 w-4 text-red-900/40 group-hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'support' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <section>
                    <div className="space-y-1 mb-4">
                      <h2 className="text-[15px] font-medium text-[#f9fafb]">Contact & Support</h2>
                      <p className="text-[12px] text-[#6b7280]">Found a bug or have a feature request? Let us know.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#111111] border border-[#1a1a1a]">
                      <form onSubmit={handleSupportSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[12px] text-[#6b7280]">Subject</label>
                          <input 
                            type="text"
                            value={supportSubject}
                            onChange={(e) => setSupportSubject(e.target.value)}
                            className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-3 py-2 text-[13px] text-[#f9fafb] focus:border-[#3b82f6]/40 focus:ring-1 focus:ring-[#3b82f6]/10 outline-none transition-all"
                            placeholder="What's going on?"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[12px] text-[#6b7280]">Message</label>
                          <textarea 
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                            rows={4}
                            className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-3 py-2 text-[13px] text-[#f9fafb] focus:border-[#3b82f6]/40 focus:ring-1 focus:ring-[#3b82f6]/10 outline-none transition-all resize-none"
                            placeholder="Describe your issue or feedback in detail..."
                          />
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={isSubmittingSupport}
                            className="bg-[#f9fafb] text-[#0d0d0d] px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#e2e8f0] transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {isSubmittingSupport && <Loader2 className="h-4 w-4 animate-spin" />}
                            Submit Report
                          </button>
                        </div>
                      </form>
                    </div>
                  </section>
                  
                  <section>
                    <div className="p-6 rounded-2xl bg-[#111111]/50 border border-[#1a1a1a] border-dashed text-center">
                      <p className="text-[12px] text-[#6b7280]">Our team typically responds within 24-48 hours.</p>
                    </div>
                  </section>
                </motion.div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
