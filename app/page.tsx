'use client';

import Link from 'next/link';
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
    <div className="flex min-h-screen flex-col bg-base overflow-x-hidden">
      {/* Header / Nav */}
      <header className="fixed top-0 z-50 w-full border-b border-border-custom bg-base/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="font-syne text-xl font-bold tracking-tight text-white">Cortexa</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="https://github.com/samkiell" className="hover:text-white transition-colors flex items-center gap-1">
              <Bot className="h-4 w-4" />
              Source
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted hover:text-white transition-colors">
              Log in
            </Link>
            <Link 
              href="/register" 
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-dim transition-all shadow-lg shadow-accent/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          {/* Background Gradient Blurs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-accent/10 blur-[120px] rounded-full -z-10" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border-custom bg-surface px-4 py-1 text-sm font-medium text-accent mb-6">
                <Zap className="h-4 w-4" />
                <span>Powered by Featherless AI</span>
              </div>
              <h1 className="font-syne text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                Artificial Intelligence, <br />
                <span className="text-accent">Unrestricted.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted mb-10 leading-relaxed">
                Experience thousands of open-source models without filters. Fast, private, and powerful chat interface for the next generation of builders.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto rounded-full bg-accent px-8 py-4 text-lg font-bold text-white hover:bg-accent-dim transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 group"
                >
                  Start Chatting 
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/login" 
                  className="w-full sm:w-auto rounded-full border border-border-custom bg-surface px-8 py-4 text-lg font-bold text-white hover:bg-border-custom transition-all"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-surface/50 border-y border-border-custom">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-syne text-3xl md:text-4xl font-bold text-white mb-4">Everything you need</h2>
              <p className="text-muted max-w-2xl mx-auto">Cortexa brings the power of thousands of models to your fingertips with a premium experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group rounded-2xl border border-border-custom bg-base p-8 hover:border-accent/50 transition-all hover:shadow-2xl hover:shadow-accent/5"
                >
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-syne text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/5 blur-[100px] rounded-full -z-10" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-syne text-4xl md:text-5xl font-bold text-white mb-8">Ready to evolve your workflow?</h2>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 rounded-full bg-accent px-10 py-5 text-xl font-bold text-white hover:bg-accent-dim transition-all shadow-2xl shadow-accent/20 group"
            >
              Get Started for Free
              <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-custom py-12 bg-base">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-accent" />
            <span className="font-syne text-lg font-bold text-white tracking-tight">Cortexa</span>
          </div>
          <p className="text-sm text-muted">© 2024 Cortexa Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm font-medium text-muted">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="https://github.com/samkiell" className="hover:text-white transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
