import React from 'react';
import { Hash, FileText, Bookmark, Heart, MessageSquare } from 'lucide-react';

export function MyTopicsTabs({ activeTab, onSelectTab, counts = {} }) {
  const tabs = [
    { id: 'topics', label: 'My Topics', icon: Hash, count: counts.topics },
    { id: 'posts', label: 'My Posts', icon: FileText, count: counts.posts },
    { id: 'saved', label: 'Saved', icon: Bookmark, count: counts.saved },
    { id: 'liked', label: 'Liked', icon: Heart, count: counts.liked },
    { id: 'comments', label: 'Comments', icon: MessageSquare, count: counts.comments },
  ];

  return (
    <nav className="my-topics-tabs-container" aria-label="Activity Categories">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`my-topics-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <Icon size={16} strokeWidth={isActive ? 2.2 : 1.9} />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count !== null && (
              <span className="my-topics-tab-count-badge">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
