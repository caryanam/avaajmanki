import React, { useState } from 'react';
import { MessageSquare, Feather, ArrowRight, Clock, Flame } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { getMediaUrl } from '../../config/env.js';

export function PulseFeaturedCard({ pulseItem, onNavigate }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!pulseItem) return null;

  const topicName = (pulseItem.topic || 'POLITICS').toUpperCase();
  const pulseId = pulseItem.id;
  const rawImageUrl = pulseItem.imageUrl || pulseItem.featuredImageUrl;
  const resolvedImageUrl = rawImageUrl ? getMediaUrl(rawImageUrl) : null;
  const hasValidImage = Boolean(resolvedImageUrl && !imageError);

  const handleCardClick = () => {
    if (onNavigate && pulseId) {
      onNavigate(`/pulse/${pulseId}`);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '350px',
        maxWidth: '85vw',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: isHovered
          ? '1.5px solid var(--deep-plum, #6F405F)'
          : '1.5px solid rgba(111, 64, 95, 0.12)',
        boxShadow: isHovered
          ? '0 12px 28px rgba(111, 64, 95, 0.14)'
          : '0 6px 20px rgba(45, 29, 21, 0.05)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── 1. PREMIUM EDITORIAL FEATURED IMAGE (16:9) ── */}
      {hasValidImage ? (
        <div
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            position: 'relative',
            backgroundColor: '#F3EFEF',
            overflow: 'hidden',
            borderTopLeftRadius: '18px',
            borderTopRightRadius: '18px',
          }}
        >
          <img
            src={resolvedImageUrl}
            alt={pulseItem.title || 'Awaaj Pulse featured story'}
            loading="lazy"
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.35s ease',
            }}
          />
        </div>
      ) : (
        /* Graceful fallback banner when image is missing or errors */
        <div
          style={{
            width: '100%',
            height: '90px',
            background: 'linear-gradient(135deg, rgba(111, 64, 95, 0.1) 0%, rgba(217, 108, 61, 0.12) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTopLeftRadius: '18px',
            borderTopRightRadius: '18px',
            position: 'relative',
          }}
        >
          <Flame size={24} color="#D96C3D" style={{ opacity: 0.7 }} />
        </div>
      )}

      {/* ── 2. CARD CONTENT BODY ── */}
      <div
        style={{
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          gap: '12px',
        }}
      >
        <div>
          {/* Top Meta Line: Topic Badge, Source Attribution & Time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--deep-plum, #6F405F)',
                  background: 'rgba(111, 64, 95, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                #{topicName}
              </span>

              <span
                style={{
                  fontSize: '11.5px',
                  color: 'var(--hurricane, #887B75)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                via {pulseItem.sourceName || 'Editorial Wire'}
              </span>
            </div>

            <span
              style={{
                fontSize: '11px',
                color: 'var(--zorba, #A39691)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                flexShrink: 0,
              }}
            >
              <Clock size={11} /> {formatDate(pulseItem.publishedAt)}
            </span>
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '15.5px',
              fontWeight: 800,
              lineHeight: 1.35,
              color: 'var(--eclipse, #2D1D15)',
              margin: '0 0 6px 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {pulseItem.title}
          </h3>

          {/* Summary Snippet */}
          <p
            style={{
              fontSize: '12.5px',
              lineHeight: 1.45,
              color: 'var(--hurricane, #887B75)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {pulseItem.summary || pulseItem.content}
          </p>
        </div>

        {/* ── 3. BOTTOM ENGAGEMENT BAR & ACTION BUTTON ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(111, 64, 95, 0.08)',
            paddingTop: '12px',
            marginTop: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontSize: '12px',
              color: 'var(--hurricane, #887B75)',
            }}
          >
            <span
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
              title="Comments"
            >
              <MessageSquare size={13} color="var(--deep-plum, #6F405F)" />
              {pulseItem.commentCount || 0}
            </span>
            <span
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
              title="Community Takes"
            >
              <Feather size={13} color="#D96C3D" />
              {pulseItem.takeCount || 0} takes
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            style={{
              background: 'var(--deep-plum, #6F405F)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              boxShadow: '0 2px 8px rgba(111,64,95,0.2)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--deep-plum-hover, #532F47)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--deep-plum, #6F405F)')}
          >
            Join Discussion
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
