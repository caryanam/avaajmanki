import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import techSmartwatch from '../../assets/home/tech-smartwatch.svg';
import techFallback from '../../assets/home/tech-fallback.svg';
import trending2Openai from '../../assets/home/trending-2-openai.jpg';
import trending3Isro from '../../assets/home/trending-3-isro.jpg';

// Structured spotlight items (technology innovations, AI tools, and wearables)
const SPOTLIGHT_ITEMS = [
  {
    id: 'spotlight_1',
    badge: 'In Focus',
    title: 'Apple Watch Series 10',
    description: 'Health insights that keep you ahead.',
    actionText: 'Explore Feature',
    imageUrl: techSmartwatch,
    fallbackImg: techSmartwatch,
    topic: 'TECHNOLOGY',
    destination: '/pulse?topic=TECHNOLOGY',
  },
  {
    id: 'spotlight_2',
    badge: 'AI Innovation',
    title: 'OpenAI Next-Gen Models',
    description: 'Deep reasoning and multimodal capabilities for everyday tasks.',
    actionText: 'Read Analysis',
    imageUrl: trending2Openai,
    fallbackImg: techFallback,
    topic: 'TECHNOLOGY',
    destination: '/pulse?topic=TECHNOLOGY',
  },
  {
    id: 'spotlight_3',
    badge: 'Space Tech',
    title: 'ISRO Next-Gen Vehicle',
    description: 'Heavier payloads strengthening space capabilities.',
    actionText: 'Explore Mission',
    imageUrl: trending3Isro,
    fallbackImg: techFallback,
    topic: 'TECHNOLOGY',
    destination: '/pulse?topic=TECHNOLOGY',
  },
  {
    id: 'spotlight_4',
    badge: 'Next-Gen Tech',
    title: 'Smart Computing & Chips',
    description: 'Energy-efficient silicon powering modern devices.',
    actionText: 'Explore Devices',
    imageUrl: techFallback,
    fallbackImg: techFallback,
    topic: 'TECHNOLOGY',
    destination: '/pulse?topic=TECHNOLOGY',
  },
];

export function PulseTechnologySpotlight({ onSelectCategory, onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imgErrorMap, setImgErrorMap] = useState({});

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SPOTLIGHT_ITEMS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = SPOTLIGHT_ITEMS[currentIndex];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + SPOTLIGHT_ITEMS.length) % SPOTLIGHT_ITEMS.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % SPOTLIGHT_ITEMS.length);
  };

  const handleAction = () => {
    if (onSelectCategory) {
      onSelectCategory('TECHNOLOGY');
    } else if (onNavigate) {
      onNavigate('/pulse');
    }
  };

  const hasError = imgErrorMap[current.id];
  const imageSrc = hasError ? current.fallbackImg : (current.imageUrl || current.fallbackImg);

  return (
    <div
      className="pulse-spotlight-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Technology Spotlight"
    >
      {/* Top Header Row */}
      <div className="pulse-spotlight-header">
        <h3 className="pulse-spotlight-heading">Technology Spotlight</h3>
        <span className="pulse-spotlight-badge">
          {current.badge}
        </span>
      </div>

      {/* Main Content & Product Visual Grid */}
      <div className="pulse-spotlight-body">
        <div className="pulse-spotlight-text-col">
          <h3 className="pulse-spotlight-title">{current.title}</h3>
          <p className="pulse-spotlight-desc">{current.description}</p>
          <button
            type="button"
            className="pulse-spotlight-action-btn"
            onClick={handleAction}
          >
            <span>{current.actionText}</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="pulse-spotlight-media-col">
          <img
            src={imageSrc}
            alt={current.title}
            className="pulse-spotlight-img"
            onError={() => setImgErrorMap((prev) => ({ ...prev, [current.id]: true }))}
          />
        </div>
      </div>

      {/* Bottom Controls: Dots & Navigation Arrows */}
      <div className="pulse-spotlight-controls">
        <div className="pulse-spotlight-dots">
          {SPOTLIGHT_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={`pulse-spotlight-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="pulse-spotlight-arrow-btns">
          <button
            type="button"
            className="pulse-spotlight-nav-btn"
            onClick={handlePrev}
            aria-label="Previous spotlight"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            className="pulse-spotlight-nav-btn"
            onClick={handleNext}
            aria-label="Next spotlight"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
