# News Reader - Express Proxy Server

This Express server proxies requests to TheNewsApi to keep your API token secure.

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your TheNewsApi token to `.env`:
   ```
   THENEWSAPI_TOKEN=your_actual_token_here
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5177`.

## Endpoints

- `GET /api/health` - Health check
- `GET /api/news/all` - Proxy to TheNewsApi with query params:
  - `page` - Page number (default: 1)
  - `categories` - News category (tech, general, science, etc.)
  - `search` - Search query (mutually exclusive with categories)

## Security

- Never commit your `.env` file
- The API token is never exposed to the browser
- Token is redacted from server logs
