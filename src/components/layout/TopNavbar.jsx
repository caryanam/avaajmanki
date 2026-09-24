import React, { useState } from 'react';
import { Home, Compass, Search, PlusSquare, Bell, User as UserIcon, Menu, MessageSquare } from 'lucide-react';
import logoMKA from '../../assets/logo_MKA.png';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { Tooltip } from '../common/Tooltip.jsx';
import { Drawer } from '../common/Drawer.jsx';
import { NavbarMoodWidget } from '../mood/NavbarMoodWidget.jsx';

export function TopNavbar({ activeRoute, onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  const chatContext = useChat();
  const hasUnreadMessages = chatContext?.hasUnreadMessages || false;
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      // Smoothly interpolate ratio from 0 to 1 over 700px of scrolling down the feed
      const maxScroll = 700;
      const ratio = Math.min(1, Math.max(0, top / maxScroll));
      setScrollProgress(ratio);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  // Continuous RGB Math for Gradient (Pure White -> Deep Plum #6F405F & #3D2334)
  const r1 = Math.round(255 - (255 - 111) * scrollProgress);
  const g1 = Math.round(255 - (255 - 64) * scrollProgress);
  const b1 = Math.round(255 - (255 - 95) * scrollProgress);

  const r2 = Math.round(250 - (250 - 61) * scrollProgress);
  const g2 = Math.round(248 - (248 - 35) * scrollProgress);
  const b2 = Math.round(247 - (247 - 52) * scrollProgress);

  const rText = Math.round(45 + (255 - 45) * scrollProgress);
  const gText = Math.round(29 + (255 - 29) * scrollProgress);
  const bText = Math.round(21 + (255 - 21) * scrollProgress);

  const headerBackground = `linear-gradient(135deg, rgb(${r1}, ${g1}, ${b1}) 0%, rgb(${r2}, ${g2}, ${b2}) 100%)`;
  const textColor = `rgb(${rText}, ${gText}, ${bText})`;
  const isDarkNavbar = scrollProgress > 0.45;

  const placeholderColor = `rgba(${rText}, ${gText}, ${bText}, ${0.65 + 0.3 * scrollProgress})`;
  const searchBg = `rgba(${Math.round(255 - 194 * scrollProgress)}, ${Math.round(255 - 220 * scrollProgress)}, ${Math.round(255 - 203 * scrollProgress)}, ${0.9 + 0.1 * scrollProgress})`;
  const searchBorder = `1.5px solid rgba(${Math.round(111 + 144 * scrollProgress)}, ${Math.round(64 + 191 * scrollProgress)}, ${Math.round(95 + 160 * scrollProgress)}, ${0.2 + 0.2 * scrollProgress})`;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const iconBtnStyle = (active) => ({
    padding: '8px',
    borderRadius: 'var(--radius-md)',
    color: textColor,
    background: active ? (isDarkNavbar ? 'rgba(255, 255, 255, 0.25)' : 'rgba(111, 64, 95, 0.12)') : 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  });

  return (
    <>
      <style>{`
        .dynamic-navbar-search-input::placeholder {
          color: ${placeholderColor} !important;
          opacity: 1 !important;
          transition: color 0.15s ease;
        }
      `}</style>

      {/* ── DYNAMICALLY GRADUAL PURPLE SHIFTING TOP NAVBAR ── */}
      <header
        style={{
          position: 'sticky',
          top: '8px',
          zIndex: 900,
          margin: '8px auto 0',
          width: 'calc(100% - 24px)',
          maxWidth: '1280px',
          background: headerBackground,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: isDarkNavbar
            ? `1.5px solid rgba(255, 255, 255, ${0.1 + 0.25 * scrollProgress})`
            : '1.5px solid rgba(111, 64, 95, 0.16)',
          boxShadow: isDarkNavbar
            ? `0 12px 36px rgba(61, 35, 52, ${0.15 + 0.3 * scrollProgress})`
            : '0 6px 24px rgba(45, 29, 21, 0.06)',
          padding: '0 18px',
          boxSizing: 'border-box',
          overflow: 'visible',
          transition: 'border 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <div
          style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            minWidth: 0,
          }}
        >
          {/* ── Logo & Brand Badge ── */}
          <button
            onClick={() => onNavigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <img
                src={logoMKA}
                alt="AwajManki"
                style={{
                  width: '34px',
                  height: '34px',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  border: '1.5px solid #FF9933',
                  boxShadow: '0 2px 8px rgba(255, 153, 51, 0.3)',
                }}
              />
            </div>
            {/* Brand Name */}
            <span
              className="brand-name font-heading"
              style={{
                fontSize: '21px',
                fontWeight: 800,
                color: textColor,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              AwajManki
            </span>
          </button>

          {/* ── Desktop Search Bar ── */}
          <form onSubmit={handleSearch} style={{ flex: '0 1 340px' }} className="desktop-only">
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: textColor,
                  pointerEvents: 'none',
                  transition: 'color 0.15s ease',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder') || 'Search thoughts, questions, members...'}
                className="dynamic-navbar-search-input"
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 36px',
                  borderRadius: '24px',
                  border: searchBorder,
                  background: searchBg,
                  color: textColor,
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: isDarkNavbar ? '0 2px 10px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                }}
              />
            </div>
          </form>

          {/* ── RIGHT SIDE ACTIONS ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {/* Mood Button & Popup */}
            <NavbarMoodWidget isDarkNavbar={isDarkNavbar} textColor={textColor} />

            {/* Notification Bell — ALWAYS VISIBLE */}
            <button
              onClick={() => onNavigate('/notifications')}
              title={t('notifications') || 'Notifications'}
              style={iconBtnStyle(activeRoute === '/notifications')}
            >
              <Bell size={21} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  minWidth: '16px', height: '16px', borderRadius: '8px',
                  backgroundColor: '#FF9933',
                  color: '#fff', fontSize: '9px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid #FFFFFF',
                  padding: '0 2px',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar — ALWAYS VISIBLE */}
            {currentUser ? (
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(19, 136, 8, 0.3)',
                }}
                onClick={() => {
                  const handle = currentUser?.username ? currentUser.username.replace('@', '') : 'me';
                  onNavigate(`/profile/${handle}`);
                }}
                title={`Profile (${currentUser.username || 'User'})`}
              >
                <InitialAvatar
                  username={currentUser.username || '@user'}
                  initials={currentUser.avatarInitials}
                  size={32}
                />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1.5px solid #FF9933',
                  fontSize: '13px', fontWeight: 700,
                  color: '#FF671F',
                  background: '#FFFFFF', cursor: 'pointer',
                }}
              >
                Login
              </button>
            )}

            {/* ☰ Hamburger — mobile-only */}
            <button
              className="mobile-only"
              onClick={() => setIsMobileDrawerOpen(true)}
              style={{
                color: '#2D1D15', padding: '6px',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
              title="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

      </header>

      {/* ── Mobile Sidebar Drawer ── */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Navigation"
      >
        <div className="flex-col gap-sm" style={{ padding: '8px 0' }}>
          {[
            { label: t('home') || 'Home', route: '/home' },
            { label: t('explore') || 'Explore', route: '/explore' },
            { label: t('music', 'Music'), route: '/music' },
            { label: t('messages') || 'Messages', route: '/chat' },
            { label: t('notifications') || 'Notifications', route: '/notifications' },
            { label: t('myPosts') || 'My Posts', route: '/my-posts' },
            { label: t('savedPosts') || 'Saved Posts', route: '/saved' },
            { label: t('myReports') || 'My Reports', route: '/my-reports' },
            { label: t('settings') || 'Settings', route: '/settings' },
            { label: t('helpSupport') || 'Help & Support', route: '/help' },
            { label: t('communityGuidelines') || 'Guidelines', route: '/community-guidelines' },
          ].map((item) => (
            <button
              key={item.route}
              onClick={() => { setIsMobileDrawerOpen(false); onNavigate(item.route); }}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
                fontSize: '15px',
                fontWeight: activeRoute === item.route ? 600 : 400,
                color: activeRoute === item.route ? 'var(--deep-plum)' : 'var(--eclipse)',
                background: activeRoute === item.route ? 'var(--deep-plum-light)' : 'transparent',
                border: 'none', cursor: 'pointer', width: '100%',
              }}
            >
              {item.label}
            </button>
          ))}

          {currentUser && (
            <button
              onClick={() => { setIsMobileDrawerOpen(false); logout(); onNavigate('/login'); }}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--error)',
                background: 'transparent',
                border: 'none', cursor: 'pointer', width: '100%',
              }}
            >
              {t('logout') || 'Logout'}
            </button>
          )}
        </div>
      </Drawer>
    </>
  );
}
