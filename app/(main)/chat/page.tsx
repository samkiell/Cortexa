export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ChatInterface from '@/components/chat/ChatInterface';
import { getModels } from '@/lib/models-data';

export default async function NewChatPage() {
  const models = await getModels();
  return <ChatInterface initialModels={models} />;
}
