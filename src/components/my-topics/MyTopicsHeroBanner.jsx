import React from 'react';
import { Camera, Plus } from 'lucide-react';
import heroBannerImg from '../../assets/home/hero-my-topics-banner.jpg';
import { getMediaUrl } from '../../config/env.js';

export function MyTopicsHeroBanner({ currentUser, onCreateTopicClick, onAvatarClick }) {
  const displayName = currentUser?.fullName || currentUser?.name || currentUser?.username || 'Aarav';
  const userInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatar ? getMediaUrl(currentUser.avatarUrl || currentUser.avatar) : null;

  return (
    <div className="my-topics-hero-card">
      {/* 1. Cinematic Panoramic Sunset Artwork */}
      <div className="my-topics-banner-art-wrap">
        <img
          src={heroBannerImg}
          alt="My Topics sunset landscape"
          className="my-topics-banner-img"
        />
        <div className="my-topics-banner-overlay" />
        <div className="my-topics-banner-flourish">
          <span>Your Topics, Your Space ❤️</span>
        </div>
      </div>

      {/* 2. Overlapping Profile Avatar & Actions Row */}
      <div className="my-topics-hero-body">
        <div className="my-topics-avatar-row">
          <div className="my-topics-avatar-wrapper" onClick={onAvatarClick} title="View Profile">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="my-topics-avatar-img"
              />
            ) : (
              <div className="my-topics-avatar-placeholder">
                {userInitial}
              </div>
            )}
            <button
              type="button"
              className="my-topics-avatar-edit-badge"
              aria-label="Edit Profile"
              onClick={(e) => {
                e.stopPropagation();
                onAvatarClick?.();
              }}
            >
              <Camera size={13} strokeWidth={2.2} />
            </button>
          </div>

          {/* Primary Action: + Create New Topic */}
          <button
            type="button"
            className="my-topics-create-topic-btn"
            onClick={onCreateTopicClick}
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>Create New Topic</span>
          </button>
        </div>

        {/* 3. Title & Subtitle */}
        <div className="my-topics-title-area">
          <h1 className="my-topics-heading">My Topics</h1>
          <p className="my-topics-subheading">
            Topics and posts you created on AwaajManKi
          </p>
        </div>
      </div>
    </div>
  );
}
