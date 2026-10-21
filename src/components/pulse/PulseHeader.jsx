import React from 'react';
import { Flame } from 'lucide-react';

export const BACKEND_CATEGORIES = [
  { id: 'ALL', label: 'All News', apiTopic: null },
  { id: 'GENERAL_NEWS', label: 'General News', apiTopic: 'GENERAL_NEWS' },
  { id: 'SPORTS', label: 'Sports', apiTopic: 'SPORTS' },
  { id: 'ENTERTAINMENT', label: 'Entertainment', apiTopic: 'ENTERTAINMENT' },
  { id: 'TECHNOLOGY', label: 'Technology', apiTopic: 'TECHNOLOGY' },
];

export function PulseHeader({ selectedCategory = 'ALL', onSelectCategory }) {
  return (
    <div className="pulse-header-wrap">
      {/* Top Introduction Row */}
      <div className="pulse-intro-row">
        {/* Left: Branding & Tagline */}
        <div className="pulse-intro-left">
          <div className="pulse-header-icon-box">
            <Flame size={26} className="pulse-header-flame" />
          </div>
          <div className="pulse-header-text">
            <h1 className="pulse-main-title">Awaaj Pulse</h1>
            <p className="pulse-main-subtitle">Beyond the headline. Into the conversation.</p>
          </div>
        </div>

        {/* Right: Static India News Badge & Perspective Subtitle */}
        <div className="pulse-intro-right">
          <div className="pulse-region-badge" title="National coverage of verified stories across India">
            <svg className="pulse-region-flag-svg" viewBox="0 0 640 480" width="18" height="13" aria-hidden="true">
              <path fill="#f93" d="M0 0h640v160H0z"/>
              <path fill="#fff" d="M0 160h640v160H0z"/>
              <path fill="#128807" d="M0 320h640v160H0z"/>
              <g transform="matrix(3.2 0 0 3.2 320 240)">
                <circle r="20" fill="none" stroke="#000080" strokeWidth="2"/>
                <circle r="3.5" fill="#000080"/>
                <g id="d">
                  <g id="c">
                    <g id="b">
                      <g id="a">
                        <line x1="0" y1="0" x2="0" y2="-20" stroke="#000080" strokeWidth="0.8"/>
                      </g>
                      <use href="#a" transform="rotate(15)"/>
                    </g>
                    <use href="#b" transform="rotate(30)"/>
                  </g>
                  <use href="#c" transform="rotate(60)"/>
                </g>
                <use href="#d" transform="rotate(120)"/>
                <use href="#d" transform="rotate(240)"/>
              </g>
            </svg>
            <span className="pulse-region-label">India News</span>
          </div>
          <span className="pulse-tagline">News. People. Perspectives. Anonymously.</span>
        </div>
      </div>

      {/* Category Navigation Pills Row */}
      <div className="pulse-category-pills-bar">
        {BACKEND_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`pulse-category-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
