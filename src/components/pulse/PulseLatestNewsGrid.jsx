import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { PulseArticleCard } from './PulseArticleCard.jsx';
import { PulseCardSkeleton } from './PulseCardSkeleton.jsx';

export function PulseLatestNewsGrid({
  articles = [],
  isLoading = false,
  page = 0,
  totalPages = 1,
  onPageChange,
  onNavigate,
}) {
  const [activeSort, setActiveSort] = useState('LATEST'); // 'LATEST' | 'MOST_DISCUSSED' | 'MOST_LIKED'
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Client-side ranking over the currently loaded article pool
  const sortedArticles = useMemo(() => {
    if (!Array.isArray(articles)) return [];
    const list = [...articles];

    if (activeSort === 'MOST_DISCUSSED') {
      return list.sort((a, b) => {
        const discA = (Number(a.commentCount || 0)) + (Number(a.takeCount || 0));
        const discB = (Number(b.commentCount || 0)) + (Number(b.takeCount || 0));
        return discB - discA;
      });
    }

    if (activeSort === 'MOST_LIKED') {
      return list.sort((a, b) => {
        const likeA = Number(a.likeCount || 0);
        const likeB = Number(b.likeCount || 0);
        return likeB - likeA;
      });
    }

    // Default: Chronological order (Latest)
    return list.sort((a, b) => {
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [articles, activeSort]);

  return (
    <section className="pulse-latest-section" aria-label="Latest Stories">
      {/* Section Header & Sort Controls */}
      <div className="pulse-latest-header">
        <div className="pulse-latest-title-wrap">
          <h2 className="pulse-latest-title">Latest Stories</h2>
          {activeSort !== 'LATEST' && (
            <span className="pulse-sort-scope-caption">
              (Ranked among latest published stories)
            </span>
          )}
        </div>

        <div className="pulse-sort-group">
          <button
            type="button"
            className={`pulse-sort-pill ${activeSort === 'LATEST' ? 'active' : ''}`}
            onClick={() => setActiveSort('LATEST')}
          >
            Latest
          </button>
          <button
            type="button"
            className={`pulse-sort-pill ${activeSort === 'MOST_DISCUSSED' ? 'active' : ''}`}
            onClick={() => setActiveSort('MOST_DISCUSSED')}
          >
            Most Discussed
          </button>
          <button
            type="button"
            className={`pulse-sort-pill ${activeSort === 'MOST_LIKED' ? 'active' : ''}`}
            onClick={() => setActiveSort('MOST_LIKED')}
          >
            Most Liked
          </button>
          <button
            type="button"
            className={`pulse-sort-pill pulse-filter-btn ${filterDrawerOpen ? 'active' : ''}`}
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            title="Filter by publisher or freshness"
          >
            <SlidersHorizontal size={13} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Info Bar when active */}
      {filterDrawerOpen && (
        <div className="pulse-filter-drawer">
          <span className="pulse-filter-drawer-text">
            Displaying {sortedArticles.length} verified news stories. Use category tabs above to narrow by editorial beat.
          </span>
        </div>
      )}

      {/* Grid of News Cards */}
      {isLoading ? (
        <div className="pulse-cards-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} style={{ height: '340px' }}>
              <PulseCardSkeleton />
            </div>
          ))}
        </div>
      ) : sortedArticles.length === 0 ? (
        <div className="pulse-empty-state">
          <Inbox size={42} className="pulse-empty-icon" />
          <h3 className="pulse-empty-title">No news articles found</h3>
          <p className="pulse-empty-desc">
            No published stories are available under this category right now. Check back soon or switch categories.
          </p>
        </div>
      ) : (
        <div className="pulse-cards-grid">
          {sortedArticles.map((article) => (
            <PulseArticleCard
              key={article.id}
              article={article}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pulse-pagination-bar">
          <button
            type="button"
            className="pulse-pagination-btn"
            disabled={page === 0}
            onClick={() => onPageChange && onPageChange(page - 1)}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="pulse-pagination-info">
            Page {page + 1} of {totalPages}
          </span>

          <button
            type="button"
            className="pulse-pagination-btn"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange && onPageChange(page + 1)}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
