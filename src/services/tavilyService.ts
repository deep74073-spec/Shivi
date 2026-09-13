import dotenv from 'dotenv';

dotenv.config();

const tavilyApiKey = process.env.TAVILY_API_KEY;

if (!tavilyApiKey) {
  console.warn('TAVILY_API_KEY is missing from environment variables.');
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export const searchWeb = async (query: string, maxResults: number = 5): Promise<SearchResponse> => {
  if (!tavilyApiKey) {
    throw new Error('TAVILY_API_KEY is not configured on the server.');
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: query,
        search_depth: 'basic',
        include_answer: false,
        max_results: maxResults
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API responded with status ${response.status}`);
    }

    const data: any = await response.json();

    return {
      query: query,
      results: (data.results || []).map((item: any) => ({
        title: item.title,
        url: item.url,
        content: item.content,
        score: item.score
      }))
    };
  } catch (error: any) {
    console.error('Tavily Search Error:', error?.message || error);
    throw new Error(`Web search failed: ${error?.message || 'Unknown error'}`);
  }
};
