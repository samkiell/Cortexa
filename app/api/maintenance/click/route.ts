import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function POST() {
  try {
    await dbConnect();
    const settings = await Settings.findOneAndUpdate(
      {},
      { $inc: { maintenanceUrgencyCount: 1 } },
      { upsert: true, new: true }
    );
    return NextResponse.json({ count: settings.maintenanceUrgencyCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register presence' }, { status: 500 });
  }
}
