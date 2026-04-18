'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/[0.07] bg-[#090909]/85 backdrop-blur-[12px] h-[64px]">
      <div className="container mx-auto flex h-full items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Cortexa" className="h-8 w-8 object-contain" />
          <span className="text-[18px] font-medium tracking-tight">Cortexa</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-[13px] text-white/40 hover:text-white transition-colors">Features</Link>
          <Link href="/support" className="text-[13px] text-white/40 hover:text-white transition-colors">Support</Link>
          <Link href="https://github.com/samkiell" className="text-[13px] text-white/40 hover:text-white transition-colors">Source</Link>
        </nav>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-[13px] text-white/40 hover:text-white transition-colors">
            Log in
          </Link>
          <Link 
            href="/register" 
            className="bg-[#2563eb] h-9 px-4 rounded-[8px] text-[13px] font-medium text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
