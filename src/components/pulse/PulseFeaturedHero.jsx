import React, { useState, useEffect } from 'react';
import { Flame, ArrowRight, MessageSquare, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import heroNewsBanner from '../../assets/home/hero-news-banner.jpg';
import { formatDate } from '../../utils/formatDate.js';
import { getMediaUrl } from '../../config/env.js';

export function PulseFeaturedHero({ featuredStories = [], onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState({});

  const stories = Array.isArray(featuredStories) && featuredStories.length > 0 ? featuredStories : [];

  // Auto-advance carousel every 6s unless hovered
  useEffect(() => {
    if (stories.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [stories.length, isPaused]);

  if (stories.length === 0) {
    return (
      <div className="pulse-hero-card pulse-hero-empty">
        <div className="pulse-hero-content">
          <div className="pulse-hero-badge-row">
            <span className="pulse-hero-cat-badge">
              <Flame size={13} />
              Featured Story
            </span>
          </div>
          <h2 className="pulse-hero-headline">Stay updated with Awaaj Pulse</h2>
          <p className="pulse-hero-summary">
            Discover community discussions on current news events from across India.
          </p>
        </div>
      </div>
    );
  }

  const currentStory = stories[currentIndex] || stories[0];
  const pulseId = currentStory.id;

  // Real discussions count: sum of comments and takes
  const discussionsTotal = (Number(currentStory.commentCount || 0)) + (Number(currentStory.takeCount || 0));
  const discussionsText = discussionsTotal >= 1000 
    ? `${(discussionsTotal / 1000).toFixed(1).replace(/\.0$/, '')}K discussions`
    : `${discussionsTotal} ${discussionsTotal === 1 ? 'discussion' : 'discussions'}`;

  // Topic category display
  const rawTopic = currentStory.topic || 'GENERAL_NEWS';
  const categoryLabel = rawTopic
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Image handling
  const rawImage = currentStory.imageUrl || currentStory.featuredImageUrl;
  const resolvedImage = rawImage ? getMediaUrl(rawImage) : null;
  const hasImageError = Boolean(imageErrorMap[currentStory.id]);
  const heroImageSrc = (!hasImageError && resolvedImage) ? resolvedImage : heroNewsBanner;

  // Formatted date
  const displayDate = currentStory.publishedAt 
    ? formatDate(currentStory.publishedAt) 
    : 'Recent';

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const handleReadFullStory = () => {
    if (onNavigate && pulseId) {
      onNavigate(`/pulse/${pulseId}`);
    }
  };

  return (
    <div
      className="pulse-hero-card"
      onClick={handleReadFullStory}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Featured News Story"
    >
      {/* Background Image */}
      <img
        src={heroImageSrc}
        alt={currentStory.title || 'Awaaj Pulse Featured News'}
        className="pulse-hero-bg-img"
        onError={() => setImageErrorMap((prev) => ({ ...prev, [currentStory.id]: true }))}
      />

      {/* Cinematic Vignette Overlay */}
      <div className="pulse-hero-overlay" />

      {/* Content Container */}
      <div className="pulse-hero-content" onClick={(e) => e.stopPropagation()}>
        {/* Top Badges Row */}
        <div className="pulse-hero-badge-row">
          <div className="pulse-hero-badge-left">
            <span className="pulse-hero-top-story-badge">
              <Flame size={12} className="pulse-hero-cat-flame" />
              <span>TOP STORY</span>
            </span>
            <span className="pulse-hero-cat-badge">
              <span>{categoryLabel}</span>
            </span>
          </div>
          <span className="pulse-hero-date-badge">
            <Calendar size={12} style={{ marginRight: '4px' }} />
            <span>{displayDate}</span>
          </span>
        </div>

        {/* Headline */}
        <h2 className="pulse-hero-headline" onClick={handleReadFullStory}>
          {currentStory.title}
        </h2>

        {/* Summary Description */}
        <p className="pulse-hero-summary">
          {currentStory.summary || currentStory.content}
        </p>

        {/* Bottom Actions & Carousel Controls */}
        <div className="pulse-hero-bottom-row">
          <div className="pulse-hero-cta-group">
            <button
              type="button"
              className="pulse-hero-read-btn"
              onClick={handleReadFullStory}
            >
              <span>Read Full Story</span>
              <ArrowRight size={15} />
            </button>
            <div className="pulse-hero-discussions">
              <MessageSquare size={15} className="pulse-hero-msg-icon" />
              <span>{discussionsText}</span>
            </div>
          </div>

          {/* Centered Carousel Pagination Dots */}
          <div className="pulse-hero-dots">
            {Array.from({ length: Math.max(stories.length, 5) }).slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`pulse-hero-dot ${idx === (currentIndex % 5) ? 'active' : ''}`}
                onClick={() => stories.length > idx && setCurrentIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Circular Arrows */}
          <div className="pulse-hero-arrow-btns">
            <button
              type="button"
              className="pulse-hero-arrow-btn"
              onClick={handlePrev}
              aria-label="Previous Story"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              className="pulse-hero-arrow-btn"
              onClick={handleNext}
              aria-label="Next Story"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
