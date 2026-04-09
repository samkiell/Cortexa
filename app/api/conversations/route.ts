import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Conversation from '@/lib/models/Conversation';

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
