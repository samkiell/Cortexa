import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Conversation from '@/lib/models/Conversation';
import { startOfDay } from 'date-fns';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const totalUsers = await User.countDocuments();
    const totalConversations = await Conversation.countDocuments();
    
    // Total Messages sum
    const conversations = await Conversation.find({}, { 'messages.content': 1 });
    const totalMessages = conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0);

    // Active Today
    const today = startOfDay(new Date());
    const activeTodayCount = await Conversation.distinct('userId', {
      updatedAt: { $gte: today }
    });

    // Recent conversations
    const recentConversations = await Conversation.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('userId', 'email');

    return NextResponse.json({
      stats: {
        totalUsers,
        totalConversations,
        totalMessages,
        activeToday: activeTodayCount.length,
      },
      recentConversations: recentConversations.map(conv => ({
        id: conv._id,
        userEmail: (conv.userId as any)?.email || 'Unknown',
        modelId: conv.modelId,
        messageCount: conv.messages.length,
        updatedAt: conv.updatedAt,
      }))
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
