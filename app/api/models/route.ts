import { NextResponse } from 'next/server';
import { getModels } from '@/lib/models-data';

export async function GET() {
  try {
    const models = await getModels();
    
    if (models.length === 0) {
      // Check if it's an empty list or an error (getModels returns [] on error)
      // For simplicity, we just return the list.
    }

    return NextResponse.json(models);
  } catch (error: any) {
    console.error('Error in models API route:', error);
    return new Response(error.message || 'Error fetching models', { status: 500 });
  }
}
