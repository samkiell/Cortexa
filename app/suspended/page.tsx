import { ShieldOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SuspendedPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0d0d0d] p-4 text-center">
      <div className="space-y-8 max-w-sm">
        <div className="flex justify-center">
          <ShieldOff className="h-16 w-16 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="font-syne text-4xl font-bold text-[#f9fafb]">Account suspended</h1>
          <p className="text-[#6b7280] text-[16px]">Your account has been suspended. Contact support if you think this is a mistake.</p>
        </div>
        <div className="pt-4 space-y-4">
          <a 
            href="mailto:support@cortexa.app" 
            className="inline-block bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-6 py-3 text-[#f9fafb] font-medium hover:bg-[#252525] transition-all"
          >
            Contact Support
          </a>
          <br/>
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-[#6b7280] hover:text-[#f9fafb] transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
