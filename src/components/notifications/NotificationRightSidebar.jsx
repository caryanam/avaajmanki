import React from 'react';
import {
  Filter,
  Bell,
  MessageSquare,
  Reply,
  Heart,
  AtSign,
  User,
  Megaphone,
  Clock,
  Lightbulb,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { getNotificationCategory, formatTimeAgo } from '../../utils/notificationHelpers.js';
import { resolveNotificationPath } from '../../utils/notificationNavigation.js';

const FILTER_ITEMS = [
  { id: 'all', label: 'All Notifications', icon: Bell },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'replies', label: 'Replies', icon: Reply },
  { id: 'likes', label: 'Likes', icon: Heart },
  { id: 'mentions', label: 'Mentions', icon: AtSign },
  { id: 'follows', label: 'Follows', icon: User },
  { id: 'system', label: 'System', icon: Megaphone },
];

export function NotificationRightSidebar({
  activeCategory = 'all',
  onSelectCategory,
  categoryCounts = {},
  recentNotifications = [],
  onNavigate,
}) {
  return (
    <aside className="notif-right-col" aria-label="Notification Filters and Activity">
      {/* ── CARD 1: NOTIFICATION FILTERS ── */}
      <div className="notif-filters-card">
        <h3 className="notif-sidebar-title">
          <Filter size={16} strokeWidth={2.4} color="#BE185D" />
          <span>Notification Filters</span>
        </h3>

        <div className="notif-filter-list" role="list">
          {FILTER_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            const count = categoryCounts[item.id] ?? 0;

            return (
              <button
                key={item.id}
                type="button"
                className={`notif-filter-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(item.id)}
              >
                <div className="notif-filter-left">
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.3 : 1.9}
                    color={isActive ? '#BE185D' : '#64748B'}
                    fill={isActive && item.id === 'likes' ? 'currentColor' : 'none'}
                  />
                  <span>{item.label}</span>
                </div>
                <span className="notif-filter-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CARD 2: RECENT ACTIVITY ── */}
      <div className="notif-recent-card">
        <h3 className="notif-sidebar-title">
          <Clock size={16} strokeWidth={2.4} color="#0284C7" />
          <span>Recent Activity</span>
        </h3>

        {recentNotifications.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 8px' }}>
            No recent activity yet.
          </p>
        ) : (
          <div className="notif-timeline">
            <div className="notif-timeline-line" />
            {recentNotifications.slice(0, 4).map((item) => {
              const cat = getNotificationCategory(item);
              const time = formatTimeAgo(item.createdAt);
              const targetPath = resolveNotificationPath(item);

              let activityTitle = 'Activity update';
              if (cat === 'comments') activityTitle = 'New comment on your post';
              else if (cat === 'likes') activityTitle = 'New like on your post';
              else if (cat === 'replies') activityTitle = 'New reply on your comment';
              else if (cat === 'follows') activityTitle = 'Started following you';
              else if (cat === 'mentions') activityTitle = 'You were mentioned';
              else activityTitle = 'New topic update';

              return (
                <div
                  key={item.id}
                  className="notif-timeline-item"
                  onClick={() => targetPath && onNavigate && onNavigate(targetPath)}
                >
                  <div className={`notif-timeline-dot ${cat}`}>
                    {cat === 'likes' ? (
                      <Heart size={12} strokeWidth={2.4} fill="currentColor" />
                    ) : cat === 'replies' ? (
                      <Reply size={12} strokeWidth={2.4} />
                    ) : cat === 'follows' ? (
                      <User size={12} strokeWidth={2.4} />
                    ) : cat === 'mentions' ? (
                      <AtSign size={12} strokeWidth={2.4} />
                    ) : cat === 'system' ? (
                      <Megaphone size={12} strokeWidth={2.4} />
                    ) : (
                      <MessageSquare size={12} strokeWidth={2.4} />
                    )}
                  </div>
                  <div className="notif-timeline-content">
                    <span className="notif-timeline-title">{activityTitle}</span>
                    <span className="notif-timeline-time">{time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CARD 3: STAY CONNECTED ── */}
      <div className="notif-stay-connected-card">
        <div className="notif-stay-header">
          <Lightbulb size={18} strokeWidth={2.4} color="#D97706" />
          <span>Stay Connected</span>
        </div>

        <p className="notif-stay-desc">
          Get notified about comments, replies, likes and important updates from your community.
        </p>

        <button
          type="button"
          className="notif-stay-btn"
          onClick={() => onNavigate && onNavigate('/settings')}
        >
          <Settings size={15} strokeWidth={2.2} />
          <span>Notification Settings</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </aside>
  );
}
