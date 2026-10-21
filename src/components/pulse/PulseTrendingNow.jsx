import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import trending1IndiaGate from '../../assets/home/trending-1-india-gate.jpg';
import trending2Openai from '../../assets/home/trending-2-openai.jpg';
import trending3Isro from '../../assets/home/trending-3-isro.jpg';
import { getMediaUrl } from '../../config/env.js';

const defaultThumbs = [trending1IndiaGate, trending2Openai, trending3Isro];

function getCategoryColor(category = '') {
  const c = category.toUpperCase();
  if (c.includes('TECH')) return '#6D28D9';
  if (c.includes('SPORT') || c.includes('CRICKET')) return '#15803D';
  if (c.includes('ENTERTAIN')) return '#BE185D';
  if (c.includes('BUSI')) return '#B45309';
  return '#B91C1C';
}

export function PulseTrendingNow({ articles = [], onNavigate }) {
  // Rank up to 5 items based on real engagement score: (likes * 2) + (comments * 3) + (takes * 4)
  const sorted = [...articles].sort((a, b) => {
    const scoreA = (Number(a.likeCount || 0) * 2) + (Number(a.commentCount || 0) * 3) + (Number(a.takeCount || 0) * 4);
    const scoreB = (Number(b.likeCount || 0) * 2) + (Number(b.commentCount || 0) * 3) + (Number(b.takeCount || 0) * 4);
    return scoreB - scoreA;
  });

  const trendingList = sorted.slice(0, 5);

  if (trendingList.length === 0) return null;

  return (
    <div className="pulse-sidebar-widget">
      {/* Header */}
      <div className="pulse-widget-header">
        <div className="pulse-widget-title-wrap">
          <h3 className="pulse-widget-title">Trending Now</h3>
        </div>
        <button
          type="button"
          className="pulse-widget-view-all"
          onClick={() => onNavigate && onNavigate('/pulse')}
        >
          <span>View all</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 5 Ranked Items */}
      <div className="pulse-trending-list">
        {trendingList.map((item, idx) => {
          const rank = idx + 1;
          const rawTopic = item.topic || 'GENERAL_NEWS';
          const category = rawTopic
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase());
          const categoryColor = getCategoryColor(rawTopic);

          const rawImage = item.imageUrl || item.featuredImageUrl;
          const resolvedThumb = rawImage ? getMediaUrl(rawImage) : defaultThumbs[idx % defaultThumbs.length];

          const discussionsTotal = (Number(item.commentCount || 0)) + (Number(item.takeCount || 0));
          const discussionsText = discussionsTotal >= 1000
            ? `${(discussionsTotal / 1000).toFixed(1).replace(/\.0$/, '')}K discussions`
            : `${discussionsTotal} discussions`;

          const publisher = item.sourceName || 'Editorial Wire';

          return (
            <div
              key={item.id || rank}
              className="pulse-trending-item"
              onClick={() => onNavigate && onNavigate(`/pulse/${item.id}`)}
              title={item.title}
            >
              <span className="pulse-trending-rank">{rank}</span>

              <img
                src={resolvedThumb}
                alt={item.title}
                className="pulse-trending-thumb"
                onError={(e) => {
                  e.currentTarget.src = defaultThumbs[idx % defaultThumbs.length];
                }}
              />

              <div className="pulse-trending-info">
                <span className="pulse-trending-cat" style={{ color: categoryColor }}>
                  {category}
                </span>
                <h4 className="pulse-trending-headline">{item.title}</h4>
                <span className="pulse-trending-meta">
                  {publisher} • {discussionsText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
