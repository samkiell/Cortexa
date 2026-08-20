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

    // Goal: Fetch the full catalog from the public web API (Unauthenticated)
    // Fallback: Use curated models if catalog is unreachable or returns 404
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache results for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        // OpenRouter catalog API returns { data: [...] }
        const models = Array.isArray(data) ? data : (data.data || []);
        
        // Filter to uncensored or free models only
        const filteredModels = models.filter((m: any) => {
          const isFree = m.id?.endsWith(':free') || (m.pricing?.prompt === '0' && m.pricing?.completion === '0');
          const isUncensored = /dolphin|venice|uncensored|abliterat|heretic|mythomax|cydonia|fimbulvetr|remm|rogue|slerp/i.test(
            `${m.id} ${m.name || ''} ${m.description || ''}`
          );
          return isFree || isUncensored;
        });

        if (filteredModels.length > 0) {
          console.log(`Successfully synced ${filteredModels.length} free/uncensored models from OpenRouter catalog.`);
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
