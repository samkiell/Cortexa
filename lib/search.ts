import { tavily } from '@tavily/core'

const client = process.env.TAVILY_API_KEY 
  ? tavily({ apiKey: process.env.TAVILY_API_KEY })
  : null;

export async function webSearch(query: string) {
  if (!client) {
    throw new Error('TAVILY_API_KEY is not configured');
  }
  const result = await client.search(query, {
    searchDepth: 'basic',
    maxResults: 5,
    includeAnswer: true,
  })
  return {
    answer: result.answer,
    results: result.results.map(r => ({
      title: r.title,
      url: r.url,
      content: r.content,
    }))
  }
}
