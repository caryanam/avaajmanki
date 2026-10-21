import React from 'react';
import { 
  Home, Compass, Music2, Bell, Hash, User, Settings, ArrowRight, Flame 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import sidebarSunsetCity from '../../assets/home/sidebar-sunset-city.jpg';
import sidebarFlourish from '../../assets/home/sidebar-flourish.png';

export function DesktopSidebar({ activeRoute = '/home', onNavigate, onJoinCommunity, onlineUsers = null }) {
  const { currentUser } = useAuth();
  const { unreadCount = 0 } = useNotifications() || {};
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', label: t('nav.home', 'Home'), icon: Home, route: '/home' },
    { id: 'pulse', label: t('nav.awaajPulse', 'Awaaj Pulse'), icon: Flame, route: '/pulse', badge: t('nav.newBadge', 'NEW'), badgeType: 'pill' },
    { id: 'explore', label: t('nav.explore', 'Explore'), icon: Compass, route: '/explore' },
    { id: 'music', label: t('nav.music', 'Music'), icon: Music2, route: '/music' },
    { id: 'notifications', label: t('nav.notifications', 'Notifications'), icon: Bell, route: '/notifications', badge: unreadCount > 0 ? String(unreadCount) : null, badgeType: 'count' },
    { id: 'topics', label: t('nav.myTopics', 'My Topics'), icon: Hash, route: '/my-posts' },
    { id: 'profile', label: t('nav.profile', 'Profile'), icon: User, route: currentUser ? `/profile/${(currentUser.username || 'me').replace('@', '')}` : '/login' },
    { id: 'settings', label: t('nav.settings', 'Settings'), icon: Settings, route: '/settings' },
  ];

  const handleJoinClick = () => {
    if (onJoinCommunity) {
      onJoinCommunity();
    } else if (!currentUser) {
      onNavigate('/register');
    } else {
      onNavigate('/explore');
    }
  };

  return (
    <aside className="desktop-left-sidebar">
      {/* 1. Shared Sidebar Card Container */}
      <div className="sidebar-main-card">
        {/* Main Navigation List */}
        <nav className="sidebar-nav-list" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const currentClean = (activeRoute || '').split('?')[0].replace(/\/+$/, '') || '/';
            const itemClean = item.route.split('?')[0].replace(/\/+$/, '') || '/';
            const isActive =
              currentClean === itemClean ||
              (itemClean === '/home' && currentClean === '/') ||
              (itemClean === '/my-posts' && currentClean === '/my-topics') ||
              (item.id === 'profile' && currentClean.startsWith('/profile'));

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.route)}
              >
                <div className="nav-item-left">
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.9} fill={isActive && item.id === 'home' ? 'currentColor' : 'none'} />
                  <span className="nav-item-label">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`nav-badge ${item.badgeType === 'pill' ? 'nav-badge-pill' : 'nav-badge-count'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Promotional Section Integrated Immediately Below Settings */}
        <div className="sidebar-promo-section">
          {/* Isolated Sunset City Illustration */}
          <div className="promo-artwork-container">
            <img
              src={sidebarSunsetCity}
              alt="Your voice matters illustration"
              className="promo-artwork-img"
            />
          </div>

          {/* Promotional Text & Live Action Button */}
          <div className="promo-content">
            <h4 className="promo-title">{t('topic.yourVoiceMatters', 'Your voice matters')}</h4>
            <p className="promo-desc" style={{ whiteSpace: 'pre-line' }}>
              {t('topic.promoDesc', 'Share freely. Stay anonymous.\nBe part of a kinder world.')}
            </p>
            <button
              type="button"
              className="promo-btn"
              onClick={handleJoinClick}
            >
              <span>{t('topic.joinOurCommunity', 'Join Our Community')}</span>
              <ArrowRight size={15} />
            </button>

            {/* Botanical pink flourish in bottom-right corner */}
            <img
              src={sidebarFlourish}
              alt=""
              className="promo-flourish-img"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* 2. Online Now Card (Only displayed when real presence data exists) */}
      {Array.isArray(onlineUsers) && onlineUsers.length > 0 && (
        <div className="online-now-card">
          <div className="online-now-status">
            <span className="online-dot" />
            <span>{t('topic.onlineNow', 'Online Now')}</span>
          </div>
          <div className="online-avatars-stack">
            {onlineUsers.slice(0, 5).map((u, idx) => (
              <div
                key={u.id || idx}
                className="online-avatar-item"
                style={{ background: u.avatarBg || '#3B82F6' }}
              >
                {u.initial || (u.username ? u.username.charAt(0).toUpperCase() : 'U')}
              </div>
            ))}
            {onlineUsers.length > 5 && (
              <div className="online-avatar-more">+{onlineUsers.length - 5}</div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
