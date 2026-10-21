import React from 'react';
import { Home, Compass, PlusSquare, Music2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function MobileNavigation({ activeRoute, onNavigate }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navItems = [
    {
      icon: Home,
      label: t('nav.home', 'Home'),
      route: '/home',
      badge: false,
    },
    {
      icon: Compass,
      label: t('nav.explore', 'Explore'),
      route: '/explore',
      badge: false,
    },
    {
      icon: PlusSquare,
      label: null, // Center FAB — no label
      route: '/create-post',
      isFab: true,
    },
    {
      icon: Music2,
      label: t('nav.music', 'Music'),
      route: '/music',
      badge: false,
    },
    {
      icon: User,
      label: t('nav.profile', 'Profile'),
      route: currentUser ? `/profile/${currentUser.username?.replace('@', '') || 'me'}` : '/login',
      badge: false,
      routePrefix: '/profile',
    },
  ];

  return (
    <nav
      className="mobile-only"
      style={{
        position: 'fixed',
        bottom: 0,
        insetInline: 0,
        height: 'calc(60px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: 'var(--pure-white)',
        borderTop: '1px solid var(--border-light)',
        /* Explicitly flex — not relying on utility class */
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 990,
        boxShadow: '0 -4px 20px rgba(45, 29, 21, 0.08)',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.routePrefix
          ? activeRoute?.startsWith(item.routePrefix)
          : activeRoute === item.route;

        if (item.isFab) {
          return (
            <button
              key={item.route}
              onClick={() => onNavigate('/create-post')}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--deep-plum)',
                color: 'var(--pure-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(111, 64, 95, 0.4)',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Icon size={22} />
            </button>
          );
        }

        return (
          <button
            key={item.route}
            onClick={() => onNavigate(item.route)}
            className="flex-col items-center gap-xs"
            style={{
              color: isActive ? 'var(--deep-plum)' : 'var(--hurricane)',
              fontSize: '10px',
              fontWeight: isActive ? 700 : 400,
              position: 'relative',
              padding: '4px 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ position: 'relative' }}>
              <Icon size={21} />
              {/* Badge dot for unread messages/notifications */}
              {item.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-3px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    border: '1.5px solid var(--pure-white)',
                  }}
                />
              )}
            </span>
            {item.label && <span>{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
