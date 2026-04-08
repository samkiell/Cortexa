import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import OpenAI from 'openai';

export async function GET() {
  try {
    await dbConnect();

    // Get whitelisted models from settings
    const settings = await Settings.findOne();
    const whitelist = settings?.visibleModels || [];

    // Fallback or development key
    const apiKey = settings?.featherlessApiKey || process.env.FEATHERLESS_API_KEY;

    if (!apiKey) {
      return new Response('Missing API Key', { status: 500 });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.featherless.ai/v1',
    });

    const response = await openai.models.list();
    let models = response.data;

    // Filter by whitelist if present
    if (whitelist.length > 0) {
      models = models.filter((m) => whitelist.includes(m.id));
    }

    // Map to a cleaner format with badges
    const formattedModels = models.map((m) => {
      const id = m.id.toLowerCase();
      return {
        id: m.id,
        name: m.id.split('/').pop() || m.id,
        isVision: id.includes('vision') || id.includes('multimodal'),
        isUncensored: id.includes('uncensored') || id.includes('abliterated') || id.includes('dolphin'),
        isReasoning: id.includes('r1') || id.includes('thought') || id.includes('reasoning'),
      };
    });

    // Deduplicate by ID to prevent React key collision errors
    const uniqueModels = Array.from(new Map(formattedModels.map(m => [m.id, m])).values());

    return NextResponse.json(uniqueModels);
  } catch (error: any) {
    console.error('Error fetching models:', error);
    return new Response(error.message || 'Error fetching models', { status: 500 });
  }
}
