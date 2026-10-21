import React from 'react';
import { CheckCheck } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'comments', label: 'Comments' },
  { id: 'replies', label: 'Replies' },
  { id: 'likes', label: 'Likes' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'follows', label: 'Follows' },
  { id: 'system', label: 'System' },
];

export function NotificationFilterTabs({
  activeTab = 'all',
  onSelectTab,
  onMarkAllAsRead,
  hasUnread = false,
}) {
  return (
    <div className="notif-tabs-bar">
      <div className="notif-tabs-list" role="tablist" aria-label="Notification Categories">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              className={`notif-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="notif-mark-read-btn"
        onClick={onMarkAllAsRead}
        title="Mark all notifications as read"
      >
        <CheckCheck size={16} strokeWidth={2.2} />
        <span>Mark all as read</span>
      </button>
    </div>
  );
}
