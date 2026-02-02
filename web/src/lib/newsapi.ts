export interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string | null;
  published_at: string;
  source: string;
  categories?: string[];
}

export interface NewsResponse {
  data: NewsArticle[];
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
}

export interface NewsError {
  error: string;
  message: string;
}

export type Category = 
  | 'tech' 
  | 'general' 
  | 'science' 
  | 'sports' 
  | 'business' 
  | 'health' 
  | 'entertainment' 
  | 'politics' 
  | 'food' 
  | 'travel';

export const CATEGORIES: Category[] = [
  'tech',
  'general',
  'science',
  'sports',
  'business',
  'health',
  'entertainment',
  'politics',
  'food',
  'travel'
];

export async function fetchNews(
  page: number,
  category?: Category,
  search?: string
): Promise<NewsResponse> {
  const params = new URLSearchParams({
    page: page.toString()
  });

  if (search && search.trim()) {
    params.set('search', search.trim());
    console.log(`[API] Fetching news with search: "${search.trim()}", page ${page}`);
  } else {
    params.set('categories', category || 'tech');
    console.log(`[API] Fetching news for category: ${category || 'tech'}, page ${page}`);
  }

  const url = `/api/news/all?${params}`;
  console.log(`[API] Proxied URL: ${url}`);

  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData: NewsError = await response.json();
    throw new Error(errorData.message || 'Failed to fetch news');
  }

  return response.json();
}
