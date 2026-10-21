import React from 'react';
import { ChevronRight } from 'lucide-react';

export function TopicDiscussionBreadcrumb({ topicName = 'Mental Health', onNavigate }) {
  return (
    <nav className="topic-discussion-breadcrumb" aria-label="Breadcrumb">
      <button
        type="button"
        className="breadcrumb-item-btn"
        onClick={() => onNavigate ? onNavigate('/home') : (window.location.href = '/home')}
      >
        Home
      </button>
      <ChevronRight size={13} className="breadcrumb-chevron" aria-hidden="true" />
      <button
        type="button"
        className="breadcrumb-item-btn"
        onClick={() => onNavigate ? onNavigate('/explore') : (window.location.href = '/explore')}
      >
        Explore
      </button>
      <ChevronRight size={13} className="breadcrumb-chevron" aria-hidden="true" />
      <button
        type="button"
        className="breadcrumb-item-btn"
        onClick={() => onNavigate ? onNavigate(`/explore?category=${encodeURIComponent(topicName)}`) : (window.location.href = `/explore?category=${encodeURIComponent(topicName)}`)}
      >
        {topicName}
      </button>
      <ChevronRight size={13} className="breadcrumb-chevron" aria-hidden="true" />
      <span className="breadcrumb-item-current">Discussion</span>
    </nav>
  );
}
