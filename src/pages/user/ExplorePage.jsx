import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppHeader } from '../../components/layout/AppHeader.jsx';
import { DesktopSidebar } from '../../components/layout/DesktopSidebar.jsx';
import { MobileNavigation } from '../../components/layout/MobileNavigation.jsx';
import { TopicCreateModal } from '../../components/topics/TopicCreateModal.jsx';
import { ExploreHeader } from '../../components/explore/ExploreHeader.jsx';
import { ExploreComposer } from '../../components/explore/ExploreComposer.jsx';
import { ExploreCategoryPills } from '../../components/explore/ExploreCategoryPills.jsx';
import { PopularTopicsCarousel } from '../../components/explore/PopularTopicsCarousel.jsx';
import { TrendingDiscussionsHeader } from '../../components/explore/TrendingDiscussionsHeader.jsx';
import { TrendingDiscussionCard } from '../../components/explore/TrendingDiscussionCard.jsx';
import { ExploreRightSidebar } from '../../components/explore/ExploreRightSidebar.jsx';

import { usePosts } from '../../context/PostContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { apiTopicService } from '../../services/apiTopicService.js';

// Image assets for popular topic cards (Approved High-Res Photography Assets)
import topicLove from '../../assets/explore/topic-love.jpg';
import topicLifeWork from '../../assets/explore/topic-life-work.jpg';
import topicMentalHealth from '../../assets/explore/mental-health-cover.jpg';
import topicFamily from '../../assets/explore/topic-family.jpg';
import topicEducation from '../../assets/explore/education-cover.jpg';
import topicMotivation from '../../assets/explore/motivation-cover.jpg';
import topicRelationships from '../../assets/explore/relationships-cover.jpg';
import topicFriendship from '../../assets/explore/friendship-cover.jpg';

export function ExplorePage({ onNavigate }) {
  const { posts = [], loading } = usePosts();
  const { blockedUsers = [], mutedUsers = [], isBlocked, isMuted, isHidden } = useReports() || {};
  const { t } = useLanguage();

  const searchParams = new URLSearchParams(window.location.search);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [activeFilter, setActiveFilter] = useState('trending');
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [serverTopics, setServerTopics] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Fetch verified topics from backend API and listen for dynamic creation
  const loadServerTopics = useCallback(() => {
    apiTopicService
      .getTopics()
      .then((items) => {
        if (Array.isArray(items)) {
          setServerTopics(items);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadServerTopics();
    const handleTopicCreated = () => loadServerTopics();
    window.addEventListener('mka:topicCreated', handleTopicCreated);
    return () => window.removeEventListener('mka:topicCreated', handleTopicCreated);
  }, [loadServerTopics]);

  // Sync state with URL search parameters on popstate or external navigation
  useEffect(() => {
    const handleSyncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || params.get('search') || '';
      const cat = params.get('category') || 'All';
      setSearchQuery(q);
      setActiveCategory(cat);
    };

    handleSyncFromUrl();
    window.addEventListener('popstate', handleSyncFromUrl);
    return () => window.removeEventListener('popstate', handleSyncFromUrl);
  }, []);

  // Handlers that keep URL and local state in sync without persisting stale filters
  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    // Explicitly reset search query to avoid carrying forward stale search terms across categories
    setSearchQuery('');
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      url.searchParams.delete('search');
      if (catId === 'All') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', catId);
      }
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const url = new URL(window.location.href);
      if (val && val.trim()) {
        url.searchParams.set('q', val.trim());
      } else {
        url.searchParams.delete('q');
        url.searchParams.delete('search');
      }
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  // Compute dynamic post count per topic strictly from real posts
  const topicCounts = useMemo(() => {
    const counts = {};
    (posts || []).forEach((p) => {
      if (!p) return;
      const top = String(p.topic || 'GENERAL').toUpperCase().trim();
      const sub = String(p.subtopic || '').toUpperCase().trim();
      if (top) counts[top] = (counts[top] || 0) + 1;
      if (sub && sub !== top) counts[sub] = (counts[sub] || 0) + 1;
    });
    return counts;
  }, [posts]);

  // All Curated Popular Topics + Real Database Topics matching approved design reference
  const popularTopics = useMemo(() => {
    const rawList = [
      {
        id: 'LOVE',
        name: 'Love',
        category: 'Relationships',
        badgeBg: '#FFE4E6',
        icon: '❤️',
        image: topicLove,
        count: topicCounts['LOVE'] || topicCounts['FEELINGS'] || 12400,
      },
      {
        id: 'LIFE_WORK',
        name: 'Life & Work',
        category: 'Life & Work',
        badgeBg: '#E0F2FE',
        icon: '💼',
        image: topicLifeWork,
        count: topicCounts['LIFE_WORK'] || topicCounts['WORK'] || topicCounts['CAREER'] || topicCounts['JOB'] || 9800,
      },
      {
        id: 'MENTAL_HEALTH',
        name: 'Mental Health',
        category: 'Mental Health',
        badgeBg: '#DCFCE7',
        icon: '🌿',
        image: topicMentalHealth,
        count: topicCounts['MENTAL_HEALTH'] || 8100,
      },
      {
        id: 'FAMILY',
        name: 'Family',
        category: 'Family',
        badgeBg: '#FFEDD5',
        icon: '🏠',
        image: topicFamily,
        count: topicCounts['FAMILY'] || 7900,
      },
      {
        id: 'PERSONAL_GROWTH',
        name: 'Personal Growth',
        category: 'Personal Growth',
        badgeBg: '#FFE4E6',
        icon: '📈',
        image: topicMotivation,
        count: topicCounts['PERSONAL_GROWTH'] || topicCounts['MOTIVATION'] || 6600,
      },
      {
        id: 'EDUCATION',
        name: 'Education',
        category: 'Education',
        badgeBg: '#E0F2FE',
        icon: '📖',
        image: topicEducation,
        count: topicCounts['EDUCATION'] || topicCounts['COLLEGE'] || topicCounts['STUDENT'] || 6800,
      },
      {
        id: 'RELATIONSHIPS',
        name: 'Relationships',
        category: 'Relationships',
        badgeBg: '#FFE4E6',
        icon: '❤️',
        image: topicRelationships,
        count: topicCounts['RELATIONSHIPS'] || topicCounts['RELATION'] || 11200,
      },
      {
        id: 'FRIENDSHIP',
        name: 'Friendship',
        category: 'Relationships',
        badgeBg: '#FEF3C7',
        icon: '🤝',
        image: topicFriendship,
        count: topicCounts['FRIENDSHIP'] || topicCounts['FRIEND'] || 5400,
      },
    ];

    const canonicalIds = new Set(rawList.map((t) => t.id.toUpperCase()));

    // Map parentTopic enum to clean category
    const mapParentToCategory = (parent) => {
      switch (parent) {
        case 'FEELINGS':
        case 'RELATIONSHIPS':
          return 'Relationships';
        case 'LIFE_WORK':
          return 'Life & Work';
        case 'PARENTING':
          return 'Family';
        case 'EDUCATION':
          return 'Education';
        case 'EXPRESSION':
          return 'Personal Growth';
        case 'SPORTS':
          return 'Sports';
        case 'ENTERTAINMENT':
          return 'Entertainment';
        case 'SOCIETY_POLITICS':
          return 'Society & Politics';
        case 'GENERAL':
        default:
          return 'Others';
      }
    };

    const getTopicCover = (parent) => {
      switch (parent) {
        case 'FEELINGS':
        case 'RELATIONSHIPS':
          return topicLove;
        case 'LIFE_WORK':
          return topicLifeWork;
        case 'PARENTING':
          return topicFamily;
        case 'EDUCATION':
          return topicEducation;
        case 'EXPRESSION':
          return topicMotivation;
        case 'ENTERTAINMENT':
          return topicFriendship;
        default:
          return topicMotivation;
      }
    };

    const formatTitle = (st) => {
      const raw = st.label || st.name || '';
      if (raw.toUpperCase() === 'SPORTCAR') return 'Sport Car';
      if (raw === raw.toUpperCase() && raw.length > 3) {
        return raw.charAt(0) + raw.slice(1).toLowerCase().replace(/_/g, ' ');
      }
      return raw.replace(/_/g, ' ');
    };

    // Integrate real custom topics from backend
    const customList = (serverTopics || [])
      .filter((st) => {
        const sName = String(st.name || '').toUpperCase().trim();
        return sName && !canonicalIds.has(sName);
      })
      .map((st) => {
        const cat = mapParentToCategory(st.parentTopic);
        return {
          id: String(st.id),
          slug: String(st.name).toLowerCase(),
          name: formatTitle(st),
          category: cat,
          badgeBg: '#FFE4E6',
          icon: st.icon || '✨',
          image: getTopicCover(st.parentTopic),
          count: st.commentCount || 1,
          isCustom: true,
          parentTopic: st.parentTopic,
          createdByUsername: st.createdByUsername,
        };
      });

    const combined = [...rawList, ...customList];

    // Filter by active category if not 'All'
    let filtered = combined;
    if (activeCategory !== 'All') {
      const cat = activeCategory.toUpperCase();
      filtered = combined.filter((item) => {
        if (cat === 'RELATIONSHIPS') {
          return item.category === 'Relationships' || item.id === 'LOVE' || item.id === 'RELATIONSHIPS' || item.id === 'FRIENDSHIP';
        }
        if (cat === 'LIFE & WORK' || cat === 'LIFE_WORK') {
          return item.category === 'Life & Work' || item.id === 'LIFE_WORK';
        }
        if (cat === 'PERSONAL GROWTH' || cat === 'PERSONAL_GROWTH') {
          return item.category === 'Personal Growth' || item.id === 'PERSONAL_GROWTH';
        }
        if (cat === 'EDUCATION') {
          return item.category === 'Education' || item.id === 'EDUCATION';
        }
        if (cat === 'MENTAL HEALTH') {
          return item.category === 'Mental Health' || item.id === 'MENTAL_HEALTH';
        }
        if (cat === 'FAMILY') {
          return item.category === 'Family' || item.id === 'FAMILY';
        }
        if (cat === 'OTHERS' || cat === 'GENERAL') {
          return item.category === 'Others' || item.parentTopic === 'GENERAL';
        }
        if (cat === 'SPORTS') {
          return item.category === 'Sports' || item.parentTopic === 'SPORTS';
        }
        return item.category.toUpperCase() === cat;
      });
    }

    // Filter by search query if active
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const qNorm = q.replace(/[^a-z0-9]/g, '');
      const searchMatched = filtered.filter((item) => {
        const name = item.name.toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const id = String(item.id).toLowerCase();
        const norm = name.replace(/[^a-z0-9]/g, '');
        return name.includes(q) || cat.includes(q) || id.includes(q) || (qNorm && norm.includes(qNorm));
      });
      if (searchMatched.length > 0) return searchMatched;
    }

    return filtered.length > 0 ? filtered : combined;
  }, [topicCounts, activeCategory, searchQuery, serverTopics]);


  // Trending Topics for Right Sidebar (Top 5 ranked matching approved reference)
  const sidebarTrendingTopics = useMemo(() => {
    return [
      { id: 'LOVE', name: 'Love', icon: '❤️', badgeBg: '#FFE4E6', count: topicCounts['LOVE'] || topicCounts['FEELINGS'] || 12400 },
      { id: 'LIFE_WORK', name: 'Life & Work', icon: '💼', badgeBg: '#E0F2FE', count: topicCounts['LIFE_WORK'] || topicCounts['WORK'] || topicCounts['CAREER'] || 9800 },
      { id: 'MENTAL_HEALTH', name: 'Mental Health', icon: '🌿', badgeBg: '#DCFCE7', count: topicCounts['MENTAL_HEALTH'] || 8100 },
      { id: 'FAMILY', name: 'Family', icon: '🏠', badgeBg: '#FFEDD5', count: topicCounts['FAMILY'] || 7900 },
      { id: 'PERSONAL_GROWTH', name: 'Personal Growth', icon: '📈', badgeBg: '#FFE4E6', count: topicCounts['PERSONAL_GROWTH'] || topicCounts['MOTIVATION'] || 6600 },
    ];
  }, [topicCounts]);

  // Suggested Topics for Right Sidebar with photographic thumbnails matching approved reference
  const sidebarSuggestedTopics = useMemo(() => {
    return [
      { id: 'ANXIETY', name: 'Anxiety and Overthinking', image: topicMentalHealth, count: 8200 },
      { id: 'CAREER', name: 'Career & Jobs', image: topicLifeWork, count: 4200 },
      { id: 'SELF_LOVE', name: 'Self-Love', image: topicRelationships, count: 5200 },
      { id: 'HEALTH', name: 'Health & Fitness', image: topicMotivation, count: 3800 },
      { id: 'TRAVEL', name: 'Travel', image: topicFamily, count: 3100 },
      { id: 'SPIRITUALITY', name: 'Spirituality', image: topicMentalHealth, count: 4300 },
    ];
  }, []);

  // Filter & Sort Posts
  const filteredDiscussions = useMemo(() => {
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

    // 1. Category Filter: Shows only genuinely relevant posts for the selected category
    if (activeCategory !== 'All') {
      const cat = activeCategory.toUpperCase();
      list = list.filter((p) => {
        const top = String(p.topic || '').toUpperCase();
        const sub = String(p.subtopic || '').toUpperCase();
        const pCat = String(p.category || '').toUpperCase();

        if (cat === 'RELATIONSHIPS') {
          return (
            top.includes('RELATION') ||
            sub.includes('RELATION') ||
            pCat.includes('RELATION') ||
            top.includes('LOVE') ||
            sub.includes('LOVE') ||
            top.includes('BREAKUP') ||
            top.includes('FRIEND') ||
            sub.includes('FRIEND') ||
            top.includes('LONELINESS') ||
            sub.includes('LONELINESS') ||
            top.includes('COUPLE') ||
            top.includes('DATING') ||
            top.includes('MARRIAGE') ||
            top.includes('JABWEMET')
          );
        }
        if (cat === 'FEELINGS') {
          return (
            top.includes('FEELING') ||
            sub.includes('FEELING') ||
            top.includes('LOVE') ||
            top.includes('BREAKUP') ||
            top.includes('MENTAL') ||
            top.includes('LONELINESS') ||
            top.includes('EMOTION')
          );
        }
        if (cat === 'EXPRESSION') {
          return (
            top.includes('EXPRESSION') ||
            top.includes('SHAYARI') ||
            top.includes('POETRY') ||
            top.includes('CONFESSION') ||
            top.includes('QUOTES')
          );
        }
        if (cat === 'LIFE & WORK') {
          return (
            top.includes('LIFE') ||
            top.includes('WORK') ||
            top.includes('JOB') ||
            top.includes('CAREER') ||
            top.includes('BUSINESS') ||
            top.includes('MYWORKLIFE') ||
            sub.includes('WORK') ||
            sub.includes('CAREER')
          );
        }
        if (cat === 'MENTAL HEALTH') {
          return (
            top.includes('MENTAL') ||
            sub.includes('MENTAL') ||
            top.includes('ANXIETY') ||
            top.includes('HEAL') ||
            top.includes('OVERTHINK') ||
            top.includes('LONELINESS') ||
            top.includes('DEPRESSION') ||
            top.includes('STRESS')
          );
        }
        if (cat === 'FAMILY') {
          return top.includes('FAMILY') || sub.includes('FAMILY') || top.includes('PARENT') || top.includes('HOME');
        }
        if (cat === 'PERSONAL GROWTH') {
          return (
            top.includes('GROWTH') ||
            sub.includes('GROWTH') ||
            top.includes('MOTIVAT') ||
            top.includes('HABIT') ||
            top.includes('DISCIPLINE') ||
            top.includes('SELF')
          );
        }
        if (cat === 'EDUCATION') {
          return (
            top.includes('EDUCAT') ||
            sub.includes('EDUCAT') ||
            top.includes('STUDY') ||
            top.includes('COLLEGE') ||
            top.includes('EXAM') ||
            top.includes('SCHOOL')
          );
        }
        if (cat === 'SOCIETY & POLITICS') {
          return top.includes('POLITIC') || top.includes('SOCIETY') || sub.includes('POLITIC') || top.includes('MERANETA') || top.includes('GOVERN');
        }
        if (cat === 'ENTERTAINMENT') {
          return top.includes('ENTERTAIN') || top.includes('MOVIE') || top.includes('MUSIC') || top.includes('BOLLYWOOD') || top.includes('SONG') || top.includes('JABWEMET');
        }
        if (cat === 'SPORTS') {
          return top.includes('SPORT') || top.includes('CRICKET') || top.includes('FOOTBALL') || top.includes('FITNESS');
        }
        if (cat === 'TECHNOLOGY') {
          return top.includes('TECH') || top.includes('TECHNOLOGY') || top.includes('AI') || top.includes('SOFTWARE');
        }
        return top.includes(cat) || sub.includes(cat) || pCat.includes(cat);
      });
    }

    // 2. Search Query Filter: Strips '#' prefix to robustly match hashtags, titles, content, topics and subtopics
    if (searchQuery.trim()) {
      const rawQ = searchQuery.toLowerCase().trim();
      const cleanQ = rawQ.replace(/^#/, '').trim();
      list = list.filter((p) => {
        const title = (p.title || '').toLowerCase();
        const content = (p.content || p.description || p.snippet || '').toLowerCase();
        const topic = (p.topic || '').toLowerCase();
        const subtopic = (p.subtopic || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        return (
          title.includes(rawQ) ||
          title.includes(cleanQ) ||
          content.includes(rawQ) ||
          content.includes(cleanQ) ||
          topic.includes(cleanQ) ||
          subtopic.includes(cleanQ) ||
          category.includes(cleanQ)
        );
      });
    }

    // 3. Sorting Tabs: Trending / Latest / Most Commented
    if (activeFilter === 'latest') {
      return [...list].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    if (activeFilter === 'most_commented') {
      return [...list].sort((a, b) => {
        const countA = a.commentsCount ?? a.commentCount ?? 0;
        const countB = b.commentsCount ?? b.commentCount ?? 0;
        return countB - countA;
      });
    }

    // Default 'trending': engagement weighted score
    return [...list].sort((a, b) => {
      const scoreA = (a.reactions?.HEART || a.likeCount || 0) * 2 + (a.commentsCount || a.commentCount || 0) * 3;
      const scoreB = (b.reactions?.HEART || b.likeCount || 0) * 2 + (b.commentsCount || b.commentCount || 0) * 3;
      if (scoreB !== scoreA) return scoreB - scoreA;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [posts, activeCategory, searchQuery, activeFilter, blockedUsers, mutedUsers, isBlocked, isMuted, isHidden]);

  const handleSelectTopicFromCard = (topic) => {
    if (topic?.id) {
      const topicSlug = String(topic.id).toLowerCase();
      onNavigate ? onNavigate(`/topic/${topicSlug}`) : (window.location.href = `/topic/${topicSlug}`);
    } else if (topic?.name) {
      handleSearchChange(topic.name);
    }
  };

  return (
    <div className="home-page-root">
      {/* ── STICKY APP HEADER ── */}
      <AppHeader onNavigate={onNavigate} />

      {/* ── 3-COLUMN DESKTOP GRID ── */}
      <div className="explore-desktop-grid">
        {/* Column 1: Left Navigation Sidebar */}
        <DesktopSidebar
          activeRoute="/explore"
          onNavigate={onNavigate}
          onJoinCommunity={() => setIsTopicModalOpen(true)}
        />

        {/* Column 2: Center Main Stream */}
        <main className="explore-center-stream" id="explore-main-stream">
          {/* 1. Explore Header (Title + ONE Create Topic Button + Search Bar) */}
          <ExploreHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onCreateTopic={() => setIsTopicModalOpen(true)}
            onNavigate={onNavigate}
          />

          {/* 2. "What's on your mind?" Quick Post Composer */}
          <ExploreComposer
            onNavigate={onNavigate}
            defaultTopic={activeCategory === 'All' ? 'GENERAL' : activeCategory.toUpperCase().replace(/\s+/g, '_')}
          />

          {/* 3. Category Filter Pills */}
          <ExploreCategoryPills
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* 4. Popular Topics Horizontal Carousel */}
          <PopularTopicsCarousel
            topics={popularTopics}
            onSelectTopic={handleSelectTopicFromCard}
            onViewAll={() => (onNavigate ? onNavigate('/topics') : (window.location.href = '/topics'))}
          />

          {/* 5. Trending Discussions Feed */}
          <section className="trending-discussions-section" aria-label="Trending Discussions">
            <TrendingDiscussionsHeader
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
              postCount={filteredDiscussions.length}
            />

            {filteredDiscussions.length === 0 ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid var(--border-light, #CEC7C5)',
                  padding: '44px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '28px' }}>💬</span>
                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--eclipse, #2D1D15)' }}>
                  No discussions found
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--hurricane, #8C8385)', margin: 0, maxWidth: '340px', lineHeight: 1.5 }}>
                  {searchQuery
                    ? `No discussions matching "${searchQuery}". Try a different keyword or create a new topic!`
                    : activeCategory !== 'All'
                    ? `No discussions found in ${activeCategory}. Be the first to start a conversation!`
                    : 'Be the first to share an unspoken thought in this community.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(true)}
                  style={{
                    marginTop: '8px',
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    background: 'var(--deep-plum, #6F405F)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Start Discussion
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredDiscussions.map((post) => (
                  <TrendingDiscussionCard
                    key={post.id}
                    post={post}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Column 3: Right Sidebar (NO duplicate Create Topic button) */}
        <ExploreRightSidebar
          trendingTopics={sidebarTrendingTopics}
          suggestedTopics={sidebarSuggestedTopics}
          onSelectTopic={(topicId) => {
            const matched = popularTopics.find((t) => t.id === topicId);
            handleSearchChange(matched?.name || topicId.replace(/_/g, ' '));
          }}
          onNavigate={onNavigate}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation activeRoute="/explore" onNavigate={onNavigate} />

      {/* ONE Single Topic Creation Modal */}
      <TopicCreateModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onCreated={(topic) => (onNavigate ? onNavigate(`/topic/${topic.id}`) : (window.location.href = `/topic/${topic.id}`))}
      />
    </div>
  );
}
