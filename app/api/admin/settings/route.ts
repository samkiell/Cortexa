import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { encrypt, decrypt } from '@/lib/crypto';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const decryptedKey = decrypt(settings.featherlessApiKey || '');
    const maskedKey = decryptedKey 
      ? '••••••••••••' + (decryptedKey.slice(-4)) 
      : '';

    return NextResponse.json({
      siteName: settings.siteName,
      allowRegistration: settings.allowRegistration,
      maxConversations: settings.maxConversations,
      maintenanceMode: settings.maintenanceMode,
      featherlessApiKey: maskedKey,
      visibleModels: settings.visibleModels,
    });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    await dbConnect();

    const update: any = {
      siteName: data.siteName,
      allowRegistration: data.allowRegistration,
      maxConversations: data.maxConversations,
      maintenanceMode: data.maintenanceMode,
    };

    // Only update API key if it's not the masked one
    if (data.featherlessApiKey && !data.featherlessApiKey.startsWith('••••')) {
      update.featherlessApiKey = encrypt(data.featherlessApiKey);
    }

    if (data.visibleModels !== undefined) {
      update.visibleModels = data.visibleModels;
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true }
    );

    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
