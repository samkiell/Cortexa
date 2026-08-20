export const CURATED_MODELS = [
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    size: "70B",
    vision: false,
    supportsTools: true,
    tags: ["flagship", "powerful"],
    description: "Flagship 70B open weights model with state-of-the-art reasoning and knowledge"
  },
  {
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    name: "Dolphin Mistral 24B (Venice)",
    size: "24B",
    vision: false,
    supportsTools: true,
    tags: ["uncensored", "dolphin", "free"],
    description: "Uncensored Dolphin model fine-tuned on Mistral NeMo 24B without alignment filters"
  },
  {
    id: "gryphe/mythomax-l2-13b",
    name: "MythoMax L2 13B",
    size: "13B",
    vision: false,
    supportsTools: false,
    tags: ["uncensored", "roleplay"],
    description: "Popular uncensored creative writing, storytelling, and roleplay model"
  },
  {
    id: "thedrummer/cydonia-24b-v4.1:free",
    name: "Cydonia 24B V4.1",
    size: "24B",
    vision: false,
    supportsTools: true,
    tags: ["uncensored", "heretic", "free"],
    description: "Uncensored and highly expressive 24B model by TheDrummer"
  },
  {
    id: "undi95/remm-slerp-l2-13b:free",
    name: "ReMM SLERP 13B",
    size: "13B",
    vision: false,
    supportsTools: false,
    tags: ["uncensored", "roleplay", "free"],
    description: "Uncensored merge optimized for unrestrained chat and narrative creation"
  },
  {
    id: "sophosympatheia/rogue-rose-103b-v0.2:free",
    name: "Rogue Rose 103B",
    size: "103B",
    vision: false,
    supportsTools: false,
    tags: ["uncensored", "creative", "free"],
    description: "High-parameter uncensored model for complex creative and roleplay tasks"
  },
  {
    id: "sao10k/fimbulvetr-11b-v2:free",
    name: "Fimbulvetr 11B v2",
    size: "11B",
    vision: false,
    supportsTools: false,
    tags: ["uncensored", "storytelling", "free"],
    description: "Uncensored creative writing model with strong prompt adherence"
  }
];

export type Model = typeof CURATED_MODELS[number];
