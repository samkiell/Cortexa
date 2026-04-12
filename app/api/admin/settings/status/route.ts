import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.findOne({}, 'maintenanceMode allowRegistration');
    return NextResponse.json({ 
      maintenanceMode: settings?.maintenanceMode || false,
      allowRegistration: settings?.allowRegistration ?? true 
    });
  } catch (error) {
    return NextResponse.json({ maintenanceMode: false, allowRegistration: true });
  }
}
