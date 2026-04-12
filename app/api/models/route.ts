import { NextResponse } from 'next/server';
import { CURATED_MODELS } from '@/lib/featherless';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    
    // If no settings yet or none visible, show all as default 
    // (though admin panel should prevent disabling the last one)
    if (!settings || !settings.visibleModels || settings.visibleModels.length === 0) {
      return NextResponse.json(CURATED_MODELS);
    }

    const filteredModels = CURATED_MODELS.filter(m => settings.visibleModels.includes(m.id));
    return NextResponse.json(filteredModels);
  } catch (error: any) {
    console.error('Error in models API route:', error);
    return new Response(error.message || 'Error fetching models', { status: 500 });
  }
}
