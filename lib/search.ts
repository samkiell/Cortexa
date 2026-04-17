import { tavily } from '@tavily/core'

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

let client: any = null;

function getTavilyClient() {
  if (client) return client;
  if (!process.env.TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY is not configured');
  }
  client = tavily({ apiKey: process.env.TAVILY_API_KEY });
  return client;
}

export async function webSearch(query: string) {
  const tavilyClient = getTavilyClient();
  const result = await tavilyClient.search(query, {
    searchDepth: 'basic',
    maxResults: 5,
    includeAnswer: true,
  })
  return {
    answer: result.answer,
    results: result.results.map((r: TavilySearchResult) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    }))
  }
}
