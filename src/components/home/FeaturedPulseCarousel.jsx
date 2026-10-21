import React, { useState, useEffect } from 'react';
import { Flame, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiPulseService } from '../../services/apiPulseService.js';
import heroNewsBanner from '../../assets/home/hero-news-banner.jpg';

export function FeaturedPulseCarousel({ onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrorMap, setImageErrorMap] = useState({});

  const { data: rawItems = [] } = useQuery({
    queryKey: ['pulse-featured-home'],
    queryFn: async () => {
      try {
        const res = await apiPulseService.getFeaturedPulseItems(10);
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error('Featured pulse fetch failed:', e);
        return [];
      }
    },
    staleTime: 60000,
  });

  // Default fallback story matching the approved design reference
  const fallbackStory = {
    id: 1,
    title: "India's next phase of urban growth and what it means for young India",
    summary: "A look at the opportunities, challenges, and the voices from across the country.",
    topic: "POLITICS",
    imageUrl: heroNewsBanner,
  };

  const stories = rawItems.length > 0 ? rawItems : [fallbackStory];

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    if (stories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [stories.length]);

  const currentStory = stories[currentIndex] || stories[0];
  const topicLabel = (currentStory.topic || 'POLITICS').charAt(0).toUpperCase() + (currentStory.topic || 'POLITICS').slice(1).toLowerCase();

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const handleReadFullStory = () => {
    if (currentStory.id) {
      onNavigate(`/pulse/${currentStory.id}`);
    } else {
      onNavigate('/pulse');
    }
  };

  const hasImgError = imageErrorMap[currentStory.id];
  const displayImage = (!hasImgError && currentStory.imageUrl) ? currentStory.imageUrl : heroNewsBanner;

  return (
    <div className="hero-carousel-card" onClick={handleReadFullStory} style={{ cursor: 'pointer' }}>
      <img
        src={displayImage}
        alt={currentStory.title}
        className="hero-carousel-bg"
        onError={() => setImageErrorMap((prev) => ({ ...prev, [currentStory.id]: true }))}
      />
      <div className="hero-carousel-overlay" />

      <div className="hero-carousel-content" onClick={(e) => e.stopPropagation()}>
        {/* Top Badges */}
        <div className="hero-badges-row">
          <div className="hero-pulse-badge">
            <Flame size={13} color="#FF6B9D" />
            <span>Awaaj Pulse</span>
          </div>
          <span className="hero-category-badge">{topicLabel}</span>
        </div>

        {/* Headline & Summary */}
        <h2 className="hero-headline">{currentStory.title}</h2>
        <p className="hero-summary">{currentStory.summary || currentStory.content}</p>

        {/* Bottom Action Bar */}
        <div className="hero-bottom-row">
          <button
            type="button"
            className="hero-read-btn"
            onClick={handleReadFullStory}
          >
            <span>Read Full Story</span>
            <ArrowRight size={14} />
          </button>

          {/* Carousel Navigation */}
          {stories.length > 1 && (
            <div className="hero-controls">
              <div className="hero-dots">
                {stories.map((s, idx) => (
                  <button
                    key={s.id || idx}
                    type="button"
                    className={`hero-dot ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="hero-nav-arrow"
                onClick={handlePrev}
                aria-label="Previous story"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="hero-nav-arrow"
                onClick={handleNext}
                aria-label="Next story"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
