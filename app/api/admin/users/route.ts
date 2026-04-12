import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

import Conversation from '@/lib/models/Conversation';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 }).select('-password').lean();
    
    // Fetch conversation counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user: any) => {
        const count = await Conversation.countDocuments({ userId: user._id });
        return { ...user, conversationCount: count };
      })
    );

    return NextResponse.json(usersWithCounts);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

