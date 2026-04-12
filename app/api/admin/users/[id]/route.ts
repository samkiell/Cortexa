import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Conversation from '@/lib/models/Conversation';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await params;

  try {
    const { role, suspended } = await req.json();
    await dbConnect();

    const update: any = {};
    if (role !== undefined) update.role = role;
    if (suspended !== undefined) update.suspended = suspended;

    const user = await User.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await params;

  try {
    await dbConnect();

    // Delete user
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete all user's conversations
    await Conversation.deleteMany({ userId: id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
