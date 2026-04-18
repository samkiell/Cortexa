'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MessageSquare, 
  Loader2,
  BadgeCheck,
  Send
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

export default function PublicSupportPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success('Your message has been sent!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Failed to submit. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#090909] text-white selection:bg-blue-500/30">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 pt-[120px] pb-[60px]">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-10">
            <h1 className="text-[32px] font-light tracking-tight mb-3">How can we help?</h1>
            <p className="text-[14px] font-light text-white/40 max-w-[320px] mx-auto">
              Have a bug to report or feedback to share? We'd love to hear from you.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] border border-white/[0.08] bg-[#090909] p-8"
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-white/40 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="w-full bg-transparent border border-white/[0.08] rounded-[8px] pl-11 pr-4 py-2.5 text-[14px] focus:border-blue-500 focus:outline-none transition-colors placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-white/40 ml-1">Subject</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input 
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      placeholder="What is this about?"
                      className="w-full bg-transparent border border-white/[0.08] rounded-[8px] pl-11 pr-4 py-2.5 text-[14px] focus:border-blue-500 focus:outline-none transition-colors placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-white/40 ml-1">Your Message</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Tell us what's on your mind..."
                    className="w-full bg-transparent border border-white/[0.08] rounded-[8px] px-4 py-2.5 text-[14px] focus:border-blue-500 focus:outline-none transition-colors placeholder:text-white/10 resize-none font-light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white h-11 rounded-[8px] font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            ) : (
              <motion.div 
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-12 flex flex-col items-center text-center space-y-4"
              >
                <div className="h-14 w-14 bg-white/[0.03] rounded-full flex items-center justify-center border border-white/[0.08] mb-2">
                  <BadgeCheck className="h-7 w-7 text-blue-500" />
                </div>
                <h2 className="text-[20px] font-light">Message Received</h2>
                <p className="text-white/40 text-[14px] font-light max-w-[280px]">
                  Thank you for your feedback! Our team will review your report shortly.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-blue-500 text-[13px] font-medium hover:text-blue-400 transition-colors pt-4"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
