import React from 'react';
import { Disc, Users, Music2 } from 'lucide-react';
import heroArtwork from '../../assets/music/hero-music-banner.jpg';

export function PremiumHeroBanner({ view = 'browse', onViewChange }) {
  return (
    <section className="premium-music-hero" aria-labelledby="music-hero-headline">
      <div className="premium-music-hero-bg">
        <img
          src={heroArtwork}
          alt="Music for Every Mood"
          className="premium-music-hero-img"
          draggable="false"
        />
        <div className="premium-music-hero-gradient-overlay" />
      </div>

      {/* Compact Secondary Navigation Tabs (Takes 0 vertical space) */}
      {onViewChange && (
        <nav className="premium-hero-nav-pills" aria-label="Music navigation">
          <button
            type="button"
            className={`premium-hero-pill ${view === 'browse' ? 'active' : ''}`}
            onClick={() => onViewChange('browse')}
          >
            <Disc size={13} /> Discover
          </button>
          <button
            type="button"
            className={`premium-hero-pill ${view === 'community' ? 'active' : ''}`}
            onClick={() => onViewChange('community')}
          >
            <Users size={13} /> Community
          </button>
          <button
            type="button"
            className={`premium-hero-pill ${view === 'mine' ? 'active' : ''}`}
            onClick={() => onViewChange('mine')}
          >
            <Music2 size={13} /> My Uploads
          </button>
        </nav>
      )}

      <div className="premium-music-hero-content">
        <span className="premium-music-hero-eyebrow">YOUR MUSIC, YOUR MOMENT</span>
        <h1 id="music-hero-headline" className="premium-music-hero-title">
          Music for <span className="premium-music-hero-gradient-text">Every Mood</span>
        </h1>
        <p className="premium-music-hero-subtitle">
          Pick a mood and start listening. Let the music understand you.
        </p>
      </div>
    </section>
  );
}
