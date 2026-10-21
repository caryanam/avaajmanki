import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Heart, Clock, ArrowRight, MoreHorizontal, Share2, Copy, ExternalLink 
} from 'lucide-react';
import { getMediaUrl } from '../../config/env.js';

// Stock explore covers
import imgMentalHealth from '../../assets/explore/mental-health-cover.jpg';
import imgPersonalGrowth from '../../assets/explore/friendship-cover.jpg';
import imgLove from '../../assets/explore/topic-love.jpg';
import imgMeditation from '../../assets/explore/topic-meditation.jpg';
import imgLifeWork from '../../assets/explore/topic-life-work.jpg';
import imgMotivation from '../../assets/explore/motivation-cover.jpg';
import imgEducation from '../../assets/explore/education-cover.jpg';
import imgFamily from '../../assets/explore/topic-family.jpg';

export function resolveTopicCover(topic) {
  if (!topic) return imgMentalHealth;

  // 1. Check local storage uploaded covers
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
    // Ignore local storage error
  }

  // 2. Direct imageUrl property if present
  if (topic.imageUrl) return getMediaUrl(topic.imageUrl);

  // 3. Fallback to thematic keyword mapping
  const matchStr = `${topic.name || ''} ${topic.label || ''} ${topic.parentTopic || ''}`.toUpperCase();

  if (matchStr.includes('MEDITATION') || matchStr.includes('MINDFUL')) return imgMeditation;
  if (matchStr.includes('MENTAL') || matchStr.includes('HEALTH')) return imgMentalHealth;
  if (matchStr.includes('GROWTH') || matchStr.includes('HABIT')) return imgPersonalGrowth;
  if (matchStr.includes('LOVE') || matchStr.includes('RELATIONSHIP')) return imgLove;
  if (matchStr.includes('WORK') || matchStr.includes('CAREER') || matchStr.includes('JOB')) return imgLifeWork;
  if (matchStr.includes('MOTIVATION') || matchStr.includes('INSPIR')) return imgMotivation;
  if (matchStr.includes('EDUCATION') || matchStr.includes('LEARN')) return imgEducation;
  if (matchStr.includes('FAMILY') || matchStr.includes('PARENT')) return imgFamily;

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

export function getCategoryBadge(topic) {
  const parent = (topic?.parentTopic || 'GENERAL').toUpperCase();
  const name = `${topic?.name || ''} ${topic?.label || ''}`.toUpperCase();

  if (name.includes('MENTAL') || name.includes('HEALTH')) {
    return { label: 'Mental Health', bg: '#DCFCE7', color: '#15803D', emoji: '🌱' };
  }
  if (name.includes('GROWTH') || name.includes('HABIT')) {
    return { label: 'Personal Growth', bg: '#FFE4E6', color: '#BE123C', emoji: '📈' };
  }
  if (name.includes('LOVE') || name.includes('RELATION')) {
    return { label: 'Love', bg: '#FFE4E6', color: '#BE123C', emoji: '❤️' };
  }
  if (name.includes('MEDITATION') || name.includes('MINDFUL')) {
    return { label: 'Feelings', bg: '#F3E8FF', color: '#7E22CE', emoji: '🧘' };
  }
  if (name.includes('WORK') || name.includes('CAREER') || parent === 'LIFE_WORK') {
    return { label: 'Life & Work', bg: '#E0F2FE', color: '#0369A1', emoji: '💼' };
  }
  if (name.includes('MOTIVATION') || parent === 'EXPRESSION') {
    return { label: 'Motivation', bg: '#FEF3C7', color: '#B45309', emoji: '🏆' };
  }
  if (parent === 'EDUCATION') {
    return { label: 'Education', bg: '#E0F2FE', color: '#0369A1', emoji: '🎓' };
  }
  return { label: 'Community', bg: '#F1F5F9', color: '#475569', emoji: '💡' };
}

export function formatTimeAgo(dateString) {
  if (!dateString) return 'recently';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return 'recently';
  } catch {
    return 'recently';
  }
}

export function MyTopicItemCard({ topic, onViewTopic, onCopyLink }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const title = formatTopicTitle(topic);
  const coverUrl = resolveTopicCover(topic);
  const category = getCategoryBadge(topic);
  const timeAgo = formatTimeAgo(topic.createdAt);
  const discussionCount = topic.commentCount || topic.post_count || 12;
  const likesCount = Math.max(topic.likeCount || 0, Math.floor(discussionCount * 2.2));

  // Description fallback
  const description =
    topic.description ||
    topic.initialComment ||
    `A safe space for discussions on ${title.toLowerCase()} and real personal experiences.`;

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

  const handleCardClick = () => {
    onViewTopic(topic.id || topic.name);
  };

  return (
    <article className="my-topic-item-card">
      {/* Left: Thumbnail & Details */}
      <div className="my-topic-card-left" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className="my-topic-thumbnail-wrap">
          <img
            src={coverUrl}
            alt={title}
            className="my-topic-thumbnail-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          <div className="my-topic-thumbnail-fallback" style={{ display: 'none' }}>
            {category.emoji}
          </div>
        </div>

        <div className="my-topic-content-body">
          <span
            className="my-topic-tag-pill"
            style={{ background: category.bg, color: category.color }}
          >
            <span>{category.emoji}</span>
            <span>{category.label}</span>
          </span>

          <h3 className="my-topic-card-title" title={title}>
            {title}
          </h3>

          <p className="my-topic-card-desc">
            {description}
          </p>

          <div className="my-topic-meta-row">
            <span className="my-topic-meta-item">
              <MessageSquare size={13} strokeWidth={2} />
              <span>{discussionCount} Discussions</span>
            </span>
            <span className="my-topic-meta-item">
              <Heart size={13} strokeWidth={2} />
              <span>{likesCount} Likes</span>
            </span>
            <span className="my-topic-meta-item">
              <Clock size={13} strokeWidth={2} />
              <span>Created {timeAgo}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="my-topic-card-right">
        <button
          type="button"
          className="my-topic-view-btn"
          onClick={() => onViewTopic(topic.id || topic.name)}
        >
          <span>View Topic</span>
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>

        <div className="my-topic-menu-btn" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="my-topic-menu-btn"
            aria-label="Topic options"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal size={18} strokeWidth={2} />
          </button>

          {menuOpen && (
            <div className="my-topic-menu-dropdown">
              <button
                type="button"
                className="my-topic-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  onViewTopic(topic.id || topic.name);
                }}
              >
                <ExternalLink size={14} />
                <span>Open Community</span>
              </button>
              <button
                type="button"
                className="my-topic-menu-item"
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
                className="my-topic-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  if (navigator.share) {
                    navigator.share({
                      title,
                      url: window.location.origin + `/topic/${topic.id || topic.name}`,
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
