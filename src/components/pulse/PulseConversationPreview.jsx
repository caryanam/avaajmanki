import React, { useState } from 'react';
import { MessageSquareText, ArrowRight, Heart, CornerDownRight, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiPulseService } from '../../services/apiPulseService.js';

const avatarColors = [
  { bg: '#F3E8FF', text: '#9333EA' },
  { bg: '#FCE7F3', text: '#BE185D' },
  { bg: '#E0F2FE', text: '#0284C7' },
];

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

export function PulseConversationPreview({ featuredStoryId, featuredStory, onNavigate }) {
  // Query real comments from the active featured Pulse story
  const { data: commentsResponse } = useQuery({
    queryKey: ['pulse-conversation-preview', featuredStoryId],
    queryFn: async () => {
      if (!featuredStoryId) return [];
      try {
        const res = await apiPulseService.getPulseComments(featuredStoryId, { size: 10 });
        const list = res.content || res.data || res || [];
        return Array.isArray(list) ? list : [];
      } catch (e) {
        console.warn('Could not fetch comments for conversation preview:', e);
        return [];
      }
    },
    enabled: Boolean(featuredStoryId),
    staleTime: 30000,
  });

  const rawComments = Array.isArray(commentsResponse) ? commentsResponse : [];

  // Map only authentic API comments - strictly never fabricate dummy perspectives
  const displayTakes = rawComments.slice(0, 3).map((c, idx) => ({
    id: c.id || `c_${idx}`,
    author: 'Anonymous',
    timeAgo: formatTimeAgo(c.createdAt),
    content: c.originalContent || c.translatedContent || c.content || '',
    likes: Number(c.likeCount || 0),
  }));

  const [localLikes, setLocalLikes] = useState({});

  const handleLike = (e, takeId, initialLikes) => {
    e.stopPropagation();
    setLocalLikes((prev) => {
      const current = prev[takeId] !== undefined ? prev[takeId] : initialLikes;
      const isLiked = prev[`${takeId}_liked`];
      return {
        ...prev,
        [takeId]: isLiked ? current - 1 : current + 1,
        [`${takeId}_liked`]: !isLiked,
      };
    });
  };

  const handleOpenDiscussion = () => {
    if (onNavigate && featuredStoryId) {
      onNavigate(`/pulse/${featuredStoryId}`);
    } else if (onNavigate) {
      onNavigate('/pulse');
    }
  };

  const storyHeadline = featuredStory?.title || '';

  return (
    <section className="pulse-conversation-section" aria-label="Community Discussions">
      {/* Section Header */}
      <div className="pulse-conversation-header">
        <div className="pulse-conversation-title-wrap">
          <div className="pulse-conversation-icon-box">
            <MessageSquareText size={18} className="pulse-conversation-icon" />
          </div>
          <div className="pulse-conversation-heading-group">
            <h2 className="pulse-conversation-title">The Conversation</h2>
            <span className="pulse-conversation-subtitle">
              {storyHeadline ? `Perspectives on: ${storyHeadline}` : 'Real people. Real perspectives. Anonymously.'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="pulse-conversation-view-all"
          onClick={handleOpenDiscussion}
        >
          <span>View all discussions</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Real Comments or Proper Empty State */}
      {displayTakes.length === 0 ? (
        <div className="pulse-conversation-empty-state">
          <div className="pulse-conversation-empty-bubble">
            <MessageSquareText size={22} className="pulse-conversation-empty-icon" />
          </div>
          <div className="pulse-conversation-empty-text">
            <h3 className="pulse-conversation-empty-title">No perspectives shared on this story yet</h3>
            <p className="pulse-conversation-empty-desc">
              Be the first to voice your perspective and spark the conversation anonymously.
            </p>
          </div>
          <button
            type="button"
            className="pulse-conversation-empty-btn"
            onClick={handleOpenDiscussion}
          >
            <span>Start the discussion</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="pulse-conversation-grid">
          {displayTakes.map((take, idx) => {
            const color = avatarColors[idx % avatarColors.length];
            const isLiked = localLikes[`${take.id}_liked`];
            const currentLikes = localLikes[take.id] !== undefined ? localLikes[take.id] : take.likes;

            return (
              <div
                key={take.id}
                className="pulse-take-card"
                onClick={handleOpenDiscussion}
                role="button"
                tabIndex={0}
                title="Click to view full discussion"
              >
                {/* Author Header */}
                <div className="pulse-take-author-row">
                  <div
                    className="pulse-take-avatar"
                    style={{ background: color.bg, color: color.text }}
                  >
                    <User size={13} />
                  </div>
                  <div className="pulse-take-author-info">
                    <span className="pulse-take-author-name">{take.author}</span>
                    <span className="pulse-take-dot">•</span>
                    <span className="pulse-take-time">{take.timeAgo}</span>
                  </div>
                </div>

                {/* Take Content */}
                <p className="pulse-take-text">{take.content}</p>

                {/* Action Bar */}
                <div className="pulse-take-actions">
                  <button
                    type="button"
                    className={`pulse-take-action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={(e) => handleLike(e, take.id, take.likes)}
                    aria-label="Like perspective"
                  >
                    <Heart size={13} fill={isLiked ? '#C4005D' : 'none'} color={isLiked ? '#C4005D' : '#64748B'} />
                    <span>{currentLikes}</span>
                  </button>

                  <button
                    type="button"
                    className="pulse-take-action-btn"
                    onClick={handleOpenDiscussion}
                    aria-label="Reply to perspective"
                  >
                    <CornerDownRight size={13} color="#64748B" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
