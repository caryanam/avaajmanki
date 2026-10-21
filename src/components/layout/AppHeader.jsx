import React, { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import logoMark from '../../assets/home/logo-mark.png';

export function AppHeader({ onNavigate }) {
  const { currentUser } = useAuth();
  const { unreadCount = 0 } = useNotifications() || {};
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle Ctrl+K shortcut to focus search input
  const searchInputRef = React.useRef(null);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const currentPath = (typeof window !== 'undefined' ? window.location.pathname : '').toLowerCase();
    if (currentPath === '/music' || currentPath.startsWith('/music')) {
      window.dispatchEvent(new CustomEvent('music-search', { detail: val }));
      const params = new URLSearchParams(window.location.search);
      if (val) params.set('q', val);
      else params.delete('q');
      const newSearch = params.toString() ? `?${params.toString()}` : '';
      window.history.replaceState(null, '', `${window.location.pathname}${newSearch}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const currentPath = (typeof window !== 'undefined' ? window.location.pathname : '').toLowerCase();
    if (currentPath === '/music' || currentPath.startsWith('/music')) {
      window.dispatchEvent(new CustomEvent('music-search', { detail: searchQuery.trim() }));
      return;
    }
    if (searchQuery.trim()) {
      onNavigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userInitial = currentUser?.username
    ? currentUser.username.replace('@', '').charAt(0).toUpperCase()
    : 'N';

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Brand Logo & Tagline */}
        <button
          type="button"
          className="header-brand"
          onClick={() => onNavigate('/home')}
          title="AwaajManKi Home"
        >
          <img
            src={logoMark}
            alt="AwaajManKi Logo"
            className="header-brand-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="header-brand-info">
            <span className="header-brand-title">AwaajManKi</span>
            <span className="header-brand-subtitle">{t('nav.tagline', 'Real People. Real Thoughts. Anonymously.')}</span>
          </div>
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="header-search-wrap">
          <Search size={16} className="header-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="header-search-input"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('nav.searchGeneral', 'Search thoughts, topics, news or people...')}
          />
          <span className="header-search-shortcut">{t('nav.ctrlK', 'Ctrl K')}</span>
        </form>

        {/* Right Controls */}
        <div className="header-actions">
          {/* Theme Control */}
          <button
            type="button"
            className="header-icon-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? t('nav.lightMode', 'Switch to Light Mode') : t('nav.darkMode', 'Switch to Dark Mode')}
          >
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="header-icon-btn"
            onClick={() => onNavigate('/notifications')}
            title={t('nav.notifications', 'Notifications')}
          >
            <Bell size={18} />
            <span className="header-badge">{unreadCount > 0 ? unreadCount : 3}</span>
          </button>

          {/* User Profile Avatar with dropdown chevron */}
          <button
            type="button"
            className="header-profile-btn"
            onClick={() => {
              const handle = currentUser?.username ? currentUser.username.replace('@', '') : 'me';
              onNavigate(`/profile/${handle}`);
            }}
            title={currentUser?.username ? `${t('nav.profile', 'Profile')} (${currentUser.username})` : t('nav.profile', 'Profile')}
          >
            <div className="header-user-avatar">
              {userInitial}
            </div>
            <ChevronDown size={14} className="header-avatar-chevron" />
          </button>
        </div>
      </div>
    </header>
  );
}
