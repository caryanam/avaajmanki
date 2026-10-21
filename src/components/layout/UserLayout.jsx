import React from 'react';
import { AppHeader } from './AppHeader.jsx';
import { DesktopSidebar } from './DesktopSidebar.jsx';
import { MobileNavigation } from './MobileNavigation.jsx';
import '../../styles/home.css';

export function UserLayout({ children, activeRoute, onNavigate, wide = true }) {
  const currentPath = (activeRoute || (typeof window !== 'undefined' ? window.location.pathname : '') || '').toLowerCase();

  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [activeRoute, typeof window !== 'undefined' ? window.location.pathname : '']);

  return (
    <div className="home-page-root">
      {/* ── 1. UNIFIED APP HEADER (Identical to Explore & Home) ── */}
      <AppHeader onNavigate={onNavigate} />

      {/* ── 2. UNIFIED DESKTOP GRID LAYOUT ── */}
      <div className="shared-app-desktop-grid">
        {/* Column 1: Shared Left Sidebar (Identical to Explore & Home) */}
        <DesktopSidebar
          activeRoute={activeRoute || currentPath}
          onNavigate={onNavigate}
        />

        {/* Column 2: Main Content Area */}
        <main className={wide ? 'shared-main-content-wide' : 'shared-main-content'}>
          {children}
        </main>
      </div>

      {/* ── 3. MOBILE NAVIGATION ── */}
      <MobileNavigation activeRoute={activeRoute || currentPath} onNavigate={onNavigate} />
    </div>
  );
}
