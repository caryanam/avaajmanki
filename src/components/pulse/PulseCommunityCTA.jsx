import React from 'react';
import { MessageSquareText, ArrowRight } from 'lucide-react';

export function PulseCommunityCTA({ featuredStoryId, onNavigate }) {
  const handleClick = () => {
    if (onNavigate) {
      if (featuredStoryId) {
        onNavigate(`/pulse/${featuredStoryId}`);
      } else {
        onNavigate('/pulse');
      }
    }
  };

  return (
    <div
      className="pulse-community-cta-card"
      onClick={handleClick}
      role="region"
      aria-label="Community discussion invitation"
    >
      <div className="pulse-community-top-row">
        <div className="pulse-community-icon-circle">
          <MessageSquareText size={20} className="pulse-community-icon" />
        </div>

        <div className="pulse-community-content">
          <h4 className="pulse-community-title">Be part of the conversation</h4>
          <p className="pulse-community-desc">
            Read the latest news, share your anonymous perspective and see what others think.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="pulse-community-join-btn"
        onClick={handleClick}
      >
        <span>Join the Discussion</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
