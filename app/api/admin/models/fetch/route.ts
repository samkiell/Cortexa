import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CURATED_MODELS } from '@/lib/featherless';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Goal: Fetch the full catalog from the public web API (Unauthenticated)
    // Fallback: Use curated models if catalog is unreachable or returns 404
    try {
      const response = await fetch('https://featherless.ai/api/models', {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache results for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        // Featherless catalog API usually returns an array of models
        // Ensure we handle it if they wrap it in a 'data' field or return raw array
        const models = Array.isArray(data) ? data : (data.data || []);
        
        if (models.length > 0) {
          console.log(`Successfully synced ${models.length} models from public catalog.`);
          return NextResponse.json({ data: models });
        }
      }
    } catch (apiErr: any) {
      console.error('Public catalog sync failed:', apiErr.message);
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
