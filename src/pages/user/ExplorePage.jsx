import React, { useState, useEffect, useMemo } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { 
  Compass, Search, Flame, Clock, Sparkles, Tag, Film, Trophy, 
  Cpu, Landmark, Clapperboard, HeartPulse, Dumbbell, Newspaper, Users, ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { TopicBackgroundRotator } from '../../components/topics/TopicBackgroundRotator.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { TOPIC_CATEGORIES, SYSTEM_TOPICS } from '../../utils/topicUtils.js';

export function ExplorePage({ onNavigate }) {
  const { posts } = usePosts();
  const { currentUser } = useAuth();
  const { blockedUsers, mutedUsers = [] } = useReports();
  const { t } = useLanguage();
  const searchParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTopic, setActiveTopic] = useState('All');
  const [hoveredTopic, setHoveredTopic] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Standardized Topic Presets matching HomePage categories & subtopics 100%
  const TOPIC_PRESETS = useMemo(() => {
    const presets = [];
    TOPIC_CATEGORIES.forEach((cat) => {
      cat.subtopics.forEach((sub) => {
        presets.push({
          name: sub.id,
          label: sub.label,
          category: cat.name,
          categoryKey: cat.categoryKey,
          icon: sub.icon,
          accent: cat.accent,
          gradient: cat.gradient,
        });
      });
    });
    return presets;
  }, []);

  // Dynamic calculation of topic statistics strictly from real posts
  const topicStats = useMemo(() => {
    const statsMap = {};
    TOPIC_PRESETS.forEach(tItem => {

      statsMap[tItem.name] = { count: 0, lastPostTime: 'No posts yet', lastPostMs: 0, isNew: false, isTrending: false };
    });

    posts.forEach(p => {
      if (!p) return;
      const topicName = (p.topic || 'GENERAL').toUpperCase().trim();
      if (!statsMap[topicName]) {
        statsMap[topicName] = { count: 0, lastPostTime: 'No posts yet', lastPostMs: 0, isNew: false, isTrending: false };
      }
      const stat = statsMap[topicName];
      stat.count += 1;

      const createdAtMs = p.createdAt ? new Date(p.createdAt).getTime() : 0;
      if (createdAtMs > stat.lastPostMs) {
        stat.lastPostMs = createdAtMs;
        stat.lastPostTime = formatDate(p.createdAt);
      }
    });

    // Apply NEW or TRENDING badges if real posts exist
    Object.values(statsMap).forEach(stat => {
      if (stat.count > 0) {
        stat.isNew = true;
        stat.isTrending = stat.count >= 2;
      } else {
        stat.isNew = false;
        stat.isTrending = false;
      }
    });

    return statsMap;
  }, [posts]);

  // Filter posts
  let displayPosts = posts.filter((p) => {
    if (!p) return false;
    const authorHandle = (p.username || p.authorUsername || '').toLowerCase().replace(/^@/, '').trim();
    const isBlockedOrMuted =
      Boolean(authorHandle) && (
        blockedUsers.some((b) => (b || '').toLowerCase().replace(/^@/, '').trim() === authorHandle) ||
        mutedUsers.some((m) => (m || '').toLowerCase().replace(/^@/, '').trim() === authorHandle)
      );
    const isActive = p.status === 'ACTIVE' || p.status === 'PUBLISHED' || !p.status;
    return isActive && p.status !== 'DELETED' && p.status !== 'HIDDEN' && !isBlockedOrMuted;
  });

  if (query.trim()) {
    const qLower = query.toLowerCase();
    displayPosts = displayPosts.filter(
      (p) => p.title?.toLowerCase().includes(qLower) || p.content?.toLowerCase().includes(qLower) || (p.topic && p.topic.toLowerCase().includes(qLower)) || (p.subtopic && p.subtopic.toLowerCase().includes(qLower))
    );
  }

  if (activeTopic !== 'All') {
    const target = activeTopic.toUpperCase();
    displayPosts = displayPosts.filter((p) => {
      const pTopic = (p.topic || '').toUpperCase();
      const pSubtopic = (p.subtopic || '').toUpperCase();
      return pTopic === target || pSubtopic === target;
    });
  }

  // Filter topic cards by search query
  const filteredTopicPresets = TOPIC_PRESETS.filter(tItem => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const translatedName = t(tItem.name, tItem.name).toLowerCase();
    return tItem.name.toLowerCase().includes(q) || translatedName.includes(q) || tItem.category.toLowerCase().includes(q);
  });

  return (
    <UserLayout activeRoute="/explore" onNavigate={onNavigate} wide={true}>
      <TopicBackgroundRotator topicName="EXPLORE">
        <div className="flex-col gap-lg" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* ── HERO DISCOVERY HEADER & GLASS SEARCH ── */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #6F405F 0%, #4A2B40 50%, #2D1D15 100%)', 
              borderRadius: '24px', 
              padding: '32px 28px',
              color: '#FFFFFF',
              boxShadow: '0 12px 36px rgba(45,29,21,0.22)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient Background Glow */}
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,209,232,0.15)', borderRadius: '50%', blur: '40px', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', zIndex: 2, position: 'relative' }}>
              <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={32} color="#FFD1E8" />
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', margin: 0, tracking: '-0.02em' }}>
                  {t('exploreTopicsDiscussions', 'Explore Topics & Discussions')}
                </h1>
                <p style={{ fontSize: '14px', color: '#E0C8D6', margin: '4px 0 0 0', opacity: 0.95 }}>
                  {t('exploreSubtitle', 'Search topics, view last post timestamps, and join conversations across Bollywood, Cricket, Politics, and Tech.')}
                </p>
              </div>
            </div>

            {/* Premium Glass Search Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '680px', zIndex: 2 }}>
              <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#8C8385' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchTopicsPlaceholder', 'Search topics (e.g. Bollywood, Cricket, Technology)...')}
                style={{
                  width: '100%',
                  padding: '14px 18px 14px 50px',
                  borderRadius: '30px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  fontSize: '15px',
                  outline: 'none',
                  color: '#2D1D15',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* ── SEARCH RESULTS & POST LISTINGS ── */}
          <div id="explore-posts-section" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', scrollMarginTop: '90px', marginTop: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--eclipse)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="var(--deep-plum)" />
                  {t('recentThoughts', 'Recent Thoughts')} {activeTopic !== 'All' ? `under #${t(activeTopic, activeTopic)}` : ''} ({displayPosts.length})
                </h3>
              </div>

              {displayPosts.length === 0 ? (
                <div 
                  className="mka-card text-center secondary-text" 
                  style={{ 
                    padding: '48px 24px', 
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1.5px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Compass size={40} color="var(--hurricane)" style={{ opacity: 0.5 }} />
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--eclipse)' }}>
                    {t('noThoughtsFound', 'No thoughts found')}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--hurricane)' }}>
                    {t('firstToShare', 'Be the first to share an unspoken thought on this topic!')}
                  </div>
                </div>
              ) : (
                displayPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onNavigate={onNavigate}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      </TopicBackgroundRotator>
    </UserLayout>
  );
}
