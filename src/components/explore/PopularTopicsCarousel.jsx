import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { PopularTopicCard } from './PopularTopicCard.jsx';

export function PopularTopicsCarousel({ topics = [], onSelectTopic, onViewAll }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = trackRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [topics]);

  const handleScroll = (direction) => {
    if (!trackRef.current) return;
    const clientW = trackRef.current.clientWidth || 380;
    const scrollAmount = Math.max(280, Math.floor(clientW * 0.75));
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!topics || topics.length === 0) return null;

  return (
    <section className="popular-topics-section" aria-label="Popular Topics">
      <div className="section-header-row">
        {/* Left: Icon Badge, Title, and Subtitle */}
        <div className="popular-topics-heading-group">
          <div className="popular-topics-title-line">
            <span className="popular-topics-icon-circle">
              <Compass size={16} color="#E11D48" />
            </span>
            <h3 className="section-title">Popular Topics</h3>
          </div>
          <p className="popular-topics-subtitle">
            Explore the most active and meaningful topics.
          </p>
        </div>

        {/* Right: View all link & Navigation Chevrons */}
        <div className="carousel-nav-controls">
          <button
            type="button"
            className="carousel-view-all-btn"
            onClick={onViewAll}
          >
            <span>View all</span>
            <span aria-hidden="true">&rarr;</span>
          </button>

          <div className="carousel-nav-arrows">
            <button
              type="button"
              className="carousel-arrow-btn"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous topics"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="carousel-arrow-btn"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Next topics"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={`popular-topics-track ${topics.length <= 4 ? 'few-cards' : ''}`} ref={trackRef}>
        {topics.map((topic) => (
          <PopularTopicCard
            key={topic.uniqueKey || (topic.isCustom ? `custom-${topic.id}` : `canonical-${topic.id}`)}
            topic={topic}
            onClick={onSelectTopic}
          />
        ))}
      </div>
    </section>
  );
}
