import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { decrypt } from '@/lib/crypto';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const settings = await Settings.findOne();
    
    // Try to get key from DB first, then fallback to Env
    let apiKey = settings?.featherlessApiKey || process.env.FEATHERLESS_API_KEY;

    // Decrypt if it's stored in DB format (contains ':')
    if (apiKey && apiKey.includes(':')) {
      try {
        apiKey = decrypt(apiKey);
      } catch (e) {
        console.error('Failed to decrypt API key');
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Featherless API key not configured' }, { status: 500 });
    }

    console.log('Fetching models from Featherless...');
    const response = await fetch('https://api.featherless.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Featherless Error:', response.status, errorText);
      return NextResponse.json({ error: `Featherless API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.data?.length || 0} models`);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Detailed fetch error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
