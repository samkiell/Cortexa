import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 }).select('-password');
    return NextResponse.json(users);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { userId, role } = await req.json();
    await dbConnect();

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { returnDocument: 'after' }
    ).select('-password');

    return NextResponse.json(user);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
