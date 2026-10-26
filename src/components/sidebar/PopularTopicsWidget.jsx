import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart, Briefcase, Sprout, Landmark, Sparkles, Trophy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { apiTopicService } from '../../services/apiTopicService.js';

export function PopularTopicsWidget({ onSelectTopic, onNavigate }) {
  const { t } = useLanguage();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let mounted = true;
    apiTopicService.getTopicStats()
      .then((data) => {
        if (mounted && data?.counts) {
          setCounts(data.counts);
        }
      })
      .catch((err) => {
        console.warn('[PopularTopicsWidget] failed to fetch topic stats:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const formatCount = (raw) => {
    const num = Number(raw) || 0;
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return String(num);
  };

  const topics = [
    { 
      id: 'LOVE', 
      name: 'Love', 
      nameKey: 'topic.subtopicLove',
      icon: Heart, 
      iconBg: '#FDF2F8', 
      iconColor: '#EC4899', 
    },
    { 
      id: 'LIFE_WORK', 
      name: 'Life & Work', 
      nameKey: 'topic.categoryLifeWork',
      icon: Briefcase, 
      iconBg: '#EFF6FF', 
      iconColor: '#3B82F6', 
    },
    { 
      id: 'MOTIVATION', 
      name: 'Motivation', 
      nameKey: 'topic.subtopicMotivation',
      icon: Sprout, 
      iconBg: '#ECFDF5', 
      iconColor: '#10B981', 
    },
    { 
      id: 'SOCIETY_POLITICS', 
      name: 'Society & Politics', 
      nameKey: 'topic.categorySocietyPolitics',
      icon: Landmark, 
      iconBg: '#FFF7ED', 
      iconColor: '#F97316', 
    },
    { 
      id: 'ENTERTAINMENT', 
      name: 'Entertainment', 
      nameKey: 'topic.categoryEntertainment',
      icon: Sparkles, 
      iconBg: '#FAF5FF', 
      iconColor: '#A855F7', 
    },
    { 
      id: 'SPORTS', 
      name: 'Sports', 
      nameKey: 'topic.categorySports',
      icon: Trophy, 
      iconBg: '#FEFCE8', 
      iconColor: '#EAB308', 
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
          const rawNum = counts[item.id] ?? counts[item.name.toUpperCase()] ?? 0;
          const countNum = formatCount(rawNum);
          const countText = rawNum === 1
            ? `${countNum} ${t('explore.discussionSingular', 'discussion')}`
            : `${countNum} ${t('explore.discussionPlural', 'discussions')}`;

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
