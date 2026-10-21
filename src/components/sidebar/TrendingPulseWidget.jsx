import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiPulseService } from '../../services/apiPulseService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import trending1IndiaGate from '../../assets/home/trending-1-india-gate.jpg';
import trending2Openai from '../../assets/home/trending-2-openai.jpg';
import trending3Isro from '../../assets/home/trending-3-isro.jpg';

export function TrendingPulseWidget({ onNavigate }) {
  const { t } = useLanguage();
  const { data: rawItems = [] } = useQuery({
    queryKey: ['pulse-trending-widget'],
    queryFn: async () => {
      try {
        const res = await apiPulseService.getFeaturedPulseItems(10);
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error('Trending pulse fetch error:', err);
        return [];
      }
    },
    staleTime: 60000,
  });

  // Calculate engagement score and take top 3
  const sortedItems = [...rawItems].sort((a, b) => {
    const scoreA = (Number(a.likeCount || 0) * 2) + (Number(a.commentCount || 0) * 3) + (Number(a.takeCount || 0) * 4);
    const scoreB = (Number(b.likeCount || 0) * 2) + (Number(b.commentCount || 0) * 3) + (Number(b.takeCount || 0) * 4);
    return scoreB - scoreA;
  });

  // Fallback items matching the design reference when no real items exist
  const fallbackItems = [
    {
      id: 1,
      title: "India's next phase of urban growth and what it means...",
      sourceName: "Times of India",
      topic: "Politics",
      discussions: "2.4K discussions",
      imageUrl: trending1IndiaGate,
    },
    {
      id: 2,
      title: "OpenAI's new model surprises the industry",
      sourceName: "Business Today",
      topic: "Technology",
      discussions: "1.8K discussions",
      imageUrl: trending2Openai,
    },
    {
      id: 3,
      title: "ISRO's next big leap: What to expect from Gaganyaan",
      sourceName: "The Hindu",
      topic: "Science",
      discussions: "1.6K discussions",
      imageUrl: trending3Isro,
    },
  ];

  const defaultThumbs = [trending1IndiaGate, trending2Openai, trending3Isro];
  const displayList = sortedItems.length >= 3 ? sortedItems.slice(0, 3) : (sortedItems.length > 0 ? sortedItems : fallbackItems);

  const getCategoryBadgeStyle = (cat) => {
    const c = String(cat || '').toUpperCase();
    if (c.includes('POLITIC')) return { background: '#FCE7F3', color: '#BE185D' };
    if (c.includes('TECH')) return { background: '#EDE9FE', color: '#6D28D9' };
    if (c.includes('SCI')) return { background: '#E0F2FE', color: '#0284C7' };
    if (c.includes('ENTERTAIN')) return { background: '#FAF5FF', color: '#9333EA' };
    if (c.includes('HEALTH') || c.includes('SPORT')) return { background: '#ECFDF5', color: '#059669' };
    return { background: '#F1F5F9', color: '#475569' };
  };

  return (
    <div className="sidebar-widget-card">
      <div className="widget-header">
        <h3 className="widget-title">{t('topic.trendingInPulse', 'Trending in Awaaj Pulse')}</h3>
        <button
          type="button"
          className="widget-view-all"
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={() => onNavigate('/pulse')}
        >
          <span>{t('topic.viewAll', 'View all')}</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="trending-list">
        {displayList.map((item, idx) => {
          const rank = idx + 1;
          const category = (item.topic || 'General').charAt(0).toUpperCase() + (item.topic || 'General').slice(1).toLowerCase();
          const discussionsCount = (item.commentCount || 0) + (item.takeCount || 0);
          const discussionsText = item.discussions || t('topic.discussionsCount', '{{count}} discussions', { count: discussionsCount });
          const thumb = item.imageUrl || defaultThumbs[idx % 3];

          return (
            <div
              key={item.id || rank}
              className="trending-item"
              onClick={() => onNavigate(item.id ? `/pulse/${item.id}` : '/pulse')}
            >
              <span className="trending-rank">{rank}</span>
              <img
                src={thumb}
                alt={item.title}
                className="trending-thumb"
                onError={(e) => {
                  e.currentTarget.src = defaultThumbs[idx % 3];
                }}
              />
              <div className="trending-info">
                <span className="trending-category-badge" style={getCategoryBadgeStyle(category)}>
                  {category}
                </span>
                <h4 className="trending-title">{item.title}</h4>
                <span className="trending-meta">
                  {item.sourceName || t('topic.editorialWire', 'Editorial Wire')} • {discussionsText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
