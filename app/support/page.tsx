'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LifeBuoy, 
  Mail, 
  MessageSquare, 
  ArrowLeft,
  Loader2,
  FileText,
  BadgeCheck,
  Send
} from 'lucide-react';
import Link from 'next/link';
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
    <div className="min-h-screen bg-[#0d0d0d] font-inter text-[#f9fafb] selection:bg-accent/30 flex flex-col items-center justify-center p-6 bg-grid-white/[0.02] relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-accent/10 blur-[120px] rounded-full -z-10 opacity-50" />
      
      <div className="w-full max-w-[500px] space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-[13px] text-[#6b7280] hover:text-[#f9fafb] transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
          <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
            <LifeBuoy className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-syne text-3xl font-bold tracking-tight text-glow">How can we help?</h1>
          <p className="text-[#6b7280] text-[15px] max-w-[360px]">
            Have a bug to report or feedback to share? We'd love to hear from you.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111111] border border-[#1a1a1a] rounded-[24px] p-8 shadow-2xl relative overflow-hidden"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#6b7280] ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4b5563]" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl pl-11 pr-4 py-3 text-[14px] focus:border-accent/40 focus:ring-1 focus:ring-accent/10 outline-none transition-all placeholder:text-[#333333]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#6b7280] ml-1">Subject</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4b5563]" />
                  <input 
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="Subject of your report"
                    className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl pl-11 pr-4 py-3 text-[14px] focus:border-accent/40 focus:ring-1 focus:ring-accent/10 outline-none transition-all placeholder:text-[#333333]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#6b7280] ml-1">Your Message</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Tell us what's on your mind..."
                  className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-[14px] focus:border-accent/40 focus:ring-1 focus:ring-accent/10 outline-none transition-all placeholder:text-[#333333] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#f9fafb] text-[#0d0d0d] h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50 mt-2"
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-4"
            >
              <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-2">
                <BadgeCheck className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Message Received</h2>
              <p className="text-[#6b7280] text-sm">
                Thank you for your feedback! Our team will review your report and get back to you if necessary.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-accent text-sm font-medium hover:underline pt-4"
              >
                Send another message
              </button>
            </motion.div>
          )}

          {/* Decorative Corner Asset */}
          <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-accent/5 rounded-full blur-2xl" />
        </motion.div>

        <div className="flex justify-center gap-8 text-[12px] text-[#2a2a2a] font-medium pt-4 uppercase tracking-widest">
            <div className="flex items-center gap-2">
                <div className="h-1 w-1 bg-[#2a2a2a] rounded-full" />
                Fast Support
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1 w-1 bg-[#2a2a2a] rounded-full" />
                Community Driven
            </div>
        </div>
      </div>
    </div>
  );
}
