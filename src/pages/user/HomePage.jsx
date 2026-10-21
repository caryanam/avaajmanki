import React, { useState, useMemo } from 'react';
import { AppHeader } from '../../components/layout/AppHeader.jsx';
import { DesktopSidebar } from '../../components/layout/DesktopSidebar.jsx';
import { FeaturedPulseCarousel } from '../../components/home/FeaturedPulseCarousel.jsx';
import { HomeFeedTabs } from '../../components/home/HomeFeedTabs.jsx';
import { PostComposer } from '../../components/home/PostComposer.jsx';
import { CommunityPostCard } from '../../components/home/CommunityPostCard.jsx';
import { TrendingPulseWidget } from '../../components/sidebar/TrendingPulseWidget.jsx';
import { PopularTopicsWidget } from '../../components/sidebar/PopularTopicsWidget.jsx';
import { ExploreTopicsWidget } from '../../components/sidebar/ExploreTopicsWidget.jsx';
import { TopicCreateModal } from '../../components/topics/TopicCreateModal.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { Sparkles, MessageSquare } from 'lucide-react';

export function HomePage({ onNavigate }) {
  const { posts = [], loading } = usePosts();
  const { blockedUsers = [], mutedUsers = [], isBlocked, isMuted, isHidden } = useReports() || {};

  const [activeTab, setActiveTab] = useState('For You');
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  // Filter posts based on active tab and moderation settings
  const filteredPosts = useMemo(() => {
    let list = (posts || []).filter((p) => {
      if (!p) return false;
      const authorHandle = (p.username || p.authorUsername || '').toLowerCase().replace(/^@/, '').trim();
      const isBlockedOrMuted = (isBlocked && isMuted)
        ? (isBlocked(authorHandle) || isMuted(authorHandle))
        : (
          Boolean(authorHandle) && (
            blockedUsers.some((b) => (b || '').toLowerCase().replace(/^@/, '').trim() === authorHandle) ||
            mutedUsers.some((m) => (m || '').toLowerCase().replace(/^@/, '').trim() === authorHandle)
          )
        );
      const isPostHidden = isHidden ? isHidden(p.id) : false;
      const isActive = p.status === 'ACTIVE' || p.status === 'PUBLISHED' || !p.status;
      return isActive && p.status !== 'DELETED' && p.status !== 'HIDDEN' && !isBlockedOrMuted && !isPostHidden;
    });

    if (activeTab === 'For You') {
      return list;
    }

    if (activeTab === 'Latest') {
      return [...list].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    if (activeTab === 'Pulse Updates') {
      return list.filter((p) => 
        p.feedItemType === 'PULSE_DISCUSSION' || 
        String(p.topic || '').toUpperCase() === 'PULSE' ||
        String(p.topic || '').toUpperCase() === 'NEWS'
      );
    }

    if (activeTab === 'Feelings' || activeTab === 'Love') {
      return list.filter((p) => {
        const top = String(p.topic || '').toUpperCase();
        const sub = String(p.subtopic || '').toUpperCase();
        return top.includes('FEELING') || sub.includes('FEELING') || top.includes('LOVE') || top.includes('EMOTION');
      });
    }

    if (activeTab === 'Life & Work') {
      return list.filter((p) => {
        const top = String(p.topic || '').toUpperCase();
        const sub = String(p.subtopic || '').toUpperCase();
        return top.includes('LIFE') || top.includes('WORK') || sub.includes('WORK') || top.includes('CAREER');
      });
    }

    if (activeTab === 'Society & Politics') {
      return list.filter((p) => {
        const top = String(p.topic || '').toUpperCase();
        const sub = String(p.subtopic || '').toUpperCase();
        return top.includes('POLITIC') || top.includes('SOCIETY') || sub.includes('POLITIC');
      });
    }

    if (activeTab === 'Entertainment' || activeTab === 'Music') {
      return list.filter((p) => {
        const top = String(p.topic || '').toUpperCase();
        const sub = String(p.subtopic || '').toUpperCase();
        return top.includes('ENTERTAIN') || top.includes('MUSIC') || top.includes('MOVIE') || sub.includes('MUSIC');
      });
    }

    if (activeTab === 'Following') {
      return list;
    }

    // Default fallback: filter by matching topic keyword
    const target = activeTab.toUpperCase().replace(/\s+/g, '_');
    const matched = list.filter((p) => {
      const top = String(p.topic || '').toUpperCase();
      const sub = String(p.subtopic || '').toUpperCase();
      return top.includes(target) || sub.includes(target);
    });

    return matched.length > 0 ? matched : list;
  }, [posts, activeTab, blockedUsers, mutedUsers, isBlocked, isMuted, isHidden]);

  return (
    <div className="home-page-root">
      {/* ── TOP HEADER ── */}
      <AppHeader onNavigate={onNavigate} />

      {/* ── THREE-COLUMN DESKTOP GRID ── */}
      <div className="home-desktop-grid">
        {/* Column 1: Left Navigation & Promo Sidebar */}
        <DesktopSidebar
          activeRoute="/home"
          onNavigate={onNavigate}
          onJoinCommunity={() => setIsTopicModalOpen(true)}
        />

        {/* Column 2: Center Main Column Stream */}
        <main className="center-stream" id="home-main-stream">
          {/* Dynamic Featured Pulse Carousel */}
          <FeaturedPulseCarousel onNavigate={onNavigate} />

          {/* Feed Filter Tabs */}
          <HomeFeedTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenFilter={() => onNavigate('/explore')}
          />

          {/* Post Composer Card */}
          <PostComposer
            onNavigate={onNavigate}
            defaultTopic={activeTab === 'For You' ? 'GENERAL' : activeTab.toUpperCase().replace(/\s+/g, '_')}
          />

          {/* Community Feed Stream */}
          <section className="community-posts-stream" aria-label="Community Feed">
            {loading && filteredPosts.length === 0 ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Sparkles size={24} color="var(--primary-pink)" />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Loading thoughts from the community...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  padding: '48px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <MessageSquare size={36} color="var(--text-muted)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  No posts yet in #{activeTab}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, maxWidth: '340px' }}>
                  Be the first to share an anonymous thought, reflection, or question with the community!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const composerEl = document.querySelector('.composer-input-trigger');
                    composerEl?.click?.();
                  }}
                  style={{
                    marginTop: '8px',
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--primary-pink)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Write a Thought
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredPosts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Column 3: Right Sidebar Widgets */}
        <aside className="desktop-right-sidebar" aria-label="Trending and Topics">
          {/* 1. Trending in Awaaj Pulse */}
          <TrendingPulseWidget onNavigate={onNavigate} />

          {/* 2. Popular Topics */}
          <PopularTopicsWidget
            onSelectTopic={(topicName) => setActiveTab(topicName)}
            onNavigate={onNavigate}
          />

          {/* 3. Explore More Topics */}
          <ExploreTopicsWidget
            onSelectTopic={(topicName) => setActiveTab(topicName)}
            onNavigate={onNavigate}
          />
        </aside>
      </div>

      {/* Topic Creation Modal */}
      <TopicCreateModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onCreated={(topic) => onNavigate(`/topic/${topic.id}`)}
      />
    </div>
  );
}
