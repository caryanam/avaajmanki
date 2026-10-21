import React from 'react';
import { ArrowRight, Newspaper, Film, Trophy, Cpu } from 'lucide-react';

export function PulseExploreCategories({ articles = [], onSelectCategory, onNavigate }) {
  // Aggregate real discussions from articles for each backend-supported category
  const counts = articles.reduce((acc, item) => {
    const raw = String(item.topic || '').toUpperCase();
    const disc = (Number(item.commentCount || 0)) + (Number(item.takeCount || 0));

    if (raw.includes('TECH')) {
      acc.TECHNOLOGY = (acc.TECHNOLOGY || 0) + disc;
    } else if (raw.includes('SPORT') || raw.includes('CRICKET')) {
      acc.SPORTS = (acc.SPORTS || 0) + disc;
    } else if (raw.includes('ENTERTAIN') || raw.includes('MOVIE')) {
      acc.ENTERTAINMENT = (acc.ENTERTAINMENT || 0) + disc;
    } else {
      acc.GENERAL_NEWS = (acc.GENERAL_NEWS || 0) + disc;
    }
    return acc;
  }, {});

  const formatDiscussions = (count = 0) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K discussions`;
    }
    return `${count} ${count === 1 ? 'discussion' : 'discussions'}`;
  };

  const categories = [
    {
      id: 'GENERAL_NEWS',
      name: 'General News',
      icon: Newspaper,
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
      count: formatDiscussions(counts.GENERAL_NEWS || 0),
    },
    {
      id: 'ENTERTAINMENT',
      name: 'Entertainment',
      icon: Film,
      iconBg: '#F3E8FF',
      iconColor: '#9333EA',
      count: formatDiscussions(counts.ENTERTAINMENT || 0),
    },
    {
      id: 'SPORTS',
      name: 'Sports',
      icon: Trophy,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      count: formatDiscussions(counts.SPORTS || 0),
    },
    {
      id: 'TECHNOLOGY',
      name: 'Technology',
      icon: Cpu,
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
      count: formatDiscussions(counts.TECHNOLOGY || 0),
    },
  ];

  const handleCardClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  return (
    <div className="pulse-sidebar-widget">
      {/* Header */}
      <div className="pulse-widget-header">
        <h3 className="pulse-widget-title">Explore Categories</h3>
        <button
          type="button"
          className="pulse-widget-view-all"
          onClick={() => onSelectCategory && onSelectCategory('ALL')}
        >
          <span>View all</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 2x2 Category Cards Grid */}
      <div className="pulse-explore-grid">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="pulse-explore-card"
              onClick={() => handleCardClick(cat.id)}
              role="button"
              tabIndex={0}
              title={`View ${cat.name}`}
            >
              <div
                className="pulse-explore-icon-box"
                style={{ background: cat.iconBg, color: cat.iconColor }}
              >
                <Icon size={16} />
              </div>
              <div className="pulse-explore-details">
                <span className="pulse-explore-name">{cat.name}</span>
                <span className="pulse-explore-count">{cat.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
