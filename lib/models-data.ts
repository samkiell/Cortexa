import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { CURATED_MODELS } from './openrouter';

export async function getSettings() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        openrouterApiKey: '',
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

export async function getModels() {
  // Return the curated list directly as per instructions
  return CURATED_MODELS.map(m => ({
    ...m,
    isVision: m.vision,
    isUncensored: m.tags.includes('uncensored') || m.tags.includes('open-weights'),
    isReasoning: m.tags.includes('reasoning') || m.id.includes('ultra') || m.id.includes('super')
  }));
}
