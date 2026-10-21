import React from 'react';
import { Plus, Search, X } from 'lucide-react';

export function ExploreHeader({
  searchQuery,
  onSearchChange,
  onCreateTopic,
  onNavigate,
}) {
  return (
    <div className="explore-header-section">
      {/* Breadcrumb row: Home > Explore */}
      <nav className="explore-breadcrumbs" aria-label="Breadcrumb">
        <span
          className="breadcrumb-item breadcrumb-link"
          onClick={() => onNavigate ? onNavigate('/') : (window.location.href = '/')}
          role="button"
          tabIndex={0}
        >
          Home
        </span>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-item breadcrumb-current">Explore</span>
      </nav>

      {/* Main Header Row: Title & Subtitle + ONE Create Topic Button */}
      <div className="explore-header-top-row">
        <div className="explore-title-group">
          <h1 className="explore-heading">Explore Topics That Matter to You</h1>
          <p className="explore-subtitle">
            Share your thoughts, join real conversations, or create your own topic.
          </p>
        </div>

        {/* ONE Primary Create Topic Button aligned at upper-right */}
        <button
          type="button"
          className="explore-create-topic-btn"
          onClick={onCreateTopic}
          title="Start a new topic discussion"
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>Create Topic</span>
        </button>
      </div>

      {/* Compact Search Input Bar */}
      <div className="explore-search-wrap">
        <Search size={16} className="explore-search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search topics, discussions, or keywords..."
          className="explore-search-input"
          aria-label="Search topics and discussions"
        />
        {searchQuery && (
          <button
            type="button"
            className="explore-search-clear"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
