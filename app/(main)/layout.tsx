import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper';
import ConversationSidebar from '@/components/chat/ConversationSidebar';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <SessionProviderWrapper>
      <div className="flex h-screen bg-base overflow-hidden">
        <ConversationSidebar />
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {children}
        </main>
      </div>
    </SessionProviderWrapper>
  );
}
