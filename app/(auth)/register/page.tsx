'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        toast.success('Account created successfully! Please sign in.');
        router.push('/login');
      } else {
        const errorText = await response.text();
        toast.error(errorText || 'Error creating account');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
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
            Create account
          </motion.h1>
          <p className="mt-2 text-sm text-muted">Join Cortexa today. Start chatting with top AI models.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                className="block w-full rounded-lg border border-border-custom bg-base py-3 pl-10 pr-3 text-text-custom placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm transitions-all"
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
                className="block w-full rounded-lg border border-border-custom bg-base py-3 pl-10 pr-3 text-text-custom placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm transitions-all"
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
                className="block w-full rounded-lg border border-border-custom bg-base py-3 pl-10 pr-3 text-text-custom placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm transitions-all"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-accent py-3 px-4 text-sm font-semibold text-white hover:bg-accent-dim focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                )}
              </span>
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-accent hover:text-accent-dim transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
