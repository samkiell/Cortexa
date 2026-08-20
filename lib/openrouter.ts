export const CURATED_MODELS = [
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT-OSS 20B",
    size: "21B",
    vision: false,
    supportsTools: true,
    tags: ["free", "open-weights", "moe"],
    description: "OpenAI Apache 2.0 open-weight MoE model with 3.6B active parameters"
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Gemma 4 26B A4B",
    size: "26B",
    vision: true,
    supportsTools: true,
    tags: ["free", "vision", "moe"],
    description: "Google DeepMind instruction-tuned MoE model with vision and multimodal support"
  },
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
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 3 Super 120B",
    size: "120B",
    vision: false,
    supportsTools: true,
    tags: ["free", "reasoning", "moe"],
    description: "120B hybrid Mamba-Transformer MoE model for high efficiency and accuracy"
  },
  {
    id: "nvidia/nemotron-nano-12b-v2-vl:free",
    name: "Nemotron Nano 12B VL",
    size: "12B",
    vision: true,
    supportsTools: true,
    tags: ["free", "vision", "multimodal"],
    description: "Open multimodal reasoning model for video understanding and document intelligence"
  },
  {
    id: "cohere/north-mini-code:free",
    name: "North Mini Code",
    size: "30B",
    vision: false,
    supportsTools: true,
    tags: ["free", "coding", "agentic"],
    description: "Cohere sparse MoE model optimized for agentic coding and technical reasoning"
  },
  {
    id: "dots-studio/dots-3-note-preview:free",
    name: "Dots 3 Note Preview",
    size: "280B",
    vision: false,
    supportsTools: true,
    tags: ["free", "moe", "preview"],
    description: "280B MoE model from Dots Studio with 16B active parameters"
  },
  {
    id: "z-ai/glm-5.2:free",
    name: "GLM 5.2",
    size: "Reasoning",
    vision: false,
    supportsTools: true,
    tags: ["free", "reasoning", "long-context"],
    description: "Large-scale reasoning model from Z.ai supporting 1M-token context window"
  },
  {
    id: "liquid/lfm-2.5-2.6b:free",
    name: "LFM 2.5 2.6B",
    size: "2.6B",
    vision: false,
    supportsTools: true,
    tags: ["free", "fast", "compact"],
    description: "Compact reasoning model from Liquid AI suited for RAG and fast chat"
  },
  {
    id: "poolside/laguna-s-2.1:free",
    name: "Laguna S 2.1",
    size: "118B",
    vision: false,
    supportsTools: true,
    tags: ["free", "coding", "agent"],
    description: "118B parameter coding agent model from Poolside"
  }
];

export type Model = typeof CURATED_MODELS[number];
