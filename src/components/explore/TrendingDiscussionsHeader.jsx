import React from 'react';
import { TrendingUp, Flame, Clock, MessageSquare, SlidersHorizontal } from 'lucide-react';

export function TrendingDiscussionsHeader({
  activeFilter = 'trending',
  onSelectFilter,
  postCount = 0,
}) {
  const tabs = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'latest', label: 'Latest', icon: Clock },
    { id: 'most_commented', label: 'Most Commented', icon: MessageSquare },
  ];

  return (
    <div className="discussions-header-bar">
      <div className="discussions-header-title-col">
        <div className="discussions-title-line">
          <span className="discussions-title-icon-wrap" aria-hidden="true">
            <TrendingUp size={16} color="#E11D48" />
          </span>
          <h3 className="section-title">Trending Discussions</h3>
        </div>
        <p className="discussions-subtitle">
          Latest and most active conversations from all topics.
        </p>
      </div>

      <div className="discussions-tab-group" role="tablist" aria-label="Sort discussions">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`discussions-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectFilter(tab.id)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Icon size={13} />
                {tab.label}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          className="discussions-filter-action-btn"
          title="Filter discussions"
        >
          <SlidersHorizontal size={13} />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
}
