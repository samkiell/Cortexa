import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Conversation from '@/lib/models/Conversation';
import Settings from '@/lib/models/Settings';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  try {
    await dbConnect();
    const conversations = await Conversation.find({ userId: (session.user as any).id })
      .sort({ updatedAt: -1 })
      .select('title modelId updatedAt createdAt');

    return NextResponse.json(conversations);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  try {
    const { title, modelId, messages } = await req.json();

    await dbConnect();
    
    // Check Settings for max conversations
    const settings = await Settings.findOne();
    const maxConvs = settings?.maxConversations || 50;

    // Admin skip check
    const isAdmin = (session.user as any).role === 'admin';
    
    if (!isAdmin) {
      const currentCount = await Conversation.countDocuments({ userId: (session.user as any).id });
      if (currentCount >= maxConvs) {
        return NextResponse.json({ 
          error: 'limit_reached', 
          message: `You've reached the ${maxConvs} conversation limit.`,
          suggestion: 'Delete an old chat to start a new one.'
        }, { status: 403 });
      }
    }

    const conversation = await Conversation.create({
      userId: (session.user as any).id,
      title: title || 'New Conversation',
      modelId,
      messages: messages || [],
    });

    return NextResponse.json(conversation);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
