import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0d0d0d] p-4 text-center">
      <div className="space-y-6">
        <div className="flex justify-center">
          <Wrench className="h-16 w-16 text-blue-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="font-syne text-4xl font-bold text-[#f9fafb]">We'll be right back</h1>
          <p className="text-[#6b7280] text-[16px]">Cortexa is undergoing maintenance. Check back soon.</p>
        </div>
      </div>
    </div>
  );
}
