'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, MapPinOff, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4 text-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="relative inline-block">
          <div className="h-24 w-24 rounded-3xl bg-surface border border-border-custom flex items-center justify-center mx-auto shadow-2xl">
            <Bot className="h-12 w-12 text-accent" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="font-syne text-6xl md:text-8xl font-bold text-white tracking-tighter">404</h1>
          <div className="flex items-center justify-center gap-2 text-accent font-syne text-xl font-bold uppercase tracking-widest">
            <MapPinOff className="h-5 w-5" />
            <span>Path Lost</span>
          </div>
          <p className="text-muted max-w-md mx-auto text-lg">
            The neural path you're looking for doesn't exist or has been relocated to another sector.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-lg font-bold text-white hover:bg-accent-dim transition-all shadow-xl shadow-accent/20 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Base
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="rounded-full border border-border-custom bg-surface px-8 py-4 text-lg font-bold text-white hover:bg-border-custom transition-all"
          >
            Previous Sector
          </button>
        </div>
      </motion.div>
    </div>
  );
}
