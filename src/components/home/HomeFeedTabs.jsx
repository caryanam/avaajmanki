import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function HomeFeedTabs({ activeTab = 'For You', onSelectTab, onOpenFilter }) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'For You', label: t('feed.forYou', 'For You') },
    { id: 'Following', label: t('feed.following', 'Following') },
    { id: 'Latest', label: t('feed.latest', 'Latest') },
    { id: 'Pulse Updates', label: t('feed.pulseUpdates', 'Pulse Updates') },
    { id: 'Feelings', label: t('feed.feelings', 'Feelings') },
    { id: 'Life & Work', label: t('feed.lifeWork', 'Life & Work') },
    { id: 'Society & Politics', label: t('feed.societyPolitics', 'Society & Politics') },
    { id: 'Entertainment', label: t('feed.entertainment', 'Entertainment') },
  ];

  return (
    <div className="feed-tabs-row hide-scrollbar">
      <div className="feed-tabs-list hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`feed-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="feed-filter-btn"
        onClick={onOpenFilter}
        title={t('feed.filterFeed', 'Filter Feed')}
      >
        <SlidersHorizontal size={14} />
        <span>{t('feed.filter', 'Filter')}</span>
      </button>
    </div>
  );
}
