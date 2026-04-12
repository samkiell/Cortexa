'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Loader2, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationAllowed, setRegistrationAllowed] = useState<boolean | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1: Info, 2: OTP
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/admin/settings/status');
        const data = await res.json();
        setRegistrationAllowed(data.allowRegistration);
      } catch (e) {
        setRegistrationAllowed(true);
      }
    };
    checkStatus();
  }, []);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        toast.success('Verification code sent to your email!');
        setStep(2);
      } else {
        const errorText = await response.text();
        toast.error(errorText || 'Error sending code');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, code }),
      });

      if (response.ok) {
        toast.success('Account created successfully! Please sign in.');
        router.push('/login');
      } else {
        const errorText = await response.text();
        toast.error(errorText || 'Invalid verification code');
      }
    } catch (error) {
      toast.error('An unexpected error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-border-custom bg-surface p-8 shadow-xl"
      >
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-syne text-3xl font-bold tracking-tight text-accent"
          >
            {step === 1 ? 'Create account' : 'Verify email'}
          </motion.h1>
          <p className="mt-2 text-sm text-muted">
            {step === 1 
              ? 'Join Cortexa today. Start chatting with top AI models.' 
              : `We've sent a code to ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {registrationAllowed === false ? (
            <motion.div 
              key="closed"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div className="flex justify-center">
                <ShieldAlert className="h-12 w-12 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Registration is currently closed</h2>
                <p className="text-sm text-muted">Please check back later or contact an administrator.</p>
              </div>
              <div className="pt-4">
                <Link href="/login" className="text-sm text-accent hover:underline flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign in
                </Link>
              </div>
            </motion.div>
          ) : step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleInitialSubmit} 
              className="mt-8 space-y-6"
            >
              <div className="space-y-4">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border border-border-custom bg-base py-3 pl-10 pr-3 text-white placeholder-muted focus:border-accent focus:outline-none transitions-all"
                    placeholder="Full Name"
                  />
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-border-custom bg-base py-3 pl-10 pr-3 text-white placeholder-muted focus:border-accent focus:outline-none transitions-all"
                    placeholder="Email Address"
                  />
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-border-custom bg-base py-3 pl-10 pr-3 text-white placeholder-muted focus:border-accent focus:outline-none transitions-all"
                    placeholder="Password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-accent py-3 px-4 text-sm font-semibold text-white hover:bg-accent-dim disabled:opacity-50 transition-all"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Get Verification Code'}
              </button>

              <div className="text-center mt-6">
                <p className="text-sm text-muted">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-accent hover:text-accent-dim transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOTP} 
              className="mt-8 space-y-6"
            >
              <div className="space-y-4">
                <label className="text-center block text-sm text-[#6b7280]">Enter the 6-digit code sent to your email</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full rounded-lg border border-border-custom bg-base py-4 text-center text-3xl font-bold tracking-[8px] text-accent placeholder-muted focus:border-accent focus:outline-none transitions-all"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-accent py-3 px-4 text-sm font-semibold text-white hover:bg-accent-dim disabled:opacity-50 transition-all font-syne"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Complete Registration'}
              </button>

              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-muted hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change email address
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
