import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export function PulseImageLightbox({ isOpen, imageUrl, altText, caption, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="pulse-lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Image Preview"
      onClick={onClose}
    >
      <div className="pulse-lightbox-container" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="pulse-lightbox-close-btn"
          onClick={onClose}
          aria-label="Close image preview"
        >
          <X size={20} />
        </button>

        <div className="pulse-lightbox-image-wrap">
          <img
            src={imageUrl}
            alt={altText || 'Pulse Article Image'}
            className="pulse-lightbox-img"
          />
        </div>

        {caption && (
          <div className="pulse-lightbox-caption">
            <p>{caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
