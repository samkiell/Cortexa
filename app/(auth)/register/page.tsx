'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
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

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/chat' });
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
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-border-custom bg-base py-3 px-4 text-sm font-medium text-text-custom hover:bg-[#1f1f1f] transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border-custom"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface px-2 text-muted">Or continue with email</span>
                  </div>
                </div>

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
