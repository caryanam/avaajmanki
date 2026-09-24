import React, { useState } from 'react';
import { LogIn, Home, Menu, X } from 'lucide-react';
import { Footer } from './Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { MoodMusicWidget } from '../music/MoodMusicWidget.jsx';
import logoMKA from '../../assets/logo_MKA.png';

export function PublicLayout({ children, activeRoute, onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeRoute]);


  const NAV_LINKS = [
    { label: t('home') || 'Home', route: currentUser ? '/home' : '/' },
    { label: t('explore') || 'Explore', route: '/explore' },
    { label: t('about') || 'About Us', route: '/about' },
    { label: t('communityGuidelines') || 'Guidelines', route: '/community-guidelines' },
    { label: 'Privacy Policy', route: '/privacy-policy' },
    { label: 'Contact', route: '/contact' },
  ];

  return (
    <div className="app-container" style={{ background: '#FFF8F2', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* ── Public Dark Header ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#080A18',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          padding: '0 16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {/* LEFT: Logo & Brand */}
          <div
            onClick={() => onNavigate(currentUser ? '/home' : '/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          >
            <img
              src={logoMKA}
              alt="AwajManki Logo"
              style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
            />
            <span
              className="brand-name"
              style={{ fontSize: '20px', fontWeight: 700, color: '#FFF8F2', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
            >
              AwajManki
            </span>
          </div>

          {/* CENTER: Nav Links — desktop only */}
          <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {NAV_LINKS.map((link) => {
              const isActive = activeRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => onNavigate(link.route)}
                  style={{
                    fontSize: '13.5px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#F2B08D' : '#FFF8F2',
                    background: 'transparent',
                    border: 'none',
                    padding: '6px 0',
                    cursor: 'pointer',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '2px', backgroundColor: '#F2B08D', borderRadius: '1px' }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Action buttons + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Desktop action buttons */}
            {currentUser ? (
              <button
                type="button"
                onClick={() => onNavigate('/home')}
                className="desktop-only"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: '#63344F', color: '#FFF8F2',
                  border: 'none', padding: '8px 16px', borderRadius: '20px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Home size={14} />
                Feed
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="desktop-only"
                  style={{
                    backgroundColor: 'transparent', color: '#FFF8F2',
                    border: 'none', padding: '7px 14px',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  style={{
                    backgroundColor: '#F2B08D', color: '#17151A',
                    border: 'none', padding: '8px 16px', borderRadius: '20px',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Get Started
                </button>
              </>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#FFF8F2',
                padding: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div
            className="mobile-only"
            style={{
              background: '#0D1025',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              padding: '12px 16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.route}
                onClick={() => { setMobileMenuOpen(false); onNavigate(link.route); }}
                style={{
                  fontSize: '15px',
                  fontWeight: activeRoute === link.route ? 700 : 500,
                  color: activeRoute === link.route ? '#F2B08D' : '#FFF8F2',
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  width: '100%',
                }}
              >
                {link.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '12px', display: 'flex', gap: '10px' }}>
              {currentUser ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('/home'); }}
                  style={{
                    flex: 1, backgroundColor: '#63344F', color: '#FFF8F2',
                    border: 'none', padding: '10px 16px', borderRadius: '20px',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Go to Feed
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('/login'); }}
                    style={{
                      flex: 1, backgroundColor: 'transparent', color: '#FFF8F2',
                      border: '1px solid rgba(255,255,255,0.3)', padding: '10px 16px', borderRadius: '20px',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('/register'); }}
                    style={{
                      flex: 1, backgroundColor: '#F2B08D', color: '#17151A',
                      border: 'none', padding: '10px 16px', borderRadius: '20px',
                      fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main style={{ flex: 1, overflowX: 'hidden' }}>{children}</main>
      <Footer onNavigate={onNavigate} />
      {activeRoute !== '/music' && <MoodMusicWidget />}
    </div>
  );
}
