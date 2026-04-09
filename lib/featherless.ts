export const CURATED_MODELS = [
  {
    id: "coder3101/Cydonia-24B-v4.3-vision-heretic",
    name: "Cydonia 24B Vision",
    size: "24B",
    vision: true,
    tags: ["uncensored", "vision"],
    description: "Uncensored 24B with full vision support"
  },
  {
    id: "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
    name: "Mistral Small 3.2",
    size: "24B",
    vision: true,
    tags: ["vision"],
    description: "Strong general model with vision"
  },
  {
    id: "huihui-ai/Llama-3.3-70B-Instruct-abliterated",
    name: "Llama 3.3 70B",
    size: "70B",
    vision: false,
    tags: ["abliterated"],
    description: "Most capable, fully abliterated"
  },
  {
    id: "huihui-ai/Qwen2.5-72B-Instruct-abliterated",
    name: "Qwen 2.5 72B",
    size: "72B",
    vision: false,
    tags: ["abliterated"],
    description: "Top multilingual and reasoning model"
  },
  {
    id: "Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2",
    name: "Lexi 8B",
    size: "8B",
    vision: false,
    tags: ["uncensored"],
    description: "Fast everyday uncensored model"
  }
];

export type Model = typeof CURATED_MODELS[number];
