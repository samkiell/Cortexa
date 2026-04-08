import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        featherlessApiKey: '',
        visibleModels: [],
      });
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { featherlessApiKey, visibleModels } = await req.json();
    await dbConnect();

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: { featherlessApiKey, visibleModels } },
      { upsert: true, new: true }
    );

    return NextResponse.json(settings);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
