'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function TermsPage() {
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
            <h1 className="text-[32px] font-light tracking-tight mb-8">Terms of Service</h1>
            
            <div className="space-y-8 text-[14px] font-light text-white/40 leading-relaxed">
              <section className="space-y-3">
                <h2 className="text-[14px] font-medium text-white uppercase tracking-wider">Agreement</h2>
                <p>
                  By accessing or using Cortexa, you agree to be bound by these terms. If you do not agree with any part of these terms, you may not use our services.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-medium text-white uppercase tracking-wider">Use of Service</h2>
                <p>
                  You agree to use Cortexa only for lawful purposes. You are responsible for all content you generate and share using our platform.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-medium text-white uppercase tracking-wider">Account Responsibility</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-medium text-white uppercase tracking-wider">Limitations</h2>
                <p>
                  Cortexa is provided "as is" without any warranties. We are not liable for any damages arising from your use of the service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-medium text-white uppercase tracking-wider">Termination</h2>
                <p>
                  We reserve the right to terminate or suspend your account at our discretion, without notice, for conduct that we believe violates these terms.
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
