import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CURATED_MODELS } from '@/lib/openrouter';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache results for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        const models = Array.isArray(data) ? data : (data.data || []);
        
        // Filter to free models or curated models
        const filteredModels = models.filter((m: any) => {
          const isFree = m.id?.endsWith(':free') || m.id === 'openrouter/free' || (m.pricing?.prompt === '0' && m.pricing?.completion === '0');
          const isCurated = CURATED_MODELS.some(cm => cm.id === m.id);
          return isFree || isCurated;
        });

        if (filteredModels.length > 0) {
          console.log(`Successfully synced ${filteredModels.length} free models from OpenRouter catalog.`);
          return NextResponse.json({ data: filteredModels });
        }
      }
    } catch (apiErr: any) {
      console.error('OpenRouter catalog sync failed:', apiErr.message);
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
