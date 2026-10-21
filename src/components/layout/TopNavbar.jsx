import React, { useState, useEffect, useRef } from 'react';
import { Home, Compass, Search, PlusSquare, Bell, User as UserIcon, Menu, MessageSquare, Sun, ChevronDown } from 'lucide-react';
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

  const currentPath = (activeRoute || (typeof window !== 'undefined' ? window.location.pathname : '') || '').toLowerCase();
  const isMusicPage = currentPath === '/music' || currentPath.startsWith('/music');
  const musicSearchInputRef = useRef(null);
  const [musicSearchVal, setMusicSearchVal] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });

  // Global Ctrl+K handler for music search
  useEffect(() => {
    if (!isMusicPage) return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        musicSearchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMusicPage]);

  const handleMusicSearchChange = (val) => {
    setMusicSearchVal(val);
    window.dispatchEvent(new CustomEvent('music-search', { detail: val }));
    const params = new URLSearchParams(window.location.search);
    if (val) params.set('q', val);
    else params.delete('q');
    const newSearch = params.toString() ? `?${params.toString()}` : '';
    window.history.replaceState(null, '', `${window.location.pathname}${newSearch}`);
  };

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

      {/* ── MUSIC PAGE TARGET TOP NAVBAR ── */}
      {isMusicPage ? (
        <header
          style={{
            position: 'sticky',
            top: '8px',
            zIndex: 900,
            margin: '8px auto 0',
            width: 'calc(100% - 24px)',
            maxWidth: '1560px',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid rgba(45, 29, 21, 0.08)',
            boxShadow: '0 4px 20px rgba(45, 29, 21, 0.04)',
            padding: '0 24px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            {/* Logo + AwaajManKi + Subtitle */}
            <button
              onClick={() => onNavigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <img
                src={logoMKA}
                alt="AwaajManKi"
                style={{
                  width: '36px',
                  height: '36px',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  border: '1.5px solid #FF9933',
                  boxShadow: '0 2px 8px rgba(255, 153, 51, 0.25)',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.15 }}>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#1F161A',
                    letterSpacing: '-0.02em',
                  }}
                >
                  AwaajManKi
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#8C7E83',
                    fontWeight: 500,
                    marginTop: '2px',
                    letterSpacing: '0.01em',
                  }}
                >
                  {t('nav.tagline', 'Real People. Real Thoughts. Anonymously.')}
                </span>
              </div>
            </button>

            {/* Centered Music Domain Search */}
            <div style={{ flex: '0 1 520px', position: 'relative' }} className="desktop-only">
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  insetInlineStart: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8C7E83',
                  pointerEvents: 'none',
                }}
              />
              <input
                ref={musicSearchInputRef}
                type="text"
                value={musicSearchVal}
                onChange={(e) => handleMusicSearchChange(e.target.value)}
                placeholder={t('nav.searchSongs', 'Search songs, moods or keywords... (Ctrl K)')}
                style={{
                  width: '100%',
                  padding: '9px 74px 9px 40px',
                  borderRadius: '24px',
                  border: '1.5px solid #EADBDE',
                  background: '#FFFFFF',
                  color: '#1F161A',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  insetInlineEnd: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#8C7E83',
                  background: '#F5EEF0',
                  borderRadius: '6px',
                  padding: '2px 7px',
                  pointerEvents: 'none',
                }}
              >
                {t('nav.ctrlK', 'Ctrl K')}
              </span>
            </div>

            {/* Right Controls: Theme Toggle, Notifications, Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
              {/* Theme Toggle Sun Icon */}
              <button
                type="button"
                title="Toggle Theme"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#574B47',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                }}
              >
                <Sun size={20} />
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => onNavigate('/notifications')}
                title="Notifications"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#574B47',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  borderRadius: '50%',
                }}
              >
                <Bell size={20} />
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#E11D48',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #FFFFFF',
                    padding: '0 2px',
                  }}
                >
                  {unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : '3'}
                </span>
              </button>

              {/* User Avatar + Name + Dropdown */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '20px',
                  background: '#F9F4F6',
                }}
                onClick={() => {
                  const handle = currentUser?.username ? currentUser.username.replace('@', '') : 'me';
                  onNavigate(`/profile/${handle}`);
                }}
              >
                <InitialAvatar
                  username={currentUser?.username || 'Shubham'}
                  initials={currentUser?.avatarInitials || 'A'}
                  size={30}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#1F161A',
                  }}
                >
                  {currentUser?.username ? currentUser.username.replace('@', '') : 'Shubham'}
                </span>
                <ChevronDown size={14} style={{ color: '#8C7E83' }} />
              </div>
            </div>
          </div>
        </header>
      ) : (
      /* ── DYNAMICALLY GRADUAL PURPLE SHIFTING TOP NAVBAR (Preserved for all other routes) ── */
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
                  insetInlineStart: '12px',
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
                placeholder={t('nav.searchThoughts', 'Search thoughts, questions, members...')}
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
              title={t('nav.notifications', 'Notifications')}
              style={iconBtnStyle(activeRoute === '/notifications')}
            >
              <Bell size={21} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', insetInlineEnd: '4px',
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
                title={currentUser?.username ? `${t('nav.profile', 'Profile')} (${currentUser.username})` : t('nav.profile', 'Profile')}
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
                {t('nav.login', 'Login')}
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
              title={t('nav.menu', 'Menu')}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

      </header>
      )}

      {/* ── Mobile Sidebar Drawer ── */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title={t('nav.navigation', 'Navigation')}
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
