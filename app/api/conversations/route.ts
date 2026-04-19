import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Conversation from '@/lib/models/Conversation';
import Settings from '@/lib/models/Settings';
import RateLimit from '@/lib/models/RateLimit';
import { startOfHour } from 'date-fns';

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
    const userId = (session.user as any).id;
    
    if (!isAdmin) {
      const now = new Date();
      const hourStart = startOfHour(now);
      const resetAt = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const settings = await Settings.findOne();
      const convLimit = settings?.hourlyConversationLimit || 10;

      let limitDoc = await RateLimit.findOne({ userId, type: 'conversation' });
      if (!limitDoc || limitDoc.windowStart < hourStart) {
        limitDoc = await RateLimit.findOneAndUpdate(
          { userId, type: 'conversation' },
          { count: 1, windowStart: hourStart },
          { upsert: true, returnDocument: 'after' }
        );
      } else if (limitDoc.count >= convLimit) {
        const minutesLeft = Math.ceil((resetAt.getTime() - now.getTime()) / 60000);
        return NextResponse.json({ 
          error: 'limit_reached', 
          message: `You've reached your new chat limit for this hour.`,
          suggestion: `Please wait ${minutesLeft} minutes to start a new thread or continue an existing one.`
        }, { status: 403 });
      } else {
        limitDoc.count += 1;
        await limitDoc.save();
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
