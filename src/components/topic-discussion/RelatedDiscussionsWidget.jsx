import React from 'react';
import { ArrowRight, MessageSquare, Heart } from 'lucide-react';
import { getMediaUrl } from '../../config/env.js';

// Fallback photographic assets for related discussions
import thumbMeditation from '../../assets/explore/mental-health-cover.jpg';
import thumbLifeWork from '../../assets/explore/topic-life-work.jpg';
import thumbRelationships from '../../assets/explore/relationships-cover.jpg';
import thumbMotivation from '../../assets/explore/motivation-cover.jpg';
import thumbFamily from '../../assets/explore/topic-family.jpg';

const DEFAULT_RELATED = [
  {
    id: 'rel_1',
    title: 'How to stay calm during tough times?',
    commentsCount: 412,
    heartCount: 1800,
    image: thumbMeditation,
  },
  {
    id: 'rel_2',
    title: 'Morning habits for a positive mindset',
    commentsCount: 318,
    heartCount: 1400,
    image: thumbMotivation,
  },
  {
    id: 'rel_3',
    title: 'Dealing with social anxiety',
    commentsCount: 256,
    heartCount: 1100,
    image: thumbLifeWork,
  },
  {
    id: 'rel_4',
    title: 'Is therapy really helpful?',
    commentsCount: 189,
    heartCount: 980,
    image: thumbRelationships,
  },
];

export function RelatedDiscussionsWidget({
  discussions = [],
  currentPostId,
  topicName = 'Mental Health',
  onNavigate,
}) {
  // Filter out current post and take up to 4 items
  const filteredDiscussions = (discussions || [])
    .filter((p) => p && String(p.id) !== String(currentPostId))
    .slice(0, 4);

  // If we have fewer than 4 real discussions from this topic, augment with default items
  const itemsToDisplay = filteredDiscussions.length >= 3
    ? filteredDiscussions.map((p, idx) => ({
        id: p.id,
        title: p.title || p.content?.slice(0, 50) || 'Discussion on ' + topicName,
        commentsCount: p.commentsCount ?? p.commentCount ?? 0,
        heartCount: p.reactions?.HEART ?? p.likeCount ?? 0,
        image: p.imageUrl ? getMediaUrl(p.imageUrl) : (DEFAULT_RELATED[idx % DEFAULT_RELATED.length].image),
      }))
    : DEFAULT_RELATED;

  const handleItemClick = (item) => {
    if (String(item.id).startsWith('rel_')) {
      // In case default fallback item is clicked, navigate to explore with search
      if (onNavigate) {
        onNavigate(`/explore?q=${encodeURIComponent(item.title)}`);
      } else {
        window.location.href = `/explore?q=${encodeURIComponent(item.title)}`;
      }
    } else {
      if (onNavigate) {
        onNavigate(`/post/${item.id}`);
      } else {
        window.location.href = `/post/${item.id}`;
      }
    }
  };

  const handleViewAll = () => {
    if (onNavigate) {
      onNavigate(`/explore?category=${encodeURIComponent(topicName)}`);
    } else {
      window.location.href = `/explore?category=${encodeURIComponent(topicName)}`;
    }
  };

  const formatCount = (num) => {
    if (typeof num === 'number') {
      return num >= 1000 ? (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : num;
    }
    return num || 0;
  };

  return (
    <div className="related-discussions-widget-card" aria-label="Related Discussions">
      {/* Header Row: Title + "View all →" */}
      <div className="related-header-row">
        <h3 className="related-header-title">Related Discussions</h3>
        <button
          type="button"
          className="related-view-all-link"
          onClick={handleViewAll}
        >
          <span>View all</span>
          <ArrowRight size={13} className="view-all-arrow" />
        </button>
      </div>

      {/* Discussion Items List */}
      <div className="related-items-list">
        {itemsToDisplay.map((item) => (
          <div
            key={item.id}
            className="related-discussion-item"
            onClick={() => handleItemClick(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleItemClick(item);
              }
            }}
          >
            {/* Thumbnail */}
            <div className="related-item-thumb-wrap">
              <img
                src={item.image}
                alt={item.title}
                className="related-item-thumb-img"
                loading="lazy"
              />
            </div>

            {/* Info Col: Title + Stats */}
            <div className="related-item-info">
              <h4 className="related-item-title">{item.title}</h4>
              <div className="related-item-stats">
                <span className="related-stat">
                  <MessageSquare size={13} className="stat-icon" />
                  <span>{formatCount(item.commentsCount)}</span>
                </span>
                <span className="related-stat">
                  <Heart size={13} className="stat-icon" />
                  <span>{formatCount(item.heartCount)}</span>
                </span>
              </div>
            </div>

            {/* Pink Circular Arrow Button */}
            <div className="related-item-arrow-btn" aria-hidden="true">
              <ArrowRight size={13} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
