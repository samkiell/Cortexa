export interface Source {
  url: string;
  title: string;
  content?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp?: Date;
  modelId?: string;
  isSearching?: boolean;
  searchQuery?: string;
  sources?: Source[];
}
