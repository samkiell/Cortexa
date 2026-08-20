export const CURATED_MODELS = [
  {
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    name: "Dolphin Mistral 24B (Venice)",
    size: "24B",
    vision: false,
    supportsTools: true,
    tags: ["uncensored", "free"],
    description: "Uncensored Dolphin model fine-tuned on Mistral NeMo 24B"
  },
  {
    id: "meta-llama/llama-3.2-11b-vision-instruct:free",
    name: "Llama 3.2 11B Vision",
    size: "11B",
    vision: true,
    supportsTools: true,
    tags: ["vision", "free"],
    description: "Multimodal model supporting text and visual inputs"
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B Instruct",
    size: "70B",
    vision: false,
    supportsTools: true,
    tags: ["general", "free"],
    description: "Flagship open weights model with state-of-the-art reasoning"
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    size: "671B",
    vision: false,
    supportsTools: false,
    tags: ["reasoning", "free"],
    description: "Advanced reasoning model with step-by-step thinking"
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    name: "Qwen 2.5 Coder 32B",
    size: "32B",
    vision: false,
    supportsTools: true,
    tags: ["coding", "free"],
    description: "Specialized model for coding, refactoring, and technical tasks"
  },
  {
    id: "gryphe/mythomax-l2-13b:free",
    name: "MythoMax L2 13B",
    size: "13B",
    vision: false,
    supportsTools: false,
    tags: ["uncensored", "free"],
    description: "Popular uncensored creative writing and roleplay model"
  },
  {
    id: "mistralai/mistral-small-24b-instruct-2501:free",
    name: "Mistral Small 24B",
    size: "24B",
    vision: false,
    supportsTools: true,
    tags: ["general", "free"],
    description: "Fast and lightweight 24B instruct model from Mistral"
  }
];

export type Model = typeof CURATED_MODELS[number];
