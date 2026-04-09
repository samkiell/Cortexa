import OpenAI from 'openai';
import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { CURATED_MODELS } from './featherless';

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
  // Return the curated list directly as per instructions
  return CURATED_MODELS.map(m => ({
    ...m,
    isVision: m.vision,
    isUncensored: m.tags.includes('uncensored'),
    isReasoning: m.id.includes('72B') || m.id.includes('70B')
  }));
}
