import React, { useState, useEffect } from 'react';
import { Bookmark, MessageSquare } from 'lucide-react';
import postImageFallback from '../../assets/home/post-image-fallback.jpg';
import { getMediaUrl } from '../../config/env.js';
import { isPulseArticleSaved, toggleSavePulseArticle, subscribeToPulseBookmarks } from '../../utils/pulseBookmarkStorage.js';
import { useToast } from '../../context/ToastContext.jsx';

function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function getPublisherBadge(sourceName = '') {
  const clean = sourceName.toUpperCase().trim();
  if (clean.includes('TIMES OF INDIA') || clean.includes('TOI')) return 'TOI';
  if (clean.includes('ESPN')) return 'ESPN';
  if (clean.includes('NDTV')) return 'NDTV';
  if (clean.includes('THE HINDU')) return 'TH';
  if (clean.includes('BUSINESS STANDARD')) return 'BS';
  if (clean.includes('BBC')) return 'BBC';
  if (clean.includes('REUTERS')) return 'RTR';
  if (clean.includes('PTI')) return 'PTI';
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 3) || 'NEWS';
}

function getCategoryColorStyle(topic = '') {
  const t = topic.toUpperCase();
  if (t.includes('TECH')) {
    return { background: '#EDE9FE', color: '#6D28D9' };
  }
  if (t.includes('SPORT') || t.includes('CRICKET')) {
    return { background: '#DCFCE7', color: '#15803D' };
  }
  if (t.includes('ENTERTAIN') || t.includes('MOVIE') || t.includes('CINEMA')) {
    return { background: '#FCE7F3', color: '#BE185D' };
  }
  if (t.includes('BUSI') || t.includes('ECONOM')) {
    return { background: '#FEF3C7', color: '#B45309' };
  }
  return { background: '#FEE2E2', color: '#B91C1C' }; // General News
}

export function PulseArticleCard({ article, onNavigate }) {
  const { addToast } = useToast() || {};
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(() => isPulseArticleSaved(article?.id));

  useEffect(() => {
    setIsSaved(isPulseArticleSaved(article?.id));
    const unsubscribe = subscribeToPulseBookmarks(({ id, saved }) => {
      if (String(id) === String(article?.id)) {
        setIsSaved(saved);
      }
    });
    return unsubscribe;
  }, [article?.id]);

  if (!article) return null;

  const articleId = article.id;
  const rawImage = article.imageUrl || article.featuredImageUrl;
  const resolvedImage = rawImage ? getMediaUrl(rawImage) : null;
  const imageSrc = (!imageError && resolvedImage) ? resolvedImage : postImageFallback;

  const rawTopic = article.topic || 'GENERAL_NEWS';
  const categoryLabel = rawTopic
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const categoryStyle = getCategoryColorStyle(rawTopic);

  const publisherName = article.sourceName || 'Editorial Wire';
  const publisherInitial = getPublisherBadge(publisherName);
  const timeAgoText = formatTimeAgo(article.publishedAt);

  const discussionsTotal = (Number(article.commentCount || 0)) + (Number(article.takeCount || 0));
  const discussionsText = discussionsTotal >= 1000
    ? `${(discussionsTotal / 1000).toFixed(1).replace(/\.0$/, '')}K`
    : `${discussionsTotal}`;

  const handleCardClick = () => {
    if (onNavigate && articleId) {
      onNavigate(`/pulse/${articleId}`);
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    const newSaved = toggleSavePulseArticle(articleId);
    setIsSaved(newSaved);
    if (addToast) {
      addToast(
        newSaved ? 'Article bookmarked in this browser' : 'Bookmark removed',
        'info'
      );
    }
  };

  return (
    <article
      className="pulse-news-card"
      onClick={handleCardClick}
      role="article"
      aria-label={article.title}
    >
      {/* 16:9 Thumbnail Image with Bookmark Control */}
      <div className="pulse-card-media-wrap">
        <img
          src={imageSrc}
          alt={article.title || 'News article thumbnail'}
          className="pulse-card-img"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        <button
          type="button"
          className={`pulse-card-bookmark-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleBookmarkClick}
          title={isSaved ? 'Saved locally (click to remove)' : 'Save article locally in browser'}
          aria-label={isSaved ? 'Remove bookmark' : 'Bookmark article locally'}
        >
          <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card Content */}
      <div className="pulse-card-body">
        {/* Category Badge */}
        <div className="pulse-card-cat-wrap">
          <span className="pulse-card-cat-badge" style={categoryStyle}>
            {categoryLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="pulse-card-title" title={article.title}>
          {article.title}
        </h3>

        {/* Short Summary */}
        <p className="pulse-card-summary">
          {article.summary || article.content}
        </p>

        {/* Bottom Metadata Row */}
        <div className="pulse-card-footer">
          <div className="pulse-card-publisher-group" title={publisherName}>
            <span className="pulse-card-pub-badge">{publisherInitial}</span>
            <span className="pulse-card-pub-name">{publisherName}</span>
            <span className="pulse-card-dot">•</span>
            <span className="pulse-card-time">{timeAgoText}</span>
          </div>

          <div
            className="pulse-card-discussion-count"
            title={`${discussionsTotal} total community discussions`}
          >
            <MessageSquare size={13} className="pulse-card-msg-icon" />
            <span>{discussionsText}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
