'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mocking an email send
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast.success('Reset link sent to your email!');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] shadow-xl space-y-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#f9fafb]">Reset Password</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#3a3a3a]" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-[#111111] border border-[#1a1a1a] rounded-lg py-3 pl-10 pr-3 text-[#f9fafb] placeholder-[#3a3a3a] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all"
                placeholder="Email Address"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#f9fafb] text-[#0d0d0d] py-3 rounded-lg font-semibold hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="bg-[#111111] border border-[#3b82f6]/20 p-6 rounded-xl text-center space-y-4">
            <div className="h-12 w-12 bg-[#3b82f6]/10 text-[#3b82f6] rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-[#f9fafb]">Check your inbox</p>
              <p className="text-sm text-[#6b7280]">
                We've sent a password reset link to <br/> <span className="text-[#9ca3af]">{email}</span>
              </p>
            </div>
            <button 
              onClick={() => setIsSent(false)}
              className="text-xs text-[#3b82f6] hover:underline"
            >
              Back to retry
            </button>
          </div>
        )}

        <div className="text-center pt-2">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#9ca3af] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
