import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.FEATHERLESS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Featherless API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.featherless.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Featherless API responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch Featherless models:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
