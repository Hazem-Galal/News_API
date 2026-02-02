import { useState, useEffect } from 'react';
import { NewsArticle, Category, CATEGORIES, fetchNews } from '../lib/newsapi';

interface HeadlinesListProps {
  favorites: Set<string>;
  onToggleFavorite: (uuid: string) => void;
  showFavorites: boolean;
  favoriteArticles: NewsArticle[];
}

interface PageCache {
  [key: string]: NewsArticle[];
}

export default function HeadlinesList({
  favorites,
  onToggleFavorite,
  showFavorites,
  favoriteArticles
}: HeadlinesListProps) {
  const [category, setCategory] = useState<Category>('tech');
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [cache, setCache] = useState<PageCache>({});
  const [prefetchedPages, setPrefetchedPages] = useState<Set<number>>(new Set());

  const getCacheKey = (pg: number, cat: Category, srch: string) => {
    return srch ? `search:${srch}:${pg}` : `cat:${cat}:${pg}`;
  };

  const loadNews = async (pg: number, cat: Category, srch: string, useCache = true) => {
    const cacheKey = getCacheKey(pg, cat, srch);
    
    if (useCache && cache[cacheKey]) {
      console.log(`[CACHE] Using cached data for ${cacheKey}`);
      setArticles(cache[cacheKey]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetchNews(pg, cat, srch);
      
      if (response.data.length === 0) {
        setArticles([]);
        setError('No articles found');
      } else {
        setArticles(response.data);
        setCache(prev => ({ ...prev, [cacheKey]: response.data }));
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
      setArticles([]);
      setLoading(false);
    }
  };

  // Prefetch pages
  const prefetchPage = async (pg: number, cat: Category, srch: string) => {
    const cacheKey = getCacheKey(pg, cat, srch);
    if (cache[cacheKey] || prefetchedPages.has(pg)) return;

    try {
      console.log(`[PREFETCH] Fetching page ${pg}`);
      const response = await fetchNews(pg, cat, srch);
      if (response.data.length > 0) {
        setCache(prev => ({ ...prev, [cacheKey]: response.data }));
        setPrefetchedPages(prev => new Set([...prev, pg]));
      }
    } catch (err) {
      console.error('[PREFETCH] Failed:', err);
    }
  };

  // Load initial data or when filters change
  useEffect(() => {
    if (showFavorites) return;
    
    setLoading(true);
    setArticles([]);
    setCurrentIndex(0);
    setPage(1);
    setCache({});
    setPrefetchedPages(new Set());
    loadNews(1, category, search, false);
  }, [category, search, showFavorites]);

  // Prefetch based on current index
  useEffect(() => {
    if (showFavorites || loading || articles.length === 0) return;

    // Prefetch next page when on 2nd article (index 1)
    if (currentIndex === 1) {
      prefetchPage(page + 1, category, search);
    }

    // Prefetch previous page when on 1st article and page > 1
    if (currentIndex === 0 && page > 1) {
      prefetchPage(page - 1, category, search);
    }
  }, [currentIndex, page, category, search, showFavorites, loading]);

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    setSearch('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const goToFirstPage = () => {
    setPage(1);
    setCurrentIndex(0);
    setLoading(true);
    loadNews(1, category, search);
  };

  const goToPrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      setCurrentIndex(0);
      setLoading(true);
      loadNews(newPage, category, search);
    }
  };

  const goToNextPage = () => {
    const newPage = page + 1;
    setPage(newPage);
    setCurrentIndex(0);
    setLoading(true);
    loadNews(newPage, category, search);
  };

  const goToPrevArticle = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (page > 1) {
      goToPrevPage();
      // Will be set to 0 by goToPrevPage
    }
  };

  const goToNextArticle = () => {
    if (currentIndex < articles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      goToNextPage();
    }
  };

  const displayArticles = showFavorites ? favoriteArticles : articles;
  const currentArticle = displayArticles[currentIndex];
  const absoluteIndex = (page - 1) * 3 + currentIndex + 1;

  return (
    <div className="headlines-container">
      {/* Sidebar */}
      <aside className={`sidebar ${showFilters ? 'mobile-visible' : ''}`}>
        <div className="sidebar-content">
          <h1 className="logo">News Reader</h1>
          
          {!showFavorites && (
            <>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={search}
                  onChange={handleSearchChange}
                  className="search-input"
                  aria-label="Search news"
                />
              </div>

              <div className="categories">
                <h2 className="section-title">Categories</h2>
                <ul className="category-list">
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button
                        onClick={() => handleCategoryChange(cat)}
                        className={`category-btn ${category === cat && !search ? 'active' : ''}`}
                        aria-pressed={category === cat && !search}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {showFavorites && (
            <div className="favorites-header">
              <h2 className="section-title">Your Favorites</h2>
              <p className="favorites-count">{favoriteArticles.length} saved</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Filter Toggle */}
      <button 
        className="mobile-filter-toggle"
        onClick={() => setShowFilters(!showFilters)}
        aria-label={showFilters ? 'Hide filters' : 'Show filters'}
      >
        {showFilters ? '✕ Hide Filters' : '☰ Show Filters'}
      </button>

      {/* Main Content */}
      <main className="content">
        {loading && !showFavorites ? (
          <div className="loading-skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-text">
              <div className="skeleton-line long"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ) : error ? (
          <div className="error-state">
            <h2>⚠️ {error}</h2>
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="empty-state">
            <h2>
              {showFavorites 
                ? '📚 No favorites yet' 
                : '📰 No articles found'}
            </h2>
            <p>
              {showFavorites
                ? 'Start saving articles to read them later'
                : 'Try a different search or category'}
            </p>
          </div>
        ) : currentArticle ? (
          <article className="featured-card">
            <div 
              className="card-image"
              style={{
                backgroundImage: `url(${currentArticle.image_url || '/placeholder.png'})`
              }}
              role="img"
              aria-label={currentArticle.title}
            >
              <div className="card-overlay">
                <div className="card-content">
                  <h2 className="card-title">{currentArticle.title}</h2>
                  <p className="card-description">
                    {currentArticle.description || currentArticle.snippet}
                  </p>
                  <div className="card-meta">
                    <span className="card-source">{currentArticle.source}</span>
                    <span className="card-date">
                      {new Date(currentArticle.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="card-actions">
                    <a
                      href={currentArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      View Full Article →
                    </a>
                    <button
                      onClick={() => onToggleFavorite(currentArticle.uuid)}
                      className={`btn-favorite ${favorites.has(currentArticle.uuid) ? 'saved' : ''}`}
                      aria-label={favorites.has(currentArticle.uuid) ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      {favorites.has(currentArticle.uuid) ? '★' : '☆'} 
                      {favorites.has(currentArticle.uuid) ? ' Saved' : ' Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination */}
            {!showFavorites && (
              <div className="pagination">
                <button
                  onClick={goToFirstPage}
                  disabled={page === 1}
                  className="page-btn"
                  aria-label="First page"
                >
                  «
                </button>
                <button
                  onClick={goToPrevArticle}
                  disabled={page === 1 && currentIndex === 0}
                  className="page-btn"
                  aria-label="Previous article"
                >
                  ‹
                </button>
                <span className="page-dots">
                  {absoluteIndex - 1 > 0 && <span className="dot">•</span>}
                  <span className="current-page">{absoluteIndex}</span>
                  <span className="dot">•</span>
                  <span className="dot">•</span>
                </span>
                <button
                  onClick={goToNextArticle}
                  className="page-btn"
                  aria-label="Next article"
                >
                  ›
                </button>
              </div>
            )}

            {showFavorites && displayArticles.length > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="page-btn"
                  aria-label="Previous favorite"
                >
                  ‹
                </button>
                <span className="page-dots">
                  <span className="current-page">{currentIndex + 1} / {displayArticles.length}</span>
                </span>
                <button
                  onClick={() => setCurrentIndex(Math.min(displayArticles.length - 1, currentIndex + 1))}
                  disabled={currentIndex === displayArticles.length - 1}
                  className="page-btn"
                  aria-label="Next favorite"
                >
                  ›
                </button>
              </div>
            )}
          </article>
        ) : null}
      </main>
    </div>
  );
}
