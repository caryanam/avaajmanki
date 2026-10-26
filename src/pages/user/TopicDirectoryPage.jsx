import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  Search,
  PlusCircle,
  Hash,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  MessageCircle,
  Users,
} from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader.jsx';
import { DesktopSidebar } from '../../components/layout/DesktopSidebar.jsx';
import { MobileNavigation } from '../../components/layout/MobileNavigation.jsx';
import { ExploreRightSidebar } from '../../components/explore/ExploreRightSidebar.jsx';
import { TopicCreateModal } from '../../components/topics/TopicCreateModal.jsx';
import { apiTopicService } from '../../services/apiTopicService.js';
import { usePosts } from '../../context/PostContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getMediaUrl } from '../../config/env.js';

// High-resolution photography cover assets
import topicLove from '../../assets/explore/topic-love.jpg';
import topicLifeWork from '../../assets/explore/topic-life-work.jpg';
import topicMentalHealth from '../../assets/explore/mental-health-cover.jpg';
import topicFamily from '../../assets/explore/topic-family.jpg';
import topicEducation from '../../assets/explore/education-cover.jpg';
import topicMotivation from '../../assets/explore/motivation-cover.jpg';
import topicRelationships from '../../assets/explore/relationships-cover.jpg';
import topicFriendship from '../../assets/explore/friendship-cover.jpg';

const CATEGORY_TABS = [
  { id: 'All', label: 'All Topics' },
  { id: 'Relationships', label: 'Relationships' },
  { id: 'Life & Work', label: 'Life & Work' },
  { id: 'Mental Health', label: 'Mental Health' },
  { id: 'Family', label: 'Family' },
  { id: 'Personal Growth', label: 'Personal Growth' },
  { id: 'Education', label: 'Education' },
  { id: 'Sports', label: 'Sports' },
  { id: 'Entertainment', label: 'Entertainment' },
  { id: 'Society & Politics', label: 'Society & Politics' },
  { id: 'Others', label: 'Others' },
];

const ITEMS_PER_PAGE = 12;

export function TopicDirectoryPage({ onNavigate }) {
  const { posts = [] } = usePosts();
  const { t } = useLanguage();

  const [serverTopics, setServerTopics] = useState([]);
  const [topicStats, setTopicStats] = useState({ counts: {}, scores: {}, userParticipatedTopics: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [sortParam, setSortParam] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sort') || '';
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const handleSyncUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setSortParam(params.get('sort') || '');
    };
    window.addEventListener('popstate', handleSyncUrl);
    return () => window.removeEventListener('popstate', handleSyncUrl);
  }, []);

  const fetchTopics = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiTopicService.getTopics(),
      apiTopicService.getTopicStats().catch(() => ({ counts: {}, scores: {}, userParticipatedTopics: [] })),
    ])
      .then(([items, stats]) => {
        setServerTopics(Array.isArray(items) ? items : []);
        if (stats) setTopicStats(stats);
      })
      .catch((err) => {
        console.error('[TopicDirectoryPage] fetch topics error:', err);
        setError('Failed to load topic directory. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTopics();
    const handleCreated = () => fetchTopics();
    window.addEventListener('mka:topicCreated', handleCreated);
    return () => window.removeEventListener('mka:topicCreated', handleCreated);
  }, [fetchTopics]);

  // Compute dynamic post counts from active posts
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

  // Discussion counts and recent activity scores from backend database
  const getTopicCount = useCallback((topicId, topicName, parentTopic) => {
    const counts = topicStats?.counts || {};
    const uId = String(topicId || '').toUpperCase();
    const uName = String(topicName || '').toUpperCase().replace(/[\s&]+/g, '_');
    const uParent = String(parentTopic || '').toUpperCase();

    if (counts[uId] !== undefined) return counts[uId];
    if (counts[uName] !== undefined) return counts[uName];
    if (uParent && counts[uParent] !== undefined) return counts[uParent];
    if (topicCounts[uId] !== undefined) return topicCounts[uId];
    return 0;
  }, [topicStats, topicCounts]);

  const getTopicScore = useCallback((topicId, topicName, parentTopic) => {
    const scores = topicStats?.scores || {};
    const uId = String(topicId || '').toUpperCase();
    const uName = String(topicName || '').toUpperCase().replace(/[\s&]+/g, '_');
    const uParent = String(parentTopic || '').toUpperCase();

    if (scores[uId] !== undefined) return scores[uId];
    if (scores[uName] !== undefined) return scores[uName];
    if (uParent && scores[uParent] !== undefined) return scores[uParent];
    return 0;
  }, [topicStats]);

  // Combine canonical base topics with verified server topics
  const allTopics = useMemo(() => {
    const canonical = [
      {
        id: 'LOVE',
        name: 'Love',
        category: 'Relationships',
        parentTopic: 'FEELINGS',
        badgeBg: '#FFE4E6',
        badgeColor: '#BE123C',
        icon: '❤️',
        image: topicLove,
        count: getTopicCount('LOVE', 'Love', 'FEELINGS'),
        score: getTopicScore('LOVE', 'Love', 'FEELINGS'),
        createdByUsername: 'Community',
      },
      {
        id: 'LIFE_WORK',
        name: 'Life & Work',
        category: 'Life & Work',
        parentTopic: 'LIFE_WORK',
        badgeBg: '#E0F2FE',
        badgeColor: '#0284C7',
        icon: '💼',
        image: topicLifeWork,
        count: getTopicCount('LIFE_WORK', 'Life & Work', 'LIFE_WORK'),
        score: getTopicScore('LIFE_WORK', 'Life & Work', 'LIFE_WORK'),
        createdByUsername: 'Community',
      },
      {
        id: 'MENTAL_HEALTH',
        name: 'Mental Health',
        category: 'Mental Health',
        parentTopic: 'FEELINGS',
        badgeBg: '#DCFCE7',
        badgeColor: '#16A34A',
        icon: '🌱',
        image: topicMentalHealth,
        count: getTopicCount('MENTAL_HEALTH', 'Mental Health', 'FEELINGS'),
        score: getTopicScore('MENTAL_HEALTH', 'Mental Health', 'FEELINGS'),
        createdByUsername: 'Community',
      },
      {
        id: 'FAMILY',
        name: 'Family',
        category: 'Family',
        parentTopic: 'PARENTING',
        badgeBg: '#FFEDD5',
        badgeColor: '#EA580C',
        icon: '🏠',
        image: topicFamily,
        count: getTopicCount('FAMILY', 'Family', 'PARENTING'),
        score: getTopicScore('FAMILY', 'Family', 'PARENTING'),
        createdByUsername: 'Community',
      },
      {
        id: 'PERSONAL_GROWTH',
        name: 'Personal Growth',
        category: 'Personal Growth',
        parentTopic: 'EXPRESSION',
        badgeBg: '#FFE4E6',
        badgeColor: '#BE123C',
        icon: '📈',
        image: topicMotivation,
        count: getTopicCount('PERSONAL_GROWTH', 'Personal Growth', 'EXPRESSION'),
        score: getTopicScore('PERSONAL_GROWTH', 'Personal Growth', 'EXPRESSION'),
        createdByUsername: 'Community',
      },
      {
        id: 'EDUCATION',
        name: 'Education',
        category: 'Education',
        parentTopic: 'EDUCATION',
        badgeBg: '#E0F2FE',
        badgeColor: '#0284C7',
        icon: '🎓',
        image: topicEducation,
        count: getTopicCount('EDUCATION', 'Education', 'EDUCATION'),
        score: getTopicScore('EDUCATION', 'Education', 'EDUCATION'),
        createdByUsername: 'Community',
      },
      {
        id: 'RELATIONSHIPS',
        name: 'Relationships',
        category: 'Relationships',
        parentTopic: 'RELATIONSHIPS',
        badgeBg: '#F3E8FF',
        badgeColor: '#9333EA',
        icon: '💞',
        image: topicRelationships,
        count: getTopicCount('RELATIONSHIPS', 'Relationships', 'RELATIONSHIPS'),
        score: getTopicScore('RELATIONSHIPS', 'Relationships', 'RELATIONSHIPS'),
        createdByUsername: 'Community',
      },
      {
        id: 'FRIENDSHIP',
        name: 'Friendship',
        category: 'Relationships',
        parentTopic: 'FEELINGS',
        badgeBg: '#CCFBF1',
        badgeColor: '#0D9488',
        icon: '🤝',
        image: topicFriendship,
        count: getTopicCount('FRIENDSHIP', 'Friendship', 'FEELINGS'),
        score: getTopicScore('FRIENDSHIP', 'Friendship', 'FEELINGS'),
        createdByUsername: 'Community',
      },
    ];

    const canonicalIds = new Set(canonical.map((c) => c.id.toUpperCase()));

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
        case 'SPORTS':
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

    const custom = (serverTopics || [])
      .filter((st) => {
        const sName = String(st.name || '').toUpperCase().trim();
        return sName && !canonicalIds.has(sName);
      })
      .map((st) => {
        const cat = mapParentToCategory(st.parentTopic);
        const sName = String(st.name || '').toUpperCase().trim();
        const realCount = getTopicCount(sName, st.label || st.name, st.parentTopic) || 0;
        const realScore = getTopicScore(sName, st.label || st.name, st.parentTopic);
        const fallbackCover = getTopicCover(st.parentTopic);
        const storedCover = typeof window !== 'undefined'
          ? (JSON.parse(localStorage.getItem('mka_topic_covers') || '{}')[String(st.id)] ||
             JSON.parse(localStorage.getItem('mka_topic_covers') || '{}')[String(st.name).toLowerCase()] ||
             JSON.parse(localStorage.getItem('mka_topic_covers') || '{}')[String(st.label || '').toLowerCase()])
          : null;
        const rawCover = st.imageUrl || storedCover;
        const resolvedCover = rawCover ? getMediaUrl(rawCover) : fallbackCover;

        return {
          id: String(st.id),
          uniqueKey: `custom-${st.id}`,
          slug: String(st.name).toLowerCase(),
          name: formatTitle(st),
          category: cat,
          parentTopic: st.parentTopic,
          badgeBg: '#FFE4E6',
          badgeColor: '#BE123C',
          icon: st.icon || '✨',
          image: resolvedCover,
          fallbackImage: fallbackCover,
          count: realCount,
          score: realScore,
          isCustom: true,
          createdByUsername: st.createdByUsername || '@anonymous',
        };
      });

    const canonicalWithKeys = canonical.map((c) => ({
      ...c,
      uniqueKey: `canonical-${String(c.id).toLowerCase()}`,
      fallbackImage: c.image,
    }));

    return [...canonicalWithKeys, ...custom];
  }, [serverTopics, getTopicCount, getTopicScore]);

  // Filter topics by Category and Search Query
  const filteredTopics = useMemo(() => {
    let result = allTopics;

    // 1. Category Filter
    if (activeCategory !== 'All') {
      const cat = activeCategory.toUpperCase();
      result = result.filter((item) => {
        if (cat === 'RELATIONSHIPS') {
          return item.category === 'Relationships' || item.parentTopic === 'FEELINGS' || item.parentTopic === 'RELATIONSHIPS';
        }
        if (cat === 'LIFE & WORK' || cat === 'LIFE_WORK') {
          return item.category === 'Life & Work' || item.parentTopic === 'LIFE_WORK';
        }
        if (cat === 'PERSONAL GROWTH' || cat === 'PERSONAL_GROWTH') {
          return item.category === 'Personal Growth' || item.parentTopic === 'EXPRESSION';
        }
        if (cat === 'EDUCATION') {
          return item.category === 'Education' || item.parentTopic === 'EDUCATION';
        }
        if (cat === 'MENTAL HEALTH') {
          return item.category === 'Mental Health';
        }
        if (cat === 'FAMILY') {
          return item.category === 'Family' || item.parentTopic === 'PARENTING';
        }
        if (cat === 'SPORTS') {
          return item.category === 'Sports' || item.parentTopic === 'SPORTS';
        }
        if (cat === 'OTHERS' || cat === 'GENERAL') {
          return item.category === 'Others' || item.parentTopic === 'GENERAL';
        }
        return item.category.toUpperCase() === cat;
      });
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const qNorm = q.replace(/[^a-z0-9]/g, '');
      result = result.filter((item) => {
        const name = item.name.toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const creator = (item.createdByUsername || '').toLowerCase();
        const norm = name.replace(/[^a-z0-9]/g, '');
        return (
          name.includes(q) ||
          cat.includes(q) ||
          creator.includes(q) ||
          (qNorm && norm.includes(qNorm))
        );
      });
    }

    return result;
  }, [allTopics, activeCategory, searchQuery]);

  // 3. Sort Order: popular | trending | suggested | default
  const sortedTopics = useMemo(() => {
    const list = [...filteredTopics];
    if (sortParam === 'popular') {
      return list.sort((a, b) => {
        const countDiff = (b.count || 0) - (a.count || 0);
        if (countDiff !== 0) return countDiff;
        return a.name.localeCompare(b.name);
      });
    }
    if (sortParam === 'trending') {
      return list.sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        const countDiff = (b.count || 0) - (a.count || 0);
        if (countDiff !== 0) return countDiff;
        return a.name.localeCompare(b.name);
      });
    }
    if (sortParam === 'suggested') {
      const userTopicsSet = new Set((topicStats?.userParticipatedTopics || []).map((t) => String(t).toUpperCase()));
      return list.sort((a, b) => {
        const aPart = userTopicsSet.has(String(a.id || '').toUpperCase()) || userTopicsSet.has(String(a.name || '').toUpperCase().replace(/[\s&]+/g, '_'));
        const bPart = userTopicsSet.has(String(b.id || '').toUpperCase()) || userTopicsSet.has(String(b.name || '').toUpperCase().replace(/[\s&]+/g, '_'));
        if (aPart !== bPart) {
          return aPart ? 1 : -1;
        }
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        const countDiff = (b.count || 0) - (a.count || 0);
        if (countDiff !== 0) return countDiff;
        return a.name.localeCompare(b.name);
      });
    }
    return list;
  }, [filteredTopics, sortParam, topicStats]);

  // Derived real sidebar lists
  const sidebarTrendingTopics = useMemo(() => {
    return [...allTopics]
      .sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        const countDiff = (b.count || 0) - (a.count || 0);
        if (countDiff !== 0) return countDiff;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        name: t.name,
        icon: t.icon || '🔥',
        badgeBg: t.badgeBg || '#FFE4E6',
        count: t.count || 0,
        score: t.score || 0,
      }));
  }, [allTopics]);

  const sidebarSuggestedTopics = useMemo(() => {
    const userTopicsSet = new Set((topicStats?.userParticipatedTopics || []).map((t) => String(t).toUpperCase()));
    const isGuest = !userTopicsSet || userTopicsSet.size === 0;

    let candidates = allTopics;
    if (!isGuest) {
      candidates = allTopics.filter((t) => {
        const uId = String(t.id || '').toUpperCase();
        const uName = String(t.name || '').toUpperCase().replace(/[\s&]+/g, '_');
        return !userTopicsSet.has(uId) && !userTopicsSet.has(uName);
      });
    }

    const sorted = [...candidates].sort((a, b) => {
      const scoreDiff = (b.score || 0) - (a.score || 0);
      if (scoreDiff !== 0) return scoreDiff;
      const countDiff = (b.count || 0) - (a.count || 0);
      if (countDiff !== 0) return countDiff;
      return a.name.localeCompare(b.name);
    });

    let result = sorted.slice(0, 6);
    if (result.length < 6) {
      const existingIds = new Set(result.map((r) => r.id));
      const remaining = [...allTopics]
        .filter((t) => !existingIds.has(t.id))
        .sort((a, b) => (b.count || 0) - (a.count || 0));
      result = [...result, ...remaining.slice(0, 6 - result.length)];
    }

    return result.map((t) => ({
      id: t.id,
      name: t.name,
      image: t.image,
      icon: t.icon,
      count: t.count || 0,
    }));
  }, [allTopics, topicStats]);

  const headingText = useMemo(() => {
    if (sortParam === 'popular') {
      return {
        title: t('explore.popularTopics', 'Popular Topics'),
        subtitle: t('explore.popularTopicsSubtitle', 'Browse the most active and popular community topics.'),
        breadcrumb: t('explore.popularTopics', 'Popular Topics'),
      };
    }
    if (sortParam === 'trending') {
      return {
        title: t('explore.trendingTopics', 'Trending Topics'),
        subtitle: t('explore.trendingTopicsSubtitle', 'Browse topics with the highest recent activity and conversations.'),
        breadcrumb: t('explore.trendingTopics', 'Trending Topics'),
      };
    }
    if (sortParam === 'suggested') {
      return {
        title: t('explore.suggestedTopics', 'Suggested for You'),
        subtitle: t('explore.suggestedTopicsSubtitle', 'Discover new topics and conversations curated for you.'),
        breadcrumb: t('explore.suggestedTopics', 'Suggested for You'),
      };
    }
    return {
      title: t('explore.topicDirectory', 'Topic Directory'),
      subtitle: t('explore.topicDirectorySubtitle', 'Browse and discover all community topics and discussions.'),
      breadcrumb: t('explore.topicDirectory', 'Topic Directory'),
    };
  }, [sortParam, t]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedTopics.length / ITEMS_PER_PAGE));
  const paginatedTopics = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedTopics.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTopics, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="home-page-root">
      {/* Fixed Sticky Header */}
      <AppHeader onNavigate={onNavigate} />

      {/* 3-Column Desktop Grid Layout */}
      <div className="explore-desktop-grid">
        {/* Column 1: Left Navigation */}
        <DesktopSidebar
          activeRoute="/topics"
          onNavigate={onNavigate}
          onJoinCommunity={() => setIsCreateModalOpen(true)}
        />

        {/* Column 2: Center Content Area */}
        <main className="explore-center-stream" id="topic-directory-stream">
          {/* Header Title Section */}
          <div className="explore-header-section">
            <div className="explore-breadcrumbs">
              <span
                className="breadcrumb-link"
                onClick={() => (onNavigate ? onNavigate('/home') : (window.location.href = '/home'))}
              >
                Home
              </span>
              <span className="breadcrumb-separator">/</span>
              <span
                className="breadcrumb-link"
                onClick={() => (onNavigate ? onNavigate('/explore') : (window.location.href = '/explore'))}
              >
                Explore
              </span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{headingText.breadcrumb}</span>
            </div>

            <div className="explore-header-title-row">
              <div className="explore-title-text-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: '#FFF1F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#E11D48',
                    }}
                  >
                    <Compass size={20} />
                  </span>
                  <h1 className="explore-page-title" style={{ margin: 0 }}>
                    {headingText.title}
                  </h1>
                </div>
                <p className="explore-page-subtitle" style={{ marginTop: 4 }}>
                  {headingText.subtitle}
                </p>
              </div>

              <button
                type="button"
                className="explore-create-topic-btn"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <PlusCircle size={17} />
                <span>Create Topic</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="explore-search-wrap">
              <Search size={18} className="explore-search-icon" />
              <input
                type="text"
                className="explore-search-input"
                placeholder="Search topics by name, category, or keyword..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="explore-category-pills-row" role="tablist" aria-label="Topic categories">
            {CATEGORY_TABS.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`explore-category-pill ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setCurrentPage(1);
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Result Count Status Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: '#64748B',
              padding: '0 4px',
            }}
          >
            <span>
              Showing {filteredTopics.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTopics.length)} of {filteredTopics.length} topics
            </span>

            {(activeCategory !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E11D48',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Main Topics Grid / States */}
          {loading ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                padding: '60px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Loader2 size={32} className="spin-animation" style={{ color: '#E11D48' }} />
              <p style={{ margin: 0, color: '#64748B', fontWeight: 500 }}>
                Loading topics from server...
              </p>
            </div>
          ) : error ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                padding: '50px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 32 }}>⚠️</span>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: 18, fontWeight: 700 }}>
                {error}
              </h3>
              <button
                type="button"
                onClick={fetchTopics}
                style={{
                  background: '#E11D48',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '9px 18px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                padding: '60px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 36 }}>🔍</span>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: 18, fontWeight: 700 }}>
                No topics found
              </h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: 14, maxWidth: 360 }}>
                {searchQuery
                  ? `No topics match "${searchQuery}". Try a different keyword or create this topic now!`
                  : `No topics currently in this category. Be the first to create one!`}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    border: 'none',
                    borderRadius: 10,
                    padding: '9px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{
                    background: '#E11D48',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 10,
                    padding: '9px 18px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Create Topic
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px',
                width: '100%',
                boxBox: 'border-box',
              }}
            >
              {paginatedTopics.map((topic) => (
                <div
                  key={topic.uniqueKey || (topic.isCustom ? `custom-${topic.id}` : `canonical-${topic.id}`)}
                  className="topic-card"
                  onClick={() =>
                    onNavigate
                      ? onNavigate(`/topic/${topic.id}`)
                      : (window.location.href = `/topic/${topic.id}`)
                  }
                  role="button"
                  tabIndex={0}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.08)';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.04)';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  {/* Card Image Header */}
                  <div style={{ position: 'relative', width: '100%', height: 120 }}>
                    <img
                      src={getMediaUrl(topic.image)}
                      alt={topic.name}
                      onError={(e) => {
                        const fb = topic.fallbackImage || getTopicCover(topic.parentTopic);
                        if (fb && e.currentTarget.src !== fb) {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fb;
                        }
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)',
                      }}
                    />
                    {/* Category Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: 'rgba(255, 255, 255, 0.94)',
                        padding: '3px 8px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#0F172A',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {topic.category || 'Topic'}
                    </div>

                    {/* Icon Circle */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 10,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    >
                      {topic.icon || '💡'}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#0F172A',
                        lineHeight: 1.3,
                      }}
                    >
                      {topic.name}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: '12px',
                        color: '#64748B',
                        marginTop: 'auto',
                        paddingTop: 8,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageCircle size={13} style={{ color: '#E11D48' }} />
                        <span>
                          {topic.count} {topic.count === 1 ? t('explore.discussionSingular', 'discussion') : t('explore.discussionPlural', 'discussions')}
                        </span>
                      </span>

                      {topic.createdByUsername && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
                          <Users size={12} />
                          <span>{topic.createdByUsername}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 18,
                paddingBottom: 24,
              }}
            >
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentPage <= 1 ? '#CBD5E1' : '#0F172A',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                }}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: p === currentPage ? 'none' : '1px solid #E2E8F0',
                    background: p === currentPage ? '#E11D48' : '#FFFFFF',
                    color: p === currentPage ? '#FFFFFF' : '#0F172A',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentPage >= totalPages ? '#CBD5E1' : '#0F172A',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                }}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>

        {/* Column 3: Right Sidebar */}
        <ExploreRightSidebar
          trendingTopics={sidebarTrendingTopics}
          suggestedTopics={sidebarSuggestedTopics}
          onSelectTopic={(topicId) => {
            onNavigate ? onNavigate(`/topic/${topicId.toLowerCase()}`) : (window.location.href = `/topic/${topicId.toLowerCase()}`);
          }}
          onNavigate={onNavigate}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation activeRoute="/explore" onNavigate={onNavigate} />

      {/* Create Topic Modal */}
      <TopicCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(topic) => {
          fetchTopics();
          onNavigate ? onNavigate(`/topic/${topic.id}`) : (window.location.href = `/topic/${topic.id}`);
        }}
      />
    </div>
  );
}
