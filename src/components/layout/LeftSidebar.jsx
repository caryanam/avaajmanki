import React, { useState } from 'react';
import {
  Home,
  Compass,
  FileText,
  ShieldAlert,
  Settings,
  HelpCircle,
  LogOut,
  Music2,
  Bell,
  User,
  Newspaper,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import sidebarIllustration from '../../assets/home/sidebar-illustration.jpg';

export function LeftSidebar({ activeRoute, onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPath = (activeRoute || window.location.pathname || '').toLowerCase();
  const isMusicPage = currentPath === '/music' || currentPath.startsWith('/music');

  // Topic page matcher: /profile/{topicName} (collapses into hover strip ONLY on topic pages)
  const isTopicPage = Boolean(
    currentPath.startsWith('/profile/') &&
    currentPath !== '/profile' &&
    currentPath !== '/profile/' &&
    currentPath !== '/profile/me' &&
    !currentPath.includes('/edit') &&
    !currentPath.includes('/settings')
  );

  // ═════════════════════════════════════════════════════════════════
  // 1. MUSIC PAGE TARGET SIDEBAR: Clean, Light, with Text Labels
  // ═════════════════════════════════════════════════════════════════
  if (isMusicPage) {
    const musicNavItems = [
      { label: t('nav.home', 'Home'), icon: Home, route: '/home' },
      { label: t('nav.pulseNews', 'Pulse News'), icon: Newspaper, route: '/home?tab=pulse' },
      { label: t('nav.explore', 'Explore'), icon: Compass, route: '/explore' },
      { label: t('nav.music', 'Music'), icon: Music2, route: '/music' },
      {
        label: t('nav.notifications', 'Notifications'),
        icon: Bell,
        route: '/notifications',
        badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : '3',
      },
      { label: t('nav.myTopics', 'My Topics'), icon: FileText, route: '/my-posts' },
      {
        label: t('nav.profile', 'Profile'),
        icon: User,
        route: currentUser?.username ? `/profile/${currentUser.username.replace('@', '')}` : '/profile/me',
      },
      { label: t('nav.settings', 'Settings'), icon: Settings, route: '/settings' },
    ];

    return (
      <aside
        className="desktop-only"
        style={{
          position: 'fixed',
          insetInlineStart: '16px',
          top: '80px',
          width: '232px',
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 12px',
            borderRadius: '20px',
            background: '#FFFFFF',
            border: '1.5px solid #F0E8EB',
            boxShadow: '0 4px 20px rgba(45, 29, 21, 0.04)',
            height: 'calc(100vh - 100px)',
            boxSizing: 'border-box',
            overflowY: 'auto',
          }}
        >
          {/* Navigation Items List */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {musicNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = item.route === '/music';
              const isHovered = hoveredIdx === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onNavigate(item.route)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive
                      ? '#FDF2F4'
                      : isHovered
                      ? '#FBF2F5'
                      : 'transparent',
                    color: isActive ? '#E11D48' : '#3F3338',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '13.5px',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon
                      size={18}
                      style={{
                        color: isActive ? '#E11D48' : '#756966',
                        strokeWidth: isActive ? 2.4 : 2,
                        flexShrink: 0,
                      }}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        background: '#E11D48',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        minWidth: '16px',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Illustration Card from Reference */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '10px',
            }}
          >
            <p
              style={{
                fontFamily: "'Caveat', cursive, Georgia, serif",
                fontSize: '13.5px',
                fontStyle: 'italic',
                color: '#8A7B82',
                lineHeight: 1.35,
                margin: 0,
                padding: '0 8px',
                whiteSpace: 'pre-line',
              }}
            >
              {t('nav.differentStories', 'Different Stories\nSame Hearts\nA More Open World')}
            </p>
            <div
              style={{
                width: '100%',
                height: '140px',
                borderRadius: '14px',
                overflow: 'hidden',
                background: '#F5ECF0',
                boxShadow: '0 2px 10px rgba(45, 29, 21, 0.06)',
              }}
            >
              <img
                src={sidebarIllustration}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                draggable="false"
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // 2. EXISTING ICON-ONLY RAIL (Preserved untouched for all other pages)
  // ═════════════════════════════════════════════════════════════════
  const menuItems = [
    { label: t('nav.home', 'Home'), icon: Home, route: '/home' },
    { label: t('nav.explore', 'Explore'), icon: Compass, route: '/explore' },
    { label: t('nav.music', 'Music'), icon: Music2, route: '/music' },
    { label: t('nav.myTopics', 'My Topics'), icon: FileText, route: '/my-posts' },
    { label: t('nav.myReports', 'My Reports'), icon: ShieldAlert, route: '/my-reports' },
    { label: t('nav.settings', 'Settings'), icon: Settings, route: '/settings' },
    { label: t('nav.helpSupport', 'Help & Support'), icon: HelpCircle, route: '/help' },
  ];

  return (
    <aside
      className="desktop-only"
      onMouseEnter={() => isTopicPage && setIsExpanded(true)}
      onMouseLeave={() => isTopicPage && setIsExpanded(false)}
      style={{
        position: 'fixed',
        insetInlineStart: isTopicPage ? 0 : '16px',
        top: '80px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        transform: isTopicPage
          ? (isExpanded ? 'translateX(10px)' : 'translateX(-58px)')
          : 'none',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), inset-inline-start 0.3s ease',
        cursor: isTopicPage ? 'pointer' : 'default',
      }}
    >
      <div
        className="mka-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 8px',
          borderRadius: '20px',
          minHeight: 'calc(100vh - 110px)',
          background: 'linear-gradient(180deg, #6F405F 0%, #3D2334 100%)',
          border: '1.5px solid #5A334D',
          width: '68px',
          boxShadow: isTopicPage
            ? (isExpanded ? '12px 16px 40px rgba(61, 35, 52, 0.45)' : '4px 6px 20px rgba(61, 35, 52, 0.25)')
            : '6px 10px 28px rgba(61, 35, 52, 0.35)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.route;
            const isItemHovered = hoveredIdx === idx;

            return (
              <div key={idx} style={{ position: 'relative', width: '100%' }}>
                <button
                  onClick={() => onNavigate(item.route)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    color: '#FFFFFF',
                    background: isActive
                      ? 'rgba(255, 255, 255, 0.28)'
                      : isItemHovered
                      ? 'rgba(255, 255, 255, 0.16)'
                      : 'transparent',
                    boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.22)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={21} style={{ color: '#FFFFFF', strokeWidth: isActive ? 2.5 : 2 }} />
                </button>

                {/* Floating Tooltip Label */}
                {isItemHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      insetInlineStart: '60px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--eclipse)',
                      color: 'var(--pure-white)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                      zIndex: 100,
                      pointerEvents: 'none',
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {currentUser && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.18)', marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <button
                onClick={() => {
                  logout();
                  onNavigate('/login');
                }}
                onMouseEnter={() => setHoveredIdx('logout')}
                onMouseLeave={() => setHoveredIdx(null)}
                title={t('nav.logout', 'Logout')}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  color: '#FFADAD',
                  background: hoveredIdx === 'logout' ? 'rgba(255, 173, 173, 0.2)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <LogOut size={20} style={{ color: '#FFADAD' }} />
              </button>

              {hoveredIdx === 'logout' && (
                <div
                  style={{
                    position: 'absolute',
                    insetInlineStart: '60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'var(--error)',
                    color: 'var(--pure-white)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    zIndex: 100,
                    pointerEvents: 'none',
                  }}
                >
                  {t('nav.logout', 'Logout')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
