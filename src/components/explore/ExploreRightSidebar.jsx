import React from 'react';
import { 
  Flame, Sparkles, ShieldCheck, ChevronRight, ArrowRight
} from 'lucide-react';
import { getMediaUrl } from '../../config/env.js';

export function ExploreRightSidebar({
  trendingTopics = [],
  suggestedTopics = [],
  onSelectTopic,
  onNavigate,
}) {
  const formatCount = (c) => {
    if (typeof c === 'number') {
      return c >= 1000 ? (c / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : c;
    }
    return c || '0';
  };

  return (
    <aside className="explore-right-sidebar" aria-label="Explore Recommendations">
      {/* 1. Trending Topics Widget */}
      <div className="explore-widget-card">
        <div className="explore-widget-header">
          <h3 className="explore-widget-title">
            <Flame size={16} color="#E11D48" />
            <span>Trending Topics</span>
          </h3>
          <button
            type="button"
            className="explore-widget-viewall-btn"
            onClick={() => onNavigate ? onNavigate('/topics?sort=trending') : (window.location.href = '/topics?sort=trending')}
          >
            <span>View all</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <div className="explore-trending-list">
          {trendingTopics.slice(0, 5).map((t, idx) => (
            <div
              key={t.uniqueKey || (t.isCustom ? `custom-${t.id}` : `canonical-${t.id || t.name}`)}
              className="explore-trending-item"
              onClick={() => onSelectTopic ? onSelectTopic(t.id || t.name) : onNavigate(`/explore?topic=${t.id || t.name}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTopic ? onSelectTopic(t.id || t.name) : onNavigate(`/explore?topic=${t.id || t.name}`);
                }
              }}
            >
              <div className="explore-trending-left">
                <span className="explore-trending-rank">{idx + 1}</span>
                <div
                  className="explore-trending-badge"
                  style={{ backgroundColor: t.badgeBg || '#FFE4E6' }}
                  aria-hidden="true"
                >
                  {t.icon || '❤️'}
                </div>
                <div className="explore-trending-info">
                  <h4 className="explore-trending-name">{t.name}</h4>
                  <p className="explore-trending-count">
                    {formatCount(t.count)} discussions
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="explore-trending-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Suggested for You Widget */}
      <div className="explore-widget-card">
        <div className="explore-widget-header">
          <h3 className="explore-widget-title">
            <Sparkles size={16} color="#E11D48" />
            <span>Suggested for You</span>
          </h3>
          <button
            type="button"
            className="explore-widget-viewall-btn"
            onClick={() => onNavigate ? onNavigate('/topics?sort=suggested') : (window.location.href = '/topics?sort=suggested')}
          >
            <span>View all</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <div className="explore-suggested-list">
          {suggestedTopics.slice(0, 6).map((s) => (
            <div
              key={s.uniqueKey || (s.isCustom ? `custom-${s.id}` : `canonical-${s.id || s.name}`)}
              className="explore-suggested-item"
              onClick={() => onSelectTopic ? onSelectTopic(s.id || s.name) : onNavigate(`/explore?topic=${s.id || s.name}`)}
              role="button"
              tabIndex={0}
            >
              <div className="explore-suggested-left">
                {s.image ? (
                  <img
                    src={getMediaUrl(s.image)}
                    alt={s.name}
                    className="explore-suggested-thumb"
                    loading="lazy"
                    onError={(e) => {
                      if (s.fallbackImage && e.currentTarget.src !== s.fallbackImage) {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = s.fallbackImage;
                      }
                    }}
                  />
                ) : (
                  <div className="explore-suggested-icon" aria-hidden="true">
                    {s.icon || '💬'}
                  </div>
                )}
                <div className="explore-suggested-info">
                  <h4 className="explore-suggested-name">{s.name}</h4>
                  <p className="explore-suggested-count">{formatCount(s.count)} discussions</p>
                </div>
              </div>
              <button
                type="button"
                className="suggested-arrow-btn"
                aria-label={`Explore ${s.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTopic ? onSelectTopic(s.id || s.name) : onNavigate(`/explore?topic=${s.id || s.name}`);
                }}
              >
                <ArrowRight size={12} strokeWidth={2.4} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Community Guidelines Widget */}
      <div className="explore-widget-card guidelines-widget">
        <div className="guidelines-header-row">
          <div className="guidelines-icon-box">
            <ShieldCheck size={18} color="#0284C7" />
          </div>
          <h3 className="guidelines-title">Community Guidelines</h3>
        </div>

        <p className="guidelines-description">
          Help us keep AwaajManKi safe and positive for everyone.
        </p>

        <a
          href="/community-guidelines"
          className="guidelines-read-link"
          onClick={(e) => {
            e.preventDefault();
            onNavigate ? onNavigate('/community-guidelines') : (window.location.href = '/community-guidelines');
          }}
        >
          <span>Read Guidelines</span>
          <ArrowRight size={13} strokeWidth={2.4} />
        </a>
      </div>
    </aside>
  );
}
