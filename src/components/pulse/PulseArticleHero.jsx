import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { getMediaUrl } from '../../config/env.js';
import heroFallback from '../../assets/home/hero-news-banner.jpg';

export function PulseArticleHero({ article, onExpandImage }) {
  const [imageError, setImageError] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!article) return null;

  const rawImage = article.imageUrl ? getMediaUrl(article.imageUrl) : null;
  const imageSrc = !imageError && rawImage ? rawImage : heroFallback;

  // Data Integrity: ONLY display caption if verified article caption exists. Never invent text.
  const captionText = (article.caption || '').trim();

  const gallery = Array.isArray(article.galleryImages) && article.galleryImages.length > 0
    ? article.galleryImages
    : (Array.isArray(article.images) && article.images.length > 0 ? article.images : (rawImage ? [rawImage] : []));

  const totalImages = Math.max(1, gallery.length);
  const currentImageSrc = gallery[activeImageIdx] ? getMediaUrl(gallery[activeImageIdx]) : imageSrc;

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  };

  return (
    <figure className="pulse-article-hero-wrap">
      <div className="pulse-article-hero-media">
        <img
          src={currentImageSrc}
          alt={article.title || 'Pulse Article Headline'}
          className="pulse-article-hero-img"
          loading="eager"
          onError={() => setImageError(true)}
          onClick={onExpandImage}
        />

        {/* Top-Right Expand Button Overlay for Lightbox */}
        <button
          type="button"
          className="pulse-article-expand-btn"
          onClick={onExpandImage}
          aria-label="Expand image to fullscreen"
          title="View full resolution"
        >
          <Maximize2 size={16} />
        </button>

        {/* Bottom-Right Image Counter Pill */}
        {totalImages >= 1 && (
          <div className="pulse-article-image-counter-pill" aria-label="Image gallery position">
            <button
              type="button"
              className="pulse-counter-nav-btn"
              onClick={handlePrev}
              title="Previous image"
              aria-label="Previous image"
            >
              ‹
            </button>
            <span className="pulse-counter-text">
              {activeImageIdx + 1} / {totalImages}
            </span>
            <button
              type="button"
              className="pulse-counter-nav-btn"
              onClick={handleNext}
              title="Next image"
              aria-label="Next image"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Editorial Caption - only rendered if genuine caption text exists */}
      {captionText ? (
        <figcaption className="pulse-article-hero-caption">
          {captionText}
        </figcaption>
      ) : null}
    </figure>
  );
}
