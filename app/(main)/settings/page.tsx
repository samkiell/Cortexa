'use client';

import { useState } from 'react';
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
  UserCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'general', name: 'General', icon: Monitor },
    { id: 'privacy', name: 'Privacy', icon: Shield },
  ];

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
          {/* Main Layout: Fixed Sidebar + Content */}
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
                  <section>
                    <h2 className="text-[15px] font-medium text-[#f9fafb] mb-4">Profile</h2>
                    <div className="p-6 rounded-2xl bg-[#111111] border border-[#1a1a1a] space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-[#1d4ed8] flex items-center justify-center shrink-0 overflow-hidden text-2xl font-medium text-white shadow-xl shadow-blue-900/10">
                          {session?.user?.image ? (
                            <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span>{session?.user?.name?.[0]?.toUpperCase() || 'U'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[15px] font-medium text-[#f9fafb]">{session?.user?.name || 'User'}</p>
                          <p className="text-[13px] text-[#6b7280]">{session?.user?.email}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="space-y-1 mb-4">
                      <h2 className="text-[15px] font-medium text-[#f9fafb]">Personal Information</h2>
                      <p className="text-[12px] text-[#6b7280]">Manage your account details and how they appear.</p>
                    </div>
                    <div className="rounded-2xl bg-[#111111] border border-[#1a1a1a] overflow-hidden divide-y divide-[#1a1a1a]">
                      <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-[#161616] transition-colors">
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-medium text-[#d1d5db]">Display Name</p>
                          <p className="text-[12px] text-[#6b7280]">{session?.user?.name || 'Set display name'}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#3a3a3a] group-hover:text-[#6b7280] transition-colors" />
                      </div>
                      <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-[#161616] transition-colors">
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-medium text-[#d1d5db]">Email Address</p>
                          <p className="text-[12px] text-[#6b7280]">{session?.user?.email}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#3a3a3a] group-hover:text-[#6b7280] transition-colors" />
                      </div>
                    </div>
                  </section>
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
                      <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-medium text-[#d1d5db]">Language</p>
                          <p className="text-[12px] text-[#6b7280]">English (United States)</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#3a3a3a]" />
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
                      <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-red-500/5 transition-colors">
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-medium text-red-500">Delete all chats</p>
                          <p className="text-[12px] text-red-900/60">This will permanently delete your entire conversation history.</p>
                        </div>
                        <Trash2 className="h-4 w-4 text-red-900/40 group-hover:text-red-500 transition-colors" />
                      </div>
                      <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-red-500/5 transition-colors">
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-medium text-[#6b7280]">Deactivate Account</p>
                          <p className="text-[12px] text-[#3a3a3a]">Temporarily disable your Cortexa account.</p>
                        </div>
                      </div>
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
