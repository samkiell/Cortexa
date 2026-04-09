import { NextResponse } from 'next/server';
import { CURATED_MODELS } from '@/lib/featherless';

export async function GET() {
  try {
    return NextResponse.json(CURATED_MODELS);
  } catch (error: any) {
    console.error('Error in models API route:', error);
    return new Response(error.message || 'Error fetching models', { status: 500 });
  }
}
