import PlatformSettings from '@/components/admin/PlatformSettings';
import { Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-accent/10">
          <SettingsIcon className="h-8 w-8 text-accent" />
        </div>
        <div>
          <h1 className="font-syne text-3xl font-bold text-[#f9fafb] tracking-tight">Platform Configuration</h1>
          <p className="text-[#6b7280] text-sm">Manage global AI parameters and API access keys.</p>
        </div>
      </div>

      <PlatformSettings />
    </div>
  );
}
