import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Conversation from '@/lib/models/Conversation';
import { getModels } from '@/lib/models-data';
import ChatInterface from '@/components/chat/ChatInterface';

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { id } = await params;

  try {
    await dbConnect();
    
    // Prefetch models and conversation in parallel
    const [models, conversation] = await Promise.all([
      getModels(),
      Conversation.findOne({
        _id: id,
        userId: (session.user as any).id,
      })
    ]);

    if (!conversation) {
      return notFound();
    }

    // Convert Mongoose document to plain message objects
    const initialMessages = conversation.messages.map((m: any) => ({
      role: m.role,
      content: m.content,
      imageUrl: m.imageUrl,
      timestamp: m.timestamp,
    }));

    return (
      <ChatInterface 
        initialMessages={initialMessages} 
        conversationId={id} 
        initialModels={models}
      />
    );
  } catch (error) {
    console.error('Error loading chat:', error);
    return notFound();
  }
}
