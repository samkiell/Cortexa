import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Conversation from '@/lib/models/Conversation';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  try {
    const { id } = await params;
    await dbConnect();

    const conversation = await Conversation.findOne({
      _id: id,
      userId: (session.user as any).id,
    });

    if (!conversation) return new Response('Not Found', { status: 404 });

    return NextResponse.json(conversation);
  } catch (error: any) {
    return new Response(error.message || 'Error fetching conversation', { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  try {
    const { id } = await params;
    const { messages, title } = await req.json();
    await dbConnect();

    const updateData: any = {};
    if (messages) updateData.messages = messages;
    if (title) updateData.title = title;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId: (session.user as any).id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!conversation) return new Response('Not Found', { status: 404 });

    return NextResponse.json(conversation);
  } catch (error: any) {
    return new Response(error.message || 'Error updating conversation', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  try {
    const { id } = await params;
    await dbConnect();

    await Conversation.deleteOne({ _id: id, userId: (session.user as any).id });

    return new Response('Deleted', { status: 200 });
  } catch (error: any) {
    return new Response(error.message || 'Error deleting conversation', { status: 500 });
  }
}
