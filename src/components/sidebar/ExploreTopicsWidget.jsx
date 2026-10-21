import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import topicMentalHealth from '../../assets/home/topic-mental-health.jpg';
import topicPersonalGrowth from '../../assets/home/topic-personal-growth.jpg';
import topicFriendship from '../../assets/home/topic-friendship.jpg';
import topicEducation from '../../assets/home/topic-education.jpg';

export function ExploreTopicsWidget({ onSelectTopic, onNavigate }) {
  const { t } = useLanguage();

  const exploreTopics = [
    {
      id: 'MENTAL_HEALTH',
      name: 'Mental Health',
      nameKey: 'topic.subtopicMentalHealth',
      descKey: 'topic.descMentalHealth',
      countNum: '5.2K',
      description: 'Support, share and spread positivity.',
      thumb: topicMentalHealth,
    },
    {
      id: 'PERSONAL_GROWTH',
      name: 'Personal Growth',
      nameKey: 'topic.subtopicPersonalGrowth',
      descKey: 'topic.descPersonalGrowth',
      countNum: '4.8K',
      description: 'Small steps. Big changes.',
      thumb: topicPersonalGrowth,
    },
    {
      id: 'FRIENDSHIP',
      name: 'Friendship',
      nameKey: 'topic.subtopicFriendship',
      descKey: 'topic.descFriendship',
      countNum: '4.1K',
      description: 'Because real friends matter.',
      thumb: topicFriendship,
    },
    {
      id: 'EDUCATION',
      name: 'Education',
      nameKey: 'topic.subtopicEducation',
      descKey: 'topic.descEducation',
      countNum: '3.6K',
      description: 'Learning never stops.',
      thumb: topicEducation,
    },
  ];

  const handleClick = (item) => {
    if (onSelectTopic) {
      onSelectTopic(item.name);
    } else if (onNavigate) {
      onNavigate(`/explore?topic=${item.id}`);
    }
  };

  return (
    <div className="sidebar-widget-card">
      <div className="widget-header">
        <h3 className="widget-title">{t('topic.exploreMoreTopics', 'Explore More Topics')}</h3>
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

      <div className="explore-topics-list">
        {exploreTopics.map((item) => {
          const displayName = t(item.nameKey, item.name);
          const descText = t(item.descKey, item.description);
          const countText = t('topic.discussionsCountShort', '{{count}} discussions', { count: item.countNum });

          return (
            <div
              key={item.id}
              className="explore-topic-item"
              onClick={() => handleClick(item)}
              title={`View #${displayName}`}
            >
              <div className="explore-topic-left">
                <img
                  src={item.thumb}
                  alt={displayName}
                  className="explore-topic-thumb"
                />
                <div className="explore-topic-details">
                  <span className="explore-topic-name">{displayName}</span>
                  <span className="explore-topic-count">{countText}</span>
                  <span className="explore-topic-desc">{descText}</span>
                </div>
              </div>

              <ChevronRight size={14} className="explore-topic-arrow" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
