import React, { useState, useMemo } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { NotificationHeroBanner } from '../../components/notifications/NotificationHeroBanner.jsx';
import { NotificationFilterTabs } from '../../components/notifications/NotificationFilterTabs.jsx';
import { NotificationItemRow } from '../../components/notifications/NotificationItemRow.jsx';
import { NotificationRightSidebar } from '../../components/notifications/NotificationRightSidebar.jsx';
import { getNotificationCategory } from '../../utils/notificationHelpers.js';
import { Bell, Sparkles } from 'lucide-react';
import '../../styles/notifications.css';

export function NotificationsPage({ onNavigate }) {
  const {
    notifications = [],
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Active filter tab/category: 'all' | 'comments' | 'replies' | 'likes' | 'mentions' | 'follows' | 'system'
  const [activeCategory, setActiveCategory] = useState('all');

  // Compute live authentic counts for each category
  const categoryCounts = useMemo(() => {
    const counts = {
      all: notifications.length,
      comments: 0,
      replies: 0,
      likes: 0,
      mentions: 0,
      follows: 0,
      system: 0,
    };

    notifications.forEach((item) => {
      const cat = getNotificationCategory(item);
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      }
    });

    return counts;
  }, [notifications]);

  // Filtered notifications based on active category
  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'all') {
      return notifications;
    }
    return notifications.filter((item) => getNotificationCategory(item) === activeCategory);
  }, [notifications, activeCategory]);

  return (
    <UserLayout activeRoute="/notifications" onNavigate={onNavigate} wide={true}>
      <div className="notifications-page-layout">
        {/* ── CENTER STREAM (Column 2 of Desktop Grid) ── */}
        <section className="notif-center-col" aria-label="Notifications Stream">
          {/* 1. Notifications Hero Banner */}
          <NotificationHeroBanner />

          {/* 2. Filter Tabs + Mark All As Read */}
          <NotificationFilterTabs
            activeTab={activeCategory}
            onSelectTab={setActiveCategory}
            onMarkAllAsRead={markAllAsRead}
            hasUnread={unreadCount > 0}
          />

          {/* 3. Notification List */}
          <div className="notif-list-stack">
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #F1E5EB',
                  padding: '48px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: '#FFF0F5',
                    color: '#BE185D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={26} strokeWidth={2.2} />
                </div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1E293B' }}>
                  {activeCategory === 'all'
                    ? "You're all caught up!"
                    : `No ${activeCategory} notifications yet`}
                </h3>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B', maxWidth: '340px' }}>
                  {activeCategory === 'all'
                    ? 'When you receive comments, replies, or likes, they will appear here.'
                    : 'Check back later or browse other categories to see activity.'}
                </p>
                {activeCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    style={{
                      marginTop: '6px',
                      padding: '8px 18px',
                      borderRadius: '9999px',
                      background: '#FDF2F4',
                      border: '1px solid #F8D7E3',
                      color: '#BE185D',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View All Notifications
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <NotificationItemRow
                  key={item.id}
                  item={item}
                  onNavigate={onNavigate}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>
        </section>

        {/* ── RIGHT COLUMN (Column 3 of Desktop Grid) ── */}
        <NotificationRightSidebar
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          categoryCounts={categoryCounts}
          recentNotifications={notifications}
          onNavigate={onNavigate}
        />
      </div>
    </UserLayout>
  );
}
export default NotificationsPage;
