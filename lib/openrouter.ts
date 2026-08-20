export const CURATED_MODELS = [
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "Nemotron 3 Ultra 550B",
    size: "550B",
    vision: false,
    supportsTools: true,
    tags: ["free", "frontier", "reasoning"],
    description: "Massive 550B MoE frontier reasoning and orchestration model from NVIDIA"
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Gemma 4 26B",
    size: "26B",
    vision: true,
    supportsTools: true,
    tags: ["free", "vision", "multimodal"],
    description: "Google DeepMind multimodal instruction model with vision input support"
  },
  {
    id: "poolside/laguna-s-2.1:free",
    name: "Laguna S 2.1",
    size: "118B",
    vision: false,
    supportsTools: true,
    tags: ["free", "coding", "agent"],
    description: "118B parameter coding agent model from Poolside"
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT-OSS 20B",
    size: "20B",
    vision: false,
    supportsTools: true,
    tags: ["free", "openai", "general"],
    description: "Open-source general purpose model from OpenAI"
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    name: "Nemotron 3.5 Lightning",
    size: "Fast",
    vision: false,
    supportsTools: true,
    tags: ["free", "fast", "speed"],
    description: "Ultra high-speed lightweight inference model from NVIDIA"
  },
  {
    id: "openrouter/free",
    name: "OpenRouter Free Auto",
    size: "Auto",
    vision: true,
    supportsTools: true,
    tags: ["free", "auto"],
    description: "Automatically routes to the best available free model on OpenRouter"
  }
];

export type Model = typeof CURATED_MODELS[number];
