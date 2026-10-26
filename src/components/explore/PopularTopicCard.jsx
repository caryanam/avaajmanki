import React from 'react';
import { ChevronRight } from 'lucide-react';
import { getMediaUrl } from '../../config/env.js';

export function PopularTopicCard({ topic, onClick }) {
  const { name, icon, image, fallbackImage, count = 0, badgeBg = '#FFE4E6' } = topic;

  const formattedCount =
    typeof count === 'number'
      ? count >= 1000
        ? (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
        : count
      : count;

  return (
    <div
      className="explore-topic-carousel-card"
      onClick={() => onClick(topic)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(topic);
        }
      }}
      title={`Explore ${name}`}
    >
      {/* 16:9 Thumbnail Image */}
      <div className="explore-topic-thumb-wrap">
        <img
          src={getMediaUrl(image)}
          alt={name}
          className="explore-topic-thumb-img"
          onError={(e) => {
            if (fallbackImage && e.currentTarget.src !== fallbackImage) {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImage;
            }
          }}
        />
      </div>

      {/* Bottom Row Bar */}
      <div className="explore-topic-bottom-bar">
        {/* Left Square Icon Badge */}
        <div
          className="explore-topic-square-badge"
          style={{ backgroundColor: badgeBg }}
          aria-hidden="true"
        >
          {icon}
        </div>

        {/* Center Topic Name & Dynamic Discussion Count */}
        <div className="explore-topic-info-col">
          <h4 className="explore-topic-name">{name}</h4>
          <span className="explore-topic-stat">
            {formattedCount} {formattedCount === 1 ? 'discussion' : 'discussions'}
          </span>
        </div>

        {/* Right Chevron */}
        <ChevronRight size={10} className="explore-topic-chevron" aria-hidden="true" />
      </div>
    </div>
  );
}
