'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090909] text-white selection:bg-blue-500/30">
      <Navbar />
      
      <main className="flex-1 px-6 pt-[120px] pb-[80px]">
        <div className="max-w-[620px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[32px] font-light tracking-tight mb-8">Privacy Policy</h1>
            
            <div className="space-y-8 text-[14px] font-light text-white/40 leading-relaxed">
              <section className="space-y-3">
                <h2 className="text-[14px] font-medium text-white uppercase tracking-wider">Introduction</h2>
                <p>
                  At Cortexa, we take your privacy seriously. This policy outlines how we collect, use, and protect your data when you use our platform.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-medium text-white uppercase tracking-wider">Data Collection</h2>
                <p>
                  We collect minimal data necessary to provide our services. This includes your email address for account management and any chat history you choose to save on our platform.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-medium text-white uppercase tracking-wider">How We Use Data</h2>
                <p>
                  Your data is used solely to provide and improve the Cortexa experience. We do not sell your personal information to third parties. Conversations are processed by our AI partners (like Featherless AI) to generate responses.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-medium text-white uppercase tracking-wider">Security</h2>
                <p>
                  We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-medium text-white uppercase tracking-wider">Updates</h2>
                <p>
                  We may update this policy from time to time. We will notify you of any significant changes by posting the new policy on this page.
                </p>
              </section>

              <p className="pt-4 border-t border-white/[0.08]">
                Last updated: April 2026
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
