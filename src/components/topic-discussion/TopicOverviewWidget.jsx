import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { getMediaUrl } from '../../config/env.js';

export function TopicOverviewWidget({
  topicId = 'MENTAL_HEALTH',
  topicName = 'Mental Health',
  topicIcon = '🌱',
  badgeBg = '#DCFCE7',
  coverImage,
  description = 'A safe space to talk about emotions, anxiety, self-care and overall well-being.',
  discussionCount = '8.1K',
  memberCount = '124K',
  tags = ['Anxiety', 'Self-Care', 'Overthinking', 'Depression', 'Positive Thinking', 'Stress', 'Emotional Support'],
  onNavigate,
}) {
  const { addToast } = useToast();
  const [isJoined, setIsJoined] = useState(false);

  // Sync join state with localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mka_joined_topics');
      const list = raw ? JSON.parse(raw) : [];
      setIsJoined(list.includes(topicId) || list.includes(topicName));
    } catch {
      setIsJoined(false);
    }
  }, [topicId, topicName]);

  const handleToggleJoin = () => {
    try {
      const raw = localStorage.getItem('mka_joined_topics');
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];

      const identifier = topicId || topicName;
      if (isJoined) {
        list = list.filter((t) => t !== identifier && t !== topicName);
        localStorage.setItem('mka_joined_topics', JSON.stringify(list));
        setIsJoined(false);
        addToast(`Left ${topicName} topic.`, 'info');
      } else {
        if (!list.includes(identifier)) list.push(identifier);
        localStorage.setItem('mka_joined_topics', JSON.stringify(list));
        setIsJoined(true);
        addToast(`Joined ${topicName}! You'll receive updates for new discussions.`, 'success');
      }
    } catch {
      setIsJoined(!isJoined);
    }
  };

  const handleTagClick = (tag) => {
    if (onNavigate) {
      onNavigate(`/explore?q=${encodeURIComponent(tag)}`);
    } else {
      window.location.href = `/explore?q=${encodeURIComponent(tag)}`;
    }
  };

  return (
    <div className="topic-overview-widget-card" aria-label="Topic Overview">
      {/* Top Cover Image with Floating Icon Badge */}
      <div className="topic-overview-cover-wrap">
        <img
          src={getMediaUrl(coverImage)}
          alt={topicName}
          className="topic-overview-cover-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = 'none';
          }}
        />
        <div
          className="topic-overview-floating-badge"
          style={{ backgroundColor: badgeBg }}
          aria-hidden="true"
        >
          {topicIcon}
        </div>
      </div>

      {/* Widget Content Body */}
      <div className="topic-overview-content-body">
        <h3 className="topic-overview-title">{topicName}</h3>
        <p className="topic-overview-desc">{description}</p>

        {/* Stats Row: Discussions & Members */}
        <div className="topic-overview-stats-row">
          <div className="topic-stat-item">
            <MessageSquare size={16} className="stat-icon" />
            <div className="stat-text-col">
              <span className="stat-number">{discussionCount}</span>
              <span className="stat-label">Discussions</span>
            </div>
          </div>

          <div className="topic-stat-item">
            <Users size={16} className="stat-icon" />
            <div className="stat-text-col">
              <span className="stat-number">{memberCount}</span>
              <span className="stat-label">Members</span>
            </div>
          </div>
        </div>

        {/* Full-width Join Topic Button */}
        <button
          type="button"
          className={`topic-overview-join-btn ${isJoined ? 'joined' : ''}`}
          onClick={handleToggleJoin}
          aria-pressed={isJoined}
        >
          {isJoined ? (
            <>
              <Check size={15} className="btn-icon" />
              <span>Joined</span>
            </>
          ) : (
            'Join Topic'
          )}
        </button>

        {/* Tags Cloud */}
        {tags && tags.length > 0 && (
          <div className="topic-overview-tags-cloud">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="topic-tag-pill-btn"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
