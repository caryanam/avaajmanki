import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, ChevronDown, Plus, X, AlertCircle } from 'lucide-react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiTopicService } from '../../services/apiTopicService.js';
import { TopicCreateModal } from '../../components/topics/TopicCreateModal.jsx';
import { MyTopicRow, formatTopicTitle, getCategoryLabel } from '../../components/my-topics/MyTopicRow.jsx';
import '../../styles/my-topics.css';

export function MyPostsPage({ onNavigate }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch only authenticated user's created topics
  const fetchMyTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allTopics = await apiTopicService.getTopics();
      const currentHandle = String(currentUser?.username || '').replace(/^@/, '').toLowerCase().trim();

      // Filter by authenticated user ownership
      const userOwnedTopics = (allTopics || []).filter((topic) => {
        const creator = String(topic.createdByUsername || '').replace(/^@/, '').toLowerCase().trim();
        return currentHandle && (creator === currentHandle || creator === `@${currentHandle}`);
      });

      setTopics(userOwnedTopics);
    } catch (err) {
      console.error('[MyPostsPage] Failed to fetch topics:', err);
      setError('Unable to load your topics. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.username]);

  useEffect(() => {
    fetchMyTopics();
    const handleCreated = () => fetchMyTopics();
    window.addEventListener('mka:topicCreated', handleCreated);
    return () => window.removeEventListener('mka:topicCreated', handleCreated);
  }, [fetchMyTopics]);

  // Combined search and sorting
  const filteredAndSortedTopics = useMemo(() => {
    let list = [...topics];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const title = formatTopicTitle(t).toLowerCase();
        const rawName = String(t.name || '').toLowerCase();
        const desc = String(t.description || t.initialComment || '').toLowerCase();
        const cat = getCategoryLabel(t).toLowerCase();
        return title.includes(q) || rawName.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }

    // Sort order
    if (sortBy === 'latest') {
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    if (sortBy === 'oldest') {
      return list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    if (sortBy === 'alphabetical') {
      return list.sort((a, b) => {
        const titleA = formatTopicTitle(a).toLowerCase();
        const titleB = formatTopicTitle(b).toLowerCase();
        return titleA.localeCompare(titleB);
      });
    }

    return list;
  }, [topics, searchQuery, sortBy]);

  const handleViewTopic = (topicId) => {
    if (!topicId) return;
    onNavigate(`/topic/${topicId}`);
  };

  const handleCopyLink = (topic) => {
    const link = `${window.location.origin}/topic/${topic.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        addToast('Topic link copied to clipboard!', 'success');
      }).catch(() => {
        addToast('Unable to copy link', 'error');
      });
    } else {
      addToast('Topic link: ' + link, 'info');
    }
  };

  const handleTopicCreated = (newTopic) => {
    setTopics((prev) => [newTopic, ...prev]);
    fetchMyTopics();
  };

  return (
    <UserLayout activeRoute="/my-posts" onNavigate={onNavigate} wide={true}>
      <div className="my-topics-page-container">
        {/* ── Section A: My Topics Header ── */}
        <header className="my-topics-header-card">
          <div className="my-topics-header-left">
            <h1 className="my-topics-page-title">My Topics</h1>
            <p className="my-topics-page-subtitle">
              Manage the topics you've created.
            </p>
          </div>

          <button
            type="button"
            className="my-topics-primary-create-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>Create Topic</span>
          </button>
        </header>

        {/* ── Section B: Search and Sorting Toolbar ── */}
        <div className="my-topics-toolbar">
          <div className="my-topics-search-wrap">
            <Search size={18} className="my-topics-search-icon" />
            <input
              type="text"
              className="my-topics-search-input"
              placeholder="Search your topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search your topics"
            />
            {searchQuery && (
              <button
                type="button"
                className="my-topics-search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="my-topics-sort-container">
            <select
              className="my-topics-sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort your topics"
            >
              <option value="latest">Sort by: Latest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="alphabetical">Sort by: Alphabetical</option>
            </select>
            <ChevronDown size={15} className="my-topics-sort-chevron" />
          </div>
        </div>

        {/* ── Section C: Compact Topic List ── */}
        {loading ? (
          <div className="my-topics-rows-list">
            {[1, 2, 3].map((n) => (
              <div key={n} className="my-topic-skeleton-row">
                <div className="skeleton-box" style={{ width: 180, height: 105, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton-box" style={{ width: 90, height: 20 }} />
                  <div className="skeleton-box" style={{ width: '60%', height: 22 }} />
                  <div className="skeleton-box" style={{ width: '85%', height: 16 }} />
                  <div className="skeleton-box" style={{ width: '40%', height: 14 }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="my-topics-empty-state-card">
            <AlertCircle size={32} style={{ color: '#E11D48' }} />
            <h3>Failed to load topics</h3>
            <p>{error}</p>
            <button
              type="button"
              className="my-topics-empty-btn"
              onClick={fetchMyTopics}
            >
              Retry
            </button>
          </div>
        ) : topics.length === 0 ? (
          <div className="my-topics-empty-state-card">
            <h3>You haven't created any topics yet.</h3>
            <p>
              Start a new community and let others join the conversation around your passions and ideas.
            </p>
            <button
              type="button"
              className="my-topics-empty-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>Create Topic</span>
            </button>
          </div>
        ) : filteredAndSortedTopics.length === 0 ? (
          <div className="my-topics-empty-state-card">
            <h3>No topics match your search.</h3>
            <p>We couldn't find any topics matching "{searchQuery}".</p>
            <button
              type="button"
              className="my-topics-empty-btn"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="my-topics-rows-list">
            {filteredAndSortedTopics.map((topic) => (
              <MyTopicRow
                key={topic.id}
                topic={topic}
                onViewTopic={handleViewTopic}
                onCopyLink={handleCopyLink}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Approved Create Topic Modal ── */}
      <TopicCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleTopicCreated}
      />
    </UserLayout>
  );
}

export default MyPostsPage;
