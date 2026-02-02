import { useState, useEffect } from 'react';
import HeadlinesList from './components/HeadlinesList';
import { NewsArticle } from './lib/newsapi';

const FAVORITES_KEY = 'news-reader-favorites';

function App() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteArticles, setFavoriteArticles] = useState<NewsArticle[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(new Set(parsed.ids || []));
        setFavoriteArticles(parsed.articles || []);
      } catch (err) {
        console.error('Failed to parse favorites:', err);
      }
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Set<string>, newArticles: NewsArticle[]) => {
    setFavorites(newFavorites);
    setFavoriteArticles(newArticles);
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify({
        ids: Array.from(newFavorites),
        articles: newArticles
      })
    );
  };

  const toggleFavorite = (uuid: string) => {
    const newFavorites = new Set(favorites);
    let newArticles = [...favoriteArticles];

    if (newFavorites.has(uuid)) {
      newFavorites.delete(uuid);
      newArticles = newArticles.filter(a => a.uuid !== uuid);
    } else {
      newFavorites.add(uuid);
      // In a real app, we'd fetch the full article here
      // For now, we'll add it when the user toggles from the current view
      // This is handled in HeadlinesList component context
    }

    saveFavorites(newFavorites, newArticles);
  };

  // Enhanced toggle that includes article data
  const handleToggleFavorite = (uuid: string, article?: NewsArticle) => {
    const newFavorites = new Set(favorites);
    let newArticles = [...favoriteArticles];

    if (newFavorites.has(uuid)) {
      newFavorites.delete(uuid);
      newArticles = newArticles.filter(a => a.uuid !== uuid);
    } else {
      newFavorites.add(uuid);
      if (article && !newArticles.find(a => a.uuid === uuid)) {
        newArticles.push(article);
      }
    }

    saveFavorites(newFavorites, newArticles);
  };

  return (
    <div className="app">
      <HeadlinesList
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        showFavorites={showFavorites}
        favoriteArticles={favoriteArticles}
      />

      <button
        className="favorites-toggle"
        onClick={() => setShowFavorites(!showFavorites)}
        aria-label={showFavorites ? 'Show live news' : 'Show favorites'}
      >
        {showFavorites ? '← Back to News' : `★ Favorites (${favorites.size})`}
      </button>
    </div>
  );
}

export default App;
