import React from 'react';
import { ArrowRight, CloudRain, Heart, Sparkles, Zap } from 'lucide-react';
import romanticArtwork from '../../assets/music/moods/op1.webp';
import sadArtwork from '../../assets/music/moods/op2.webp';
import energeticArtwork from '../../assets/music/moods/op3.webp';
import allArtwork from '../../assets/music/moods/op4.webp';

export const PREMIUM_MOODS = [
  {
    id: 'romantic',
    apiMood: 'ROMANTIC',
    title: 'Feeling Romantic',
    subtitle: 'Soft, soulful and full of feeling.',
    icon: Heart,
    iconColor: '#FF2E93',
    badgeBg: 'rgba(255, 235, 245, 0.95)',
    artwork: romanticArtwork,
    artworkPos: 'center 75%',
  },
  {
    id: 'sad',
    apiMood: 'SAD',
    title: 'A Little Low',
    subtitle: 'Gentle music for quieter moments.',
    icon: CloudRain,
    iconColor: '#3B82F6',
    badgeBg: 'rgba(235, 243, 255, 0.95)',
    artwork: sadArtwork,
    artworkPos: 'center 75%',
  },
  {
    id: 'energetic',
    apiMood: 'ENERGETIC',
    title: 'Need Some Energy',
    subtitle: 'Turn it up and lift the mood.',
    icon: Zap,
    iconColor: '#FF7A29',
    badgeBg: 'rgba(255, 242, 232, 0.95)',
    artwork: energeticArtwork,
    artworkPos: 'center 60%',
  },
  {
    id: 'all',
    apiMood: null,
    title: 'Play Anything',
    subtitle: 'No choices. Just let the music flow.',
    icon: Sparkles,
    iconColor: '#A855F7',
    badgeBg: 'rgba(246, 237, 255, 0.95)',
    artwork: allArtwork,
    artworkPos: 'center center',
  },
];

export function PremiumMoodCards({ selectedMood, onSelectMood }) {
  return (
    <section className="premium-mood-cards-section" aria-label="Music Mood Categories">
      <div className="premium-mood-cards-grid">
        {PREMIUM_MOODS.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.apiMood;

          return (
            <button
              key={mood.id}
              type="button"
              className={`premium-mood-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectMood(mood.apiMood)}
              aria-pressed={isSelected}
              data-mood-id={mood.id}
            >
              <div className="premium-mood-card-media">
                <img
                  src={mood.artwork}
                  alt={mood.title}
                  style={{ objectPosition: mood.artworkPos }}
                  draggable="false"
                  loading="lazy"
                />
                <div className="premium-mood-card-overlay" />
              </div>

              {/* Top-left icon badge */}
              <div
                className="premium-mood-card-badge"
                style={{ background: mood.badgeBg, color: mood.iconColor }}
                aria-hidden="true"
              >
                <Icon size={18} strokeWidth={2.4} fill={mood.id === 'romantic' ? 'currentColor' : 'none'} />
              </div>

              {/* Bottom copy and action */}
              <div className="premium-mood-card-footer">
                <div className="premium-mood-card-copy">
                  <h3 className="premium-mood-card-title">{mood.title}</h3>
                  <p className="premium-mood-card-subtitle">{mood.subtitle}</p>
                </div>
                <div className="premium-mood-card-action" aria-hidden="true">
                  <ArrowRight size={16} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
