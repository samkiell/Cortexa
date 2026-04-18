'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] h-[80px] px-6 bg-[#090909]">
      <div className="container mx-auto h-full flex items-center justify-between">
        <div className="text-[12px] font-mono text-white/40 uppercase">
          © 2026 CORTEXA PLATFORM.
        </div>
        
        <div className="flex items-center gap-8">
          <Link href="/privacy" className="text-[12px] text-white/40 hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="text-[12px] text-white/40 hover:text-white transition-colors">Terms</Link>
          <Link href="/support" className="text-[12px] text-white/40 hover:text-white transition-colors">Support</Link>
          <Link href="https://github.com/samkiell" className="text-[12px] text-white/40 hover:text-white transition-colors">GitHub</Link>
        </div>
      </div>
    </footer>
  );
}
