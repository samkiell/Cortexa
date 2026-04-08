import UserTable from '@/components/admin/UserTable';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <Users className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-syne text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-muted">Audit and manage all registered users and their platform roles.</p>
        </div>
      </div>

      <UserTable />
    </div>
  );
}
