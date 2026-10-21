import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiPulseService } from '../../services/apiPulseService.js';
import { PulseFeaturedCard } from './PulseFeaturedCard.jsx';
import { PulseCardSkeleton } from './PulseCardSkeleton.jsx';
import { Newspaper, ChevronLeft, ChevronRight, Flame, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function HappeningNowSection({ onNavigate }) {
  const { t } = useLanguage();
  const scrollContainerRef = useRef(null);

  const {
    data: featuredItems = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['pulse-featured'],
    queryFn: async () => {
      return await apiPulseService.getFeaturedPulseItems(10);
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // If error and no data, or if loaded and empty, handle gracefully
  if (!isLoading && (isError || featuredItems.length === 0)) {
    return null; // Keep HomePage uncluttered if no featured editorial pulse is live
  }

  return (
    <section
      aria-label="Happening Now in India"
      style={{
        width: '100%',
        marginBottom: '28px',
        position: 'relative',
      }}
    >
      {/* ── Section Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          padding: '0 4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(111, 64, 95, 0.15) 0%, rgba(217, 108, 61, 0.15) 100%)',
              color: 'var(--deep-plum)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(111,64,95,0.08)',
            }}
          >
            <Flame size={19} color="#D96C3D" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#2D1D15',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Happening Now in India
              </h2>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: 'linear-gradient(135deg, #6F405F 0%, #D96C3D 100%)',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                LIVE PULSE
              </span>
            </div>
            <p
              style={{
                fontSize: '12.5px',
                color: 'var(--hurricane)',
                margin: '2px 0 0 0',
                fontWeight: 500,
              }}
            >
              Verified national topics & public perspectives shaping conversation today
            </p>
          </div>
        </div>

        {/* Carousel Arrow Controls (Desktop) */}
        {!isLoading && featuredItems.length > 2 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Previous pulse story"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1.5px solid rgba(111,64,95,0.15)',
                color: '#2D1D15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--deep-plum)';
                e.currentTarget.style.color = 'var(--deep-plum)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(111,64,95,0.15)';
                e.currentTarget.style.color = '#2D1D15';
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Next pulse story"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1.5px solid rgba(111,64,95,0.15)',
                color: '#2D1D15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--deep-plum)';
                e.currentTarget.style.color = 'var(--deep-plum)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(111,64,95,0.15)';
                e.currentTarget.style.color = '#2D1D15';
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ── Horizontal Scrollable Carousel Container ── */}
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          paddingBottom: '10px',
          paddingTop: '2px',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {isLoading ? (
          <>
            <PulseCardSkeleton />
            <PulseCardSkeleton />
            <PulseCardSkeleton />
          </>
        ) : (
          featuredItems.map((item) => (
            <div
              key={item.id || item.formattedId}
              style={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
              }}
            >
              <PulseFeaturedCard pulseItem={item} onNavigate={onNavigate} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
