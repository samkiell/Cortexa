import OpenAI from 'openai';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function getSettings() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        featherlessApiKey: '',
        visibleModels: [],
      });
    }
    return JSON.parse(JSON.stringify(settings)); // Plain object for server components
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

export async function getModels(adminMode = false) {
  try {
    await dbConnect();

    // Get whitelisted models from settings
    const settings = await Settings.findOne();
    const whitelist = settings?.visibleModels || [];

    // Fallback or development key
    const apiKey = settings?.featherlessApiKey || process.env.FEATHERLESS_API_KEY;

    if (!apiKey) {
      console.error('Missing API Key for models fetch');
      return [];
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.featherless.ai/v1',
    });

    const response = await openai.models.list();
    let models = response.data;

    // Map and basic data mapping
    const formattedModels = models
      .map((m) => {
        const id = m.id.toLowerCase();
        return {
          id: m.id,
          name: m.id.split('/').pop() || m.id,
          isVision: 
            id.includes('vision') || 
            id.includes('multimodal') || 
            id.includes('pixtral') || 
            id.includes('llava') || 
            id.includes('moondream') || 
            id.includes('qwen-vl') || 
            id.includes('minicpm-v') ||
            id.includes('internvl') ||
            id.includes('molmo'),
          isUncensored: 
            id.includes('uncensored') || 
            id.includes('abliterated') || 
            id.includes('dolphin') || 
            id.includes('hermes') ||
            id.includes('nous') ||
            id.includes('openhermes') ||
            id.includes('instruct-abliterated'),
          isReasoning: id.includes('r1') || id.includes('thought') || id.includes('reasoning'),
        };
      });

    // Deduplicate by ID
    const uniqueModels = Array.from(new Map(formattedModels.map(m => [m.id, m])).values());

    // Filter logic
    if (adminMode) {
      // Return everything but prioritize uncensored at the top if needed, 
      // or just return unique list for the whitelist manager.
      return uniqueModels;
    }

    // Default: Filter by whitelist AND (uncensored OR vision) for end users
    let filtered = uniqueModels.filter((m) => m.isUncensored || m.isVision);
    if (whitelist.length > 0) {
      filtered = filtered.filter((m) => whitelist.includes(m.id));
    }

    return filtered;
  } catch (error: any) {
    console.error('Error fetching models in helper:', error);
    return [];
  }
}
