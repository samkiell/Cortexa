import SettingsForm from '@/components/admin/SettingsForm';
import { Settings as SettingsIcon } from 'lucide-react';
import { getSettings, getModels } from '@/lib/models-data';

export default async function AdminSettingsPage() {
  const [settings, allModels] = await Promise.all([
    getSettings(),
    getModels(true)
  ]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-accent/10">
          <SettingsIcon className="h-8 w-8 text-accent" />
        </div>
        <div>
          <h1 className="font-syne text-3xl font-bold text-white tracking-tight">Platform Configuration</h1>
          <p className="text-muted">Manage global AI parameters and API access keys.</p>
        </div>
      </div>

      <SettingsForm initialData={settings} initialModels={allModels} />
    </div>
  );
}
