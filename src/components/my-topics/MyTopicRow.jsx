import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Clock, ArrowRight, MoreHorizontal, ExternalLink, Copy, Share2 } from 'lucide-react';
import { getMediaUrl } from '../../config/env.js';

// Approved Category Covers
import imgMentalHealth from '../../assets/explore/mental-health-cover.jpg';
import imgPersonalGrowth from '../../assets/explore/friendship-cover.jpg';
import imgRelationships from '../../assets/explore/relationships-cover.jpg';
import imgFamily from '../../assets/explore/topic-family.jpg';
import imgLove from '../../assets/explore/topic-love.jpg';
import imgLifeWork from '../../assets/explore/topic-life-work.jpg';
import imgMeditation from '../../assets/explore/topic-meditation.jpg';
import imgMotivation from '../../assets/explore/motivation-cover.jpg';

export function resolveTopicCover(topic) {
  if (!topic) return imgMentalHealth;

  // 1. User-uploaded topic cover image from persistent store or direct property
  try {
    const rawCovers = localStorage.getItem('mka_topic_covers');
    if (rawCovers) {
      const covers = JSON.parse(rawCovers);
      const idKey = String(topic.id);
      const nameKey = String(topic.name || '').toLowerCase();
      const labelKey = String(topic.label || '').toLowerCase();
      const stored = covers[idKey] || covers[nameKey] || covers[labelKey];
      if (stored) return getMediaUrl(stored);
    }
  } catch {
    // safe ignore
  }

  if (topic.imageUrl) return getMediaUrl(topic.imageUrl);

  // 2. Default category artwork only when no uploaded cover exists
  const matchStr = `${topic.name || ''} ${topic.label || ''} ${topic.parentTopic || ''}`.toUpperCase();

  if (matchStr.includes('FAMILY') || matchStr.includes('PARENT')) return imgFamily;
  if (matchStr.includes('GROWTH') || matchStr.includes('HABIT')) return imgPersonalGrowth;
  if (matchStr.includes('RELATION') || matchStr.includes('DATING')) return imgRelationships;
  if (matchStr.includes('LOVE')) return imgLove;
  if (matchStr.includes('MEDITATION') || matchStr.includes('MINDFUL')) return imgMeditation;
  if (matchStr.includes('WORK') || matchStr.includes('CAREER') || matchStr.includes('JOB')) return imgLifeWork;
  if (matchStr.includes('MOTIVATION') || matchStr.includes('INSPIR')) return imgMotivation;
  if (matchStr.includes('MENTAL') || matchStr.includes('HEALTH')) return imgMentalHealth;

  return imgMentalHealth;
}

export function formatTopicTitle(topic) {
  const raw = topic?.label || topic?.name || 'Untitled Topic';
  if (raw.toUpperCase() === 'SPORTCAR') return 'Sport Car';
  if (raw === raw.toUpperCase() && raw.length > 2) {
    return raw
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return raw.replace(/_/g, ' ');
}

export function getCategoryLabel(topic) {
  const name = `${topic?.name || ''} ${topic?.label || ''}`.toUpperCase();
  const parent = (topic?.parentTopic || 'GENERAL').toUpperCase();

  if (name.includes('MENTAL') || name.includes('HEALTH')) return 'Mental Health';
  if (name.includes('GROWTH') || name.includes('HABIT')) return 'Personal Growth';
  if (name.includes('RELATION') || name.includes('LOVE')) return 'Relationships';
  if (name.includes('FAMILY') || parent === 'PARENTING') return 'Family';
  if (name.includes('WORK') || name.includes('CAREER') || parent === 'LIFE_WORK') return 'Life & Work';
  if (name.includes('MEDITATION') || name.includes('MINDFUL')) return 'Meditation';
  if (name.includes('MOTIVATION')) return 'Motivation';
  return 'General';
}

export function formatTimeAgo(dateString) {
  if (!dateString) return 'recently';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `Created ${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return 'Created 1 week ago';
    if (diffWeeks < 4) return `Created ${diffWeeks} weeks ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `Created ${diffMonths || 1} months ago`;
  } catch {
    return 'recently';
  }
}

export function MyTopicRow({ topic, onViewTopic, onCopyLink }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const title = formatTopicTitle(topic);
  const coverUrl = resolveTopicCover(topic);
  const categoryLabel = getCategoryLabel(topic);
  const timeAgo = formatTimeAgo(topic.createdAt);
  const discussionCount = topic.commentCount || topic.post_count || 0;

  // Real or canonical description
  const description =
    topic.description ||
    topic.initialComment ||
    `A safe space to discuss ${title.toLowerCase()}, personal experiences, and thoughts.`;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  return (
    <article className="my-topic-row-card">
      {/* Left: Thumbnail & Details */}
      <div 
        className="my-topic-row-left" 
        onClick={() => onViewTopic(topic.id)}
        style={{ cursor: 'pointer' }}
      >
        <div className="my-topic-row-thumb-wrap">
          <img
            src={coverUrl}
            alt={title}
            className="my-topic-row-thumb-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          <div className="my-topic-row-thumb-fallback" style={{ display: 'none' }}>
            🌱
          </div>
        </div>

        <div className="my-topic-row-details">
          <span className="my-topic-category-badge">
            {categoryLabel}
          </span>

          <h3 className="my-topic-row-title" title={title}>
            {title}
          </h3>

          <p className="my-topic-row-desc" title={description}>
            {description}
          </p>

          <div className="my-topic-row-meta">
            <span className="my-topic-meta-stat">
              <MessageSquare size={14} strokeWidth={2} />
              <span>{discussionCount} Discussions</span>
            </span>
            <span className="my-topic-meta-stat">
              <Clock size={14} strokeWidth={2} />
              <span>{timeAgo}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="my-topic-row-actions">
        <button
          type="button"
          className="my-topic-view-topic-btn"
          onClick={() => onViewTopic(topic.id)}
        >
          <span>View Topic</span>
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>

        <div className="my-topic-dots-btn-wrap" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="my-topic-dots-btn"
            aria-label="More topic options"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal size={18} strokeWidth={2} />
          </button>

          {menuOpen && (
            <div className="my-topic-actions-dropdown">
              <button
                type="button"
                className="my-topic-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  onViewTopic(topic.id);
                }}
              >
                <ExternalLink size={14} />
                <span>Open Community</span>
              </button>
              <button
                type="button"
                className="my-topic-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  onCopyLink?.(topic);
                }}
              >
                <Copy size={14} />
                <span>Copy Topic Link</span>
              </button>
              <button
                type="button"
                className="my-topic-dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  if (navigator.share) {
                    navigator.share({
                      title,
                      url: window.location.origin + `/topic/${topic.id}`,
                    }).catch(() => {});
                  } else {
                    onCopyLink?.(topic);
                  }
                }}
              >
                <Share2 size={14} />
                <span>Share Topic</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
