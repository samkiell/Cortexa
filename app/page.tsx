'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  Bot, 
  ShieldCheck, 
  History, 
  Eye, 
  Zap, 
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090909] text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-[164px] pb-[120px] px-6">
          <div className="max-w-[620px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center rounded-full border border-white/[0.08] px-3 py-1 mb-8">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">
                  Powered by Featherless AI
                </span>
              </div>
              
              <h1 className="text-[48px] md:text-[52px] font-light leading-[1.15] tracking-[-0.02em] mb-6">
                Artificial Intelligence, <br />
                <span className="text-white">Unrestricted.</span>
              </h1>
              
              <p className="max-w-[420px] mx-auto text-[15px] font-light text-white/40 leading-relaxed mb-10">
                Experience thousands of open-source models without filters. Fast, private, and powerful chat interface for the next generation of builders.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/register" 
                  className="bg-[#2563eb] h-11 px-8 rounded-[8px] text-[15px] font-medium text-white flex items-center justify-center hover:bg-blue-600 transition-colors w-full sm:w-auto"
                >
                  Start Chatting 
                </Link>
                <Link 
                  href="/login" 
                  className="bg-transparent border border-white/[0.08] h-11 px-8 rounded-[8px] text-[15px] font-medium text-white flex items-center justify-center hover:bg-white/[0.03] transition-colors w-full sm:w-auto"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-white/[0.08]" />

        {/* Features Section */}
        <section id="features" className="py-[120px] px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-[32px] font-light mb-4">Everything you need</h2>
              <p className="text-[14px] text-white/40 font-light max-w-[420px] mx-auto">
                Cortexa brings the power of thousands of models to your fingertips with a premium experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/[0.08] border border-white/[0.08] rounded-[12px] overflow-hidden">
              {[
                {
                  icon: Bot,
                  title: "Thousands of Models",
                  description: "Select from the latest Llama, Mistral, and specialized open-source models."
                },
                {
                  icon: ShieldCheck,
                  title: "Uncensored AI",
                  description: "Full access to abliterated and uncensored models for unrestricted creativity."
                },
                {
                  icon: History,
                  title: "Chat History",
                  description: "Your conversations are persisted and organized for easy access anytime."
                },
                {
                  icon: Eye,
                  title: "Vision Support",
                  description: "Upload images and chat with multimodal models for visual understanding."
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-[#090909] p-8">
                  <div className="mb-6">
                    <feature.icon className="h-6 w-6 text-white/20 stroke-[1.5px]" />
                  </div>
                  <h3 className="text-[14px] font-medium mb-2">{feature.title}</h3>
                  <p className="text-[13px] font-light text-white/40 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-white/[0.08]" />

        {/* CTA Section */}
        <section className="py-[120px] px-6">
          <div className="max-w-[500px] mx-auto text-center">
            <h2 className="text-[36px] md:text-[40px] font-light leading-tight tracking-[-0.02em] mb-4">
              Ready to evolve your workflow?
            </h2>
            <p className="text-[15px] font-light text-white/40 mb-10">
              Join thousands of researchers and builders today.
            </p>
            <Link 
              href="/register" 
              className="bg-[#2563eb] h-12 px-10 rounded-[8px] text-[15px] font-medium text-white inline-flex items-center justify-center hover:bg-blue-600 transition-colors mx-auto"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
