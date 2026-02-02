# News Reader

A modern, performant news reader application with a Flipboard-like single-article view, built with React + Vite and secured with a Node.js Express proxy.

## Features

- **Single-Article Featured View**: Flipboard-inspired large card layout with image overlay
- **Category & Search Filters**: Browse tech, science, sports, business, and more, or search for specific topics
- **Smart Pagination**: Circular pager with prefetching for instant page transitions
- **In-Memory Caching**: Jump back to page 1 without refetching
- **Favorites System**: Save articles to read later, persisted in localStorage
- **Responsive Design**: Optimized for desktop and mobile with adaptive layouts
- **Security**: API tokens hidden via Express proxy - never exposed to the browser
- **Performance**: In-memory caching and intelligent prefetching for smooth UX

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Node.js + Express
- **Styling**: Plain CSS with CSS custom properties
- **Data Source**: [TheNewsApi](https://www.thenewsapi.com/)

## Project Structure

```
news-reader/
├── server/              # Express proxy server
│   ├── server.js        # Main server file
│   ├── package.json     # Server dependencies
│   ├── .env.example     # Environment template
│   └── README.md        # Server documentation
├── web/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx              # Main app component
│   │   ├── main.tsx             # Entry point
│   │   ├── styles.css           # Global styles
│   │   ├── lib/
│   │   │   └── newsapi.ts       # API client
│   │   └── components/
│   │       └── HeadlinesList.tsx # Main component
│   ├── public/
│   │   └── placeholder.png      # Fallback image
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── package.json         # Root scripts
└── .gitignore          # Git ignore rules
```

## How to Run

### 1. Install Dependencies

```bash
# Install server dependencies
npm run server:install

# Install web dependencies
cd web && npm install && cd ..
```

### 2. Configure API Token

Copy the example environment file and add your TheNewsApi token:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and replace `your_api_token_here` with your actual token from [TheNewsApi](https://www.thenewsapi.com/).

```env
THENEWSAPI_TOKEN=your_actual_token_here
```

### 3. Start Development Servers

From the root directory:

```bash
npm run dev
```

This starts both:
- **Express proxy server** on `http://localhost:5177`
- **Vite dev server** on `http://localhost:5176`

Open your browser to **http://localhost:5176** to view the app.

## Usage

### Desktop
- **Left Sidebar**: Search input and category filters always visible
- **Main Content**: Featured article card with large image and overlay text
- **Favorites Button**: Bottom-left corner to toggle favorites view

### Mobile
- **Filter Toggle**: "Show/Hide Filters" button to access sidebar
- **Single Column**: Optimized layout for mobile screens
- **Touch-Friendly**: Large tap targets and swipe-friendly pagination

### Navigation
- **« (First)**: Jump to page 1
- **‹ (Previous)**: Go to previous article
- **Numbered Dots**: Current article position
- **› (Next)**: Advance to next article

### Features
- **Categories**: tech, general, science, sports, business, health, entertainment, politics, food, travel
- **Search**: When search has text, categories are ignored
- **Prefetching**: Next/previous pages load in background for instant transitions
- **Caching**: Previously viewed pages are cached for instant access
- **Favorites**: Star icon to save articles, view them anytime

## API Behavior

- **Language**: Fixed to English (`en`) for all requests
- **Results**: 3 articles per page (`limit=3`)
- **Default Category**: Tech
- **Search vs Category**: Mutually exclusive - search takes precedence when active
- **Error Handling**: 
  - `429` → "Daily request limit reached. Please try again tomorrow."
  - `401/403` → "TheNewsApi authentication failed. Please check your API token."

## Security Notes

⚠️ **Never commit your `.env` file or expose your API token!**

- API token is stored in `server/.env` (git-ignored)
- Express proxy adds token to requests server-side
- Frontend never sees or logs the token
- `.env.example` provided as template only

## Scripts

### Root
- `npm run server:install` - Install server dependencies
- `npm run web:install` - Install web dependencies
- `npm run install:all` - Install all dependencies
- `npm run dev` - Run both servers concurrently

### Server (`cd server`)
- `npm run dev` - Start Express server on port 5177
- `npm start` - Production start

### Web (`cd web`)
- `npm run dev` - Start Vite dev server on port 5176
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Reference

The Express proxy exposes:

- `GET /api/health` - Server health check
- `GET /api/news/all` - News articles (proxied to TheNewsApi)
  - Query params: `page`, `categories`, `search`
  - Fixed: `language=en`, `limit=3`

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- CSS Grid and Flexbox

## License

MIT

---

Built with ❤️ using React, Vite, and Express
