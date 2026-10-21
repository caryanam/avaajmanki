import React from 'react';
import { ArrowRight, Heart, Briefcase, Sprout, Landmark, Sparkles, Trophy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export function PopularTopicsWidget({ onSelectTopic, onNavigate }) {
  const { t } = useLanguage();

  const topics = [
    { 
      id: 'LOVE', 
      name: 'Love', 
      nameKey: 'topic.subtopicLove',
      icon: Heart, 
      iconBg: '#FDF2F8', 
      iconColor: '#EC4899', 
      countNum: '12.4K' 
    },
    { 
      id: 'LIFE_WORK', 
      name: 'Life & Work', 
      nameKey: 'topic.categoryLifeWork',
      icon: Briefcase, 
      iconBg: '#EFF6FF', 
      iconColor: '#3B82F6', 
      countNum: '9.8K' 
    },
    { 
      id: 'MOTIVATION', 
      name: 'Motivation', 
      nameKey: 'topic.subtopicMotivation',
      icon: Sprout, 
      iconBg: '#ECFDF5', 
      iconColor: '#10B981', 
      countNum: '8.1K' 
    },
    { 
      id: 'SOCIETY_POLITICS', 
      name: 'Society & Politics', 
      nameKey: 'topic.categorySocietyPolitics',
      icon: Landmark, 
      iconBg: '#FFF7ED', 
      iconColor: '#F97316', 
      countNum: '7.6K' 
    },
    { 
      id: 'ENTERTAINMENT', 
      name: 'Entertainment', 
      nameKey: 'topic.categoryEntertainment',
      icon: Sparkles, 
      iconBg: '#FAF5FF', 
      iconColor: '#A855F7', 
      countNum: '6.4K' 
    },
    { 
      id: 'SPORTS', 
      name: 'Sports', 
      nameKey: 'topic.categorySports',
      icon: Trophy, 
      iconBg: '#FEFCE8', 
      iconColor: '#EAB308', 
      countNum: '5.9K' 
    },
  ];

  const handleClick = (topic) => {
    if (onSelectTopic) {
      onSelectTopic(topic.name);
    } else if (onNavigate) {
      onNavigate(`/explore?topic=${topic.id}`);
    }
  };

  return (
    <div className="sidebar-widget-card">
      <div className="widget-header">
        <h3 className="widget-title">{t('topic.popularTopics', 'Popular Topics')}</h3>
        <button
          type="button"
          className="widget-view-all"
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={() => onNavigate ? onNavigate('/explore') : null}
        >
          <span>{t('topic.viewAll', 'View all')}</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="popular-topics-grid">
        {topics.map((item) => {
          const IconComponent = item.icon;
          const displayName = t(item.nameKey, item.name);
          const countText = t('topic.discussionsCountShort', '{{count}} discussions', { count: item.countNum });

          return (
            <div
              key={item.id}
              className="popular-topic-card"
              onClick={() => handleClick(item)}
              title={`Explore #${displayName}`}
            >
              <div
                className="popular-topic-icon-wrap"
                style={{ backgroundColor: item.iconBg, color: item.iconColor }}
              >
                <IconComponent size={14} />
              </div>
              <div className="popular-topic-info">
                <span className="popular-topic-name">{displayName}</span>
                <span className="popular-topic-count">{countText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
