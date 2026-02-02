import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5177;
const API_TOKEN = process.env.THENEWSAPI_TOKEN;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasToken: !!API_TOKEN
  });
});

// News proxy endpoint
app.get('/api/news/all', async (req, res) => {
  if (!API_TOKEN) {
    console.error('[PROXY] Missing THENEWSAPI_TOKEN in environment');
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'API token not configured'
    });
  }

  try {
    // Build query params
    const params = new URLSearchParams({
      api_token: API_TOKEN,
      language: 'en',
      limit: '3',
      ...Object.fromEntries(
        Object.entries(req.query).filter(([key]) => 
          ['page', 'categories', 'search'].includes(key)
        )
      )
    });

    const url = `https://api.thenewsapi.com/v1/news/all?${params}`;
    
    // Log proxied URL (without token for security)
    const sanitizedParams = new URLSearchParams(params);
    sanitizedParams.set('api_token', '[REDACTED]');
    console.log(`[PROXY] GET /v1/news/all?${sanitizedParams}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error(`[PROXY] API error ${response.status}:`, data);
      
      // Handle specific error codes
      if (response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Daily request limit reached. Please try again tomorrow.'
        });
      }
      
      if (response.status === 401 || response.status === 403) {
        return res.status(response.status).json({
          error: 'Authentication failed',
          message: 'TheNewsApi authentication failed. Please check your API token.'
        });
      }

      return res.status(response.status).json({
        error: data.error || 'API request failed',
        message: data.message || 'An error occurred while fetching news'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('[PROXY] Network error:', error.message);
    res.status(500).json({ 
      error: 'Network error',
      message: 'Failed to connect to news API'
    });
  }
});

app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
  console.log(`[SERVER] API token configured: ${!!API_TOKEN}`);
  if (!API_TOKEN) {
    console.warn('[SERVER] ⚠️  THENEWSAPI_TOKEN not set in .env');
  }
});
