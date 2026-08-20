import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CURATED_MODELS } from '@/lib/venice';
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
    const apiKeyRaw = settings?.veniceApiKey || settings?.openrouterApiKey || settings?.featherlessApiKey || process.env.VENICE_API_KEY || process.env.OPENROUTER_API_KEY || process.env.FEATHERLESS_API_KEY;
    let apiKey = apiKeyRaw;
    if (apiKeyRaw && apiKeyRaw.includes(':')) {
      apiKey = decrypt(apiKeyRaw);
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch('https://api.venice.ai/api/v1/models', {
        headers,
        next: { revalidate: 3600 } // Cache results for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        const models = Array.isArray(data) ? data : (data.data || []);
        
        if (models.length > 0) {
          console.log(`Successfully synced ${models.length} models from Venice AI catalog.`);
          return NextResponse.json({ data: models });
        }
      }
    } catch (apiErr: any) {
      console.error('Venice AI catalog sync failed:', apiErr.message);
    }

    // Silent Fallback: Always return at least the curated list to prevent UI breakage
    console.log('Falling back to Curated Models list for Library');
    return NextResponse.json({ 
       data: CURATED_MODELS.map(m => ({ 
         id: m.id, 
         created: Date.now()/1000,
         is_curated: true 
       }))
    });

  } catch (error: any) {
    // Ultimate safety: Return data even on internal server error to keep UI alive
    return NextResponse.json({ 
      data: CURATED_MODELS.map(m => ({ id: m.id, created: Date.now()/1000 }))
    });
  }
}
