import React from 'react';
import { 
  Hash, FileText, Heart, MessageSquare, ChevronRight, Lightbulb, Sparkles 
} from 'lucide-react';
import { 
  resolveTopicCover, formatTopicTitle, formatTimeAgo 
} from './MyTopicItemCard.jsx';

export function MyTopicsRightSidebar({ 
  stats = { topicsCount: 0, postsCount: 0, likesCount: 0, discussionsCount: 0 }, 
  recentTopics = [], 
  onViewTopic, 
  onCreateTopicClick 
}) {
  return (
    <aside className="my-topics-right-sidebar-col" aria-label="Topic Insights and Actions">
      {/* ── 1. TOPIC OVERVIEW STATS (2x2 Grid) ── */}
      <section className="my-topics-stats-card">
        <div className="my-topics-stats-header">
          <Sparkles size={18} strokeWidth={2.2} style={{ color: '#E11D48' }} />
          <h2 className="my-topics-stats-header-title">Topic Overview</h2>
        </div>

        <div className="my-topics-stats-grid">
          {/* Stat 1: Total Topics */}
          <div className="my-topics-stat-box">
            <div className="my-topics-stat-box-top">
              <span className="my-topics-stat-label">Total Topics</span>
              <div 
                className="my-topics-stat-icon-wrap" 
                style={{ background: '#FFE4E6', color: '#E11D48' }}
              >
                <Hash size={15} strokeWidth={2.4} />
              </div>
            </div>
            <div className="my-topics-stat-number">{stats.topicsCount}</div>
          </div>

          {/* Stat 2: Total Posts */}
          <div className="my-topics-stat-box">
            <div className="my-topics-stat-box-top">
              <span className="my-topics-stat-label">Total Posts</span>
              <div 
                className="my-topics-stat-icon-wrap" 
                style={{ background: '#E0F2FE', color: '#0284C7' }}
              >
                <FileText size={15} strokeWidth={2.4} />
              </div>
            </div>
            <div className="my-topics-stat-number">{stats.postsCount}</div>
          </div>

          {/* Stat 3: Total Likes */}
          <div className="my-topics-stat-box">
            <div className="my-topics-stat-box-top">
              <span className="my-topics-stat-label">Total Likes</span>
              <div 
                className="my-topics-stat-icon-wrap" 
                style={{ background: '#FFEDD5', color: '#EA580C' }}
              >
                <Heart size={15} strokeWidth={2.4} />
              </div>
            </div>
            <div className="my-topics-stat-number">{stats.likesCount}</div>
          </div>

          {/* Stat 4: Total Discussions */}
          <div className="my-topics-stat-box">
            <div className="my-topics-stat-box-top">
              <span className="my-topics-stat-label">Discussions</span>
              <div 
                className="my-topics-stat-icon-wrap" 
                style={{ background: '#DCFCE7', color: '#16A34A' }}
              >
                <MessageSquare size={15} strokeWidth={2.4} />
              </div>
            </div>
            <div className="my-topics-stat-number">{stats.discussionsCount}</div>
          </div>
        </div>
      </section>

      {/* ── 2. RECENTLY ACTIVE TOPICS ── */}
      <section className="my-topics-recent-card">
        <div className="my-topics-recent-header">
          <h2 className="my-topics-recent-title">Recently Active Topics</h2>
        </div>

        <div className="my-topics-recent-list">
          {recentTopics && recentTopics.length > 0 ? (
            recentTopics.slice(0, 4).map((topic) => {
              const title = formatTopicTitle(topic);
              const thumbUrl = resolveTopicCover(topic);
              const discussions = topic.commentCount || topic.post_count || 8;
              const time = formatTimeAgo(topic.createdAt);

              return (
                <div
                  key={topic.id || topic.name}
                  className="my-topics-recent-item"
                  onClick={() => onViewTopic?.(topic.id || topic.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onViewTopic?.(topic.id || topic.name);
                    }
                  }}
                >
                  <div className="my-topics-recent-item-left">
                    <img
                      src={thumbUrl}
                      alt={title}
                      className="my-topics-recent-thumb"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="my-topics-recent-thumb-fallback" style={{ display: 'none' }}>
                      {topic.icon || '💬'}
                    </div>

                    <div className="my-topics-recent-info">
                      <h4 className="my-topics-recent-name" title={title}>
                        {title}
                      </h4>
                      <p className="my-topics-recent-meta">
                        {discussions} discussions · {time}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={16} strokeWidth={2} className="my-topics-recent-chevron" />
                </div>
              );
            })
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '12px 0' }}>
              No recent topic activity
            </p>
          )}
        </div>
      </section>

      {/* ── 3. HAVE A NEW TOPIC IDEA? CALLOUT ── */}
      <section className="my-topics-idea-card">
        <div className="my-topics-idea-icon-wrap">
          <Lightbulb size={20} strokeWidth={2.4} />
        </div>
        <div>
          <h3 className="my-topics-idea-title">Have a New Topic Idea?</h3>
          <p className="my-topics-idea-desc">
            Create a topic community and invite others to share their authentic thoughts and experiences.
          </p>
        </div>
        <button
          type="button"
          className="my-topics-idea-btn"
          onClick={onCreateTopicClick}
        >
          <span>+ Create Topic</span>
        </button>
      </section>
    </aside>
  );
}
