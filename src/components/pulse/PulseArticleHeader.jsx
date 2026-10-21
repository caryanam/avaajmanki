import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Share2, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { 
  isPulseArticleSaved, 
  toggleSavePulseArticle, 
  subscribeToPulseBookmarks 
} from '../../utils/pulseBookmarkStorage.js';
import { useToast } from '../../context/ToastContext.jsx';

function formatTopicName(topic) {
  if (!topic) return 'General News';
  const clean = String(topic).replace(/_/g, ' ').toLowerCase();
  return clean
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function calculateReadTime(text) {
  if (!text) return '3 min read';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}

function getPublisherBadge(sourceName) {
  if (!sourceName) return 'NP';
  const clean = sourceName.replace(/The\s+/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 3).toUpperCase();
}

export function PulseArticleHeader({ 
  article, 
  commentCount = 0, 
  onNavigate, 
  onJoinDiscussion 
}) {
  const { addToast } = useToast();
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

  const topicLabel = formatTopicName(article.topic);
  const totalDiscussions = Math.max(
    Number(commentCount) || 0,
    Number(article.commentCount) || 0,
    (Number(article.takeCount) || 0) + (Number(article.commentCount) || 0)
  );

  const fullContentForReadTime = `${article.title || ''} ${article.summary || ''} ${article.content || ''}`;
  const readTimeStr = calculateReadTime(fullContentForReadTime);

  const handleToggleBookmark = () => {
    const newState = toggleSavePulseArticle(article.id);
    setIsSaved(newState);
    addToast(
      newState ? 'Story saved to bookmarks' : 'Story removed from bookmarks',
      'success'
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title || 'Awaaj Pulse Story',
          text: article.summary || '',
          url,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        addToast('Story link copied to clipboard!', 'success');
      } catch {
        addToast('Could not copy link to clipboard', 'error');
      }
    }
  };

  const publisherName = article.sourceName || 'The Times of India';
  const publisherInitials = getPublisherBadge(publisherName);

  return (
    <div className="pulse-article-header-card">
      {/* 1. Breadcrumbs */}
      <nav className="pulse-article-breadcrumbs" aria-label="Breadcrumb">
        <button
          type="button"
          className="pulse-breadcrumb-link"
          onClick={() => onNavigate('/pulse')}
        >
          Pulse News
        </button>
        <ChevronRight size={14} className="pulse-breadcrumb-sep" />
        <span className="pulse-breadcrumb-current">{topicLabel}</span>
      </nav>

      {/* 2. Category Badge */}
      <div className="pulse-article-category-row">
        <span className="pulse-article-category-badge">
          {topicLabel}
        </span>
      </div>

      {/* 3. Headline */}
      <h1 className="pulse-article-headline">
        {article.title}
      </h1>

      {/* 4. Subhead / Summary */}
      {article.summary && (
        <p className="pulse-article-summary">
          {article.summary}
        </p>
      )}

      {/* 5. Publisher & Action Bar */}
      <div className="pulse-article-meta-bar">
        {/* Left: Publisher Info */}
        <div className="pulse-article-publisher-info">
          <div className="pulse-publisher-avatar" aria-hidden="true">
            {publisherInitials}
          </div>
          <div className="pulse-publisher-details">
            <div className="pulse-publisher-name-row">
              <span className="pulse-publisher-name">{publisherName}</span>
              <CheckCircle2 size={15} className="pulse-publisher-verified" />
            </div>
            <div className="pulse-publisher-meta-row">
              <span>Published {formatDate(article.publishedAt || article.createdAt)}</span>
              <span className="pulse-meta-dot">•</span>
              <span>{readTimeStr}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="pulse-article-actions">
          {/* Bookmark Button */}
          <button
            type="button"
            className={`pulse-action-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleToggleBookmark}
            title={isSaved ? 'Saved locally' : 'Save story'}
          >
            <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            className="pulse-action-btn"
            onClick={handleShare}
            title="Share story"
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>

          {/* Discussions Counter */}
          <button
            type="button"
            className="pulse-action-btn pulse-action-discussions-btn"
            onClick={onJoinDiscussion}
            title="Discussions"
          >
            <MessageSquare size={15} />
            <span>{totalDiscussions}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
