import React from 'react';
import { PulseArticleCard } from './PulseArticleCard.jsx';

export function PulseSecondaryCards({ articles = [], onNavigate }) {
  if (!Array.isArray(articles) || articles.length === 0) return null;

  // Render exactly the first two articles passed to this section
  const displayArticles = articles.slice(0, 2);

  return (
    <section className="pulse-secondary-section" aria-label="Secondary Featured News">
      <div className="pulse-secondary-grid">
        {displayArticles.map((article) => (
          <PulseArticleCard
            key={article.id}
            article={article}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}
