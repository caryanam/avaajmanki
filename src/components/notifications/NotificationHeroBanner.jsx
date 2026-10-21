import React from 'react';
import { Bell } from 'lucide-react';
import heroBannerImg from '../../assets/notifications/hero-notification-banner.jpg';

export function NotificationHeroBanner() {
  return (
    <div className="notif-hero-banner" role="banner">
      {/* Background artwork */}
      <img
        src={heroBannerImg}
        alt=""
        className="notif-hero-bg"
        aria-hidden="true"
      />
      <div className="notif-hero-overlay" aria-hidden="true" />

      {/* Decorative cursive script from reference */}
      <div className="notif-hero-script-flourish" aria-hidden="true">
        <span>Good Conversations Happen Here</span>
        <span>❤️</span>
      </div>

      {/* Content on left */}
      <div className="notif-hero-content">
        <div className="notif-hero-icon-box" aria-hidden="true">
          <Bell size={28} strokeWidth={2.4} />
        </div>

        <div className="notif-hero-text">
          <span className="notif-hero-eyebrow">STAY UPDATED</span>
          <h1 className="notif-hero-title">
            Your <span className="notif-hero-title-highlight">Notifications</span>
          </h1>
          <p className="notif-hero-subtitle">
            Never miss a conversation, reply or update from your community.
          </p>
        </div>
      </div>
    </div>
  );
}
