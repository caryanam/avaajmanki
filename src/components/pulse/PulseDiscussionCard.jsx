import React, { useState } from 'react';
import {
  Flame,
  MessageSquare,
  Feather,
  ExternalLink,
  ArrowRight,
  Clock,
  Heart,
  Share2,
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { apiPulseService } from '../../services/apiPulseService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function PulseDiscussionCard({ item, onNavigate }) {
  if (!item) return null;

  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const pulseId = item.id;
  const topicName = (item.topic || 'POLITICS').toUpperCase();

  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(item.likeCount || 0));

  const handleCardClick = () => {
    if (onNavigate && pulseId) {
      onNavigate(`/pulse/${pulseId}`);
    }
  };

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      addToast('Please log in to react to Pulse stories.', 'error');
      return;
    }

    const nextState = !hasLiked;
    setHasLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await apiPulseService.toggleLikePulseItem(pulseId);
    } catch (err) {
      setHasLiked(!nextState);
      setLikeCount((prev) => (nextState ? Math.max(0, prev - 1) : prev + 1));
      addToast('Could not record reaction.', 'error');
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/pulse/${pulseId}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.summary,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      addToast('Story link copied to clipboard!', 'success');
    }
  };

  return (
    <article
      className="pulse-discussion-feed-card"
      onClick={handleCardClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1.5px solid rgba(111, 64, 95, 0.14)',
        boxShadow: '0 6px 22px rgba(45, 29, 21, 0.05)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--deep-plum)';
        e.currentTarget.style.boxShadow = '0 10px 28px rgba(111, 64, 95, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(111, 64, 95, 0.14)';
        e.currentTarget.style.boxShadow = '0 6px 22px rgba(45, 29, 21, 0.05)';
      }}
    >
      {/* ── Editorial Header: Pulse Badge, Source Attribution & Time ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'linear-gradient(135deg, rgba(111, 64, 95, 0.12) 0%, rgba(217, 108, 61, 0.12) 100%)',
              color: 'var(--deep-plum)',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            <Flame size={12} color="#D96C3D" />
            <span>PULSE #{topicName}</span>
          </div>

          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--eclipse)' }}>
            via {item.sourceName || 'Wire Service'}
          </span>

          <span style={{ fontSize: '11.5px', color: 'var(--zorba)' }}>•</span>

          <span style={{ fontSize: '11.5px', color: 'var(--hurricane)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={11} /> {formatDate(item.publishedAt)}
          </span>
        </div>

        {item.sourceUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: 'var(--deep-plum)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 8px',
              borderRadius: '8px',
              background: 'rgba(111,64,95,0.05)',
            }}
          >
            Source <ExternalLink size={10} />
          </a>
        )}
      </div>

      {/* ── Headline & Summary ── */}
      <div>
        <h3
          style={{
            fontSize: '17.5px',
            fontWeight: 800,
            lineHeight: 1.35,
            color: 'var(--eclipse)',
            margin: '0 0 8px 0',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '-0.01em',
          }}
        >
          {item.title}
        </h3>

        <p
          style={{
            fontSize: '13.5px',
            lineHeight: 1.5,
            color: 'var(--hurricane)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.summary || item.content}
        </p>
      </div>

      {/* ── Bottom Action & Engagement Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(111, 64, 95, 0.08)',
          paddingTop: '12px',
          marginTop: '4px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12.5px', color: 'var(--hurricane)' }}>
          <button
            type="button"
            onClick={handleToggleLike}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: hasLiked ? '#D96C3D' : 'var(--hurricane)',
              fontWeight: 600,
              fontSize: '12.5px',
            }}
          >
            <Heart size={14} fill={hasLiked ? '#D96C3D' : 'none'} color={hasLiked ? '#D96C3D' : 'currentColor'} />
            <span>{likeCount}</span>
          </button>

          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <MessageSquare size={14} color="var(--deep-plum)" />
            <span>{item.commentCount || 0}</span>
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Feather size={14} color="#D96C3D" />
            <span>{item.takeCount || 0} takes</span>
          </span>

          <button
            type="button"
            onClick={handleShare}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--hurricane)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Share story"
          >
            <Share2 size={13} />
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          style={{
            background: 'var(--deep-plum)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '20px',
            padding: '7px 16px',
            fontSize: '12.5px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
            boxShadow: '0 2px 8px rgba(111,64,95,0.22)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--deep-plum-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--deep-plum)')}
        >
          <span>Join Discussion</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </article>
  );
}
