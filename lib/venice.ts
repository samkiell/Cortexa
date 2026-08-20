export const CURATED_MODELS = [
  {
    id: "venice-uncensored",
    name: "Venice Uncensored (Dolphin 24B)",
    size: "24B",
    vision: false,
    supportsTools: true,
    tags: ["uncensored", "dolphin", "flagship"],
    description: "Flagship uncensored Dolphin Mistral 24B Venice Edition with zero alignment filters"
  },
  {
    id: "default",
    name: "Venice Default",
    size: "24B",
    vision: false,
    supportsTools: true,
    tags: ["uncensored", "default"],
    description: "Venice default uncensored model for general conversation and tasks"
  },
  {
    id: "dolphin-2.9.2-qwen2-72b",
    name: "Dolphin Qwen2 72B",
    size: "72B",
    vision: false,
    supportsTools: true,
    tags: ["uncensored", "dolphin", "powerful"],
    description: "Large 72B parameter uncensored Dolphin model with deep reasoning and knowledge"
  },
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    size: "70B",
    vision: false,
    supportsTools: true,
    tags: ["uncensored", "reasoning"],
    description: "Flagship 70B reasoning model hosted with unrestricted system prompting"
  },
  {
    id: "qwen-2.5-coder-32b",
    name: "Qwen 2.5 Coder 32B",
    size: "32B",
    vision: false,
    supportsTools: true,
    tags: ["uncensored", "coding"],
    description: "Specialized model for code generation, debugging, and software architecture"
  },
  {
    id: "deepseek-r1-llama-70b",
    name: "DeepSeek R1 Llama 70B",
    size: "70B",
    vision: false,
    supportsTools: false,
    tags: ["uncensored", "reasoning"],
    description: "Advanced reasoning model with chain-of-thought distillation"
  }
];

export type Model = typeof CURATED_MODELS[number];
