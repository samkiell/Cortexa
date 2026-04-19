import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Usage from '@/lib/models/Usage';
import User from '@/lib/models/User';
import { startOfDay, subDays } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // 1. Overall Stats
    const totalUsage = await Usage.aggregate([
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$totalTokens' },
          promptTokens: { $sum: '$promptTokens' },
          completionTokens: { $sum: '$completionTokens' },
          count: { $sum: 1 }
        }
      }
    ]);

    const today = startOfDay(new Date());
    const todayUsage = await Usage.aggregate([
      { $match: { timestamp: { $gte: today } } },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$totalTokens' }
        }
      }
    ]);

    // 2. Usage by Model
    const modelUsage = await Usage.aggregate([
      {
        $group: {
          _id: '$modelId',
          totalTokens: { $sum: '$totalTokens' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalTokens: -1 } }
    ]);

    // 3. Usage by User
    const userUsage = await Usage.aggregate([
      {
        $group: {
          _id: '$userId',
          totalTokens: { $sum: '$totalTokens' },
          promptTokens: { $sum: '$promptTokens' },
          completionTokens: { $sum: '$completionTokens' },
          lastActive: { $max: '$timestamp' },
          models: { $addToSet: '$modelId' }
        }
      },
      { $sort: { totalTokens: -1 } },
      { $limit: 50 }
    ]);

    // Populate user emails
    const userIds = userUsage.map(u => u._id);
    const users = await User.find({ _id: { $in: userIds } }).select('email');
    const userMap = users.reduce((acc: any, user: any) => {
      acc[user._id.toString()] = user.email;
      return acc;
    }, {});

    const populatedUserUsage = userUsage.map(u => ({
      ...u,
      userEmail: userMap[u._id.toString()] || 'Unknown',
    }));

    return NextResponse.json({
      stats: {
        totalTokens: totalUsage[0]?.totalTokens || 0,
        promptTokens: totalUsage[0]?.promptTokens || 0,
        completionTokens: totalUsage[0]?.completionTokens || 0,
        requestCount: totalUsage[0]?.count || 0,
        todayTokens: todayUsage[0]?.totalTokens || 0
      },
      modelUsage: modelUsage.map(m => ({
        modelId: m._id,
        totalTokens: m.totalTokens,
        requestCount: m.count
      })),
      userUsage: populatedUserUsage
    });
  } catch (error: any) {
    console.error('Admin usage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
