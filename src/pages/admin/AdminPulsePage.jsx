import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout.jsx';
import { PulseStatsOverview } from '../../components/admin/pulse/PulseStatsOverview.jsx';
import { PulseCandidateReviewModal } from '../../components/admin/pulse/PulseCandidateReviewModal.jsx';
import { PulseItemEditorModal } from '../../components/admin/pulse/PulseItemEditorModal.jsx';
import { PulsePlacementModal } from '../../components/admin/pulse/PulsePlacementModal.jsx';
import { PulseModerationModal } from '../../components/admin/pulse/PulseModerationModal.jsx';
import { PulseAuditTrailModal } from '../../components/admin/pulse/PulseAuditTrailModal.jsx';
import { PulseSourceModal } from '../../components/admin/pulse/PulseSourceModal.jsx';
import { PulseDeleteConfirmModal } from '../../components/admin/pulse/PulseDeleteConfirmModal.jsx';
import { apiAdminPulseService } from '../../services/apiAdminPulseService.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Radio,
  Newspaper,
  Rss,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Edit3,
  Layers,
  Eye,
  EyeOff,
  History,
  Trash2,
  ExternalLink,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function AdminPulsePage({ onNavigate, initialTab = 'items', autoOpenCreate = false }) {
  const { addToast } = useToast();

  // Active workspace tab: 'items' | 'candidates' | 'sources'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Loading & refreshing
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Top summary stats
  const [stats, setStats] = useState({
    pendingCandidates: 0,
    publishedCount: 0,
    featuredCount: 0,
    scheduledCount: 0,
    hiddenCount: 0,
    activeSources: 0,
  });

  // ==========================================
  // TAB 1: PULSE ITEMS STATE & FILTERS
  // ==========================================
  const [items, setItems] = useState([]);
  const [itemsPage, setItemsPage] = useState(0);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const [itemsTotalElements, setItemsTotalElements] = useState(0);
  const [itemPubFilter, setItemPubFilter] = useState('ALL');
  const [itemPlacementFilter, setItemPlacementFilter] = useState('ALL');
  const [itemModFilter, setItemModFilter] = useState('ALL');
  const [itemTopicSearch, setItemTopicSearch] = useState('');

  // ==========================================
  // ==========================================
  // TAB 2: CANDIDATES STATE & FILTERS
  // ==========================================
  const [candidates, setCandidates] = useState([]);
  const [candidatesPage, setCandidatesPage] = useState(0);
  const [candidatesTotalPages, setCandidatesTotalPages] = useState(1);
  const [candidatesTotalElements, setCandidatesTotalElements] = useState(0);
  const [candidateStatusFilter, setCandidateStatusFilter] = useState('PENDING_REVIEW');
  const [candidateSourceFilter, setCandidateSourceFilter] = useState('');
  const [candidateCategoryFilter, setCandidateCategoryFilter] = useState('ALL');
  const [categoryCounts, setCategoryCounts] = useState({
    ALL: 0,
    GENERAL_NEWS: 0,
    ENTERTAINMENT: 0,
    SPORTS: 0,
    TECHNOLOGY: 0,
  });

  // ==========================================
  // TAB 3: SOURCES STATE & FILTERS
  // ==========================================
  const [sources, setSources] = useState([]);
  const [sourcesPage, setSourcesPage] = useState(0);
  const [sourcesTotalPages, setSourcesTotalPages] = useState(1);
  const [sourcesTotalElements, setSourcesTotalElements] = useState(0);
  const [sourceActiveFilter, setSourceActiveFilter] = useState('ALL');

  // ==========================================
  // MODALS STATE
  // ==========================================
  const [candidateReviewTarget, setCandidateReviewTarget] = useState(null);
  const [itemEditorTarget, setItemEditorTarget] = useState(null);
  const [isCreatingItem, setIsCreatingItem] = useState(autoOpenCreate);
  const [placementTarget, setPlacementTarget] = useState(null);
  const [moderationTarget, setModerationTarget] = useState(null);
  const [auditLogTarget, setAuditLogTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sourceEditorTarget, setSourceEditorTarget] = useState(null);
  const [isCreatingSource, setIsCreatingSource] = useState(false);
  const [fetchingSourceId, setFetchingSourceId] = useState(null);

  // ==========================================
  // DATA FETCHING
  // ==========================================

  // Fetch category counts breakdown
  const fetchCategoryCounts = useCallback(async () => {
    try {
      const res = await apiAdminPulseService.getCandidateCategoryCounts({
        status: candidateStatusFilter !== 'ALL' ? candidateStatusFilter : undefined,
        sourceId: candidateSourceFilter ? Number(candidateSourceFilter) : undefined,
      });
      if (res?.data) {
        setCategoryCounts({
          ALL: res.data.ALL ?? 0,
          GENERAL_NEWS: res.data.GENERAL_NEWS ?? 0,
          ENTERTAINMENT: res.data.ENTERTAINMENT ?? 0,
          SPORTS: res.data.SPORTS ?? 0,
          TECHNOLOGY: res.data.TECHNOLOGY ?? 0,
        });
      }
    } catch (err) {
      console.warn('Failed to load candidate category counts:', err);
    }
  }, [candidateStatusFilter, candidateSourceFilter]);

  // Load summary metrics across all entities
  const loadOverviewStats = useCallback(async () => {
    try {
      const [candRes, pubRes, featRes, schedRes, hidRes, srcRes] = await Promise.allSettled([
        apiAdminPulseService.getCandidates({ status: 'PENDING_REVIEW', size: 1 }),
        apiAdminPulseService.getItems({ publicationStatus: 'PUBLISHED', size: 1 }),
        apiAdminPulseService.getItems({ placement: 'FEATURED_PULSE', size: 1 }),
        apiAdminPulseService.getItems({ publicationStatus: 'SCHEDULED', size: 1 }),
        apiAdminPulseService.getItems({ moderationStatus: 'HIDDEN', size: 1 }),
        apiAdminPulseService.getSources({ isActive: true, size: 1 }),
      ]);

      setStats({
        pendingCandidates: candRes.status === 'fulfilled' ? candRes.value?.data?.totalElements ?? 0 : 0,
        publishedCount: pubRes.status === 'fulfilled' ? pubRes.value?.data?.totalElements ?? 0 : 0,
        featuredCount: featRes.status === 'fulfilled' ? featRes.value?.data?.totalElements ?? 0 : 0,
        scheduledCount: schedRes.status === 'fulfilled' ? schedRes.value?.data?.totalElements ?? 0 : 0,
        hiddenCount: hidRes.status === 'fulfilled' ? hidRes.value?.data?.totalElements ?? 0 : 0,
        activeSources: srcRes.status === 'fulfilled' ? srcRes.value?.data?.totalElements ?? 0 : 0,
      });
    } catch (e) {
      console.warn('Failed to fetch summary stats:', e);
    }
  }, []);

  // Fetch Items Tab Data
  const fetchItems = useCallback(async (page = 0) => {
    try {
      const res = await apiAdminPulseService.getItems({
        publicationStatus: itemPubFilter !== 'ALL' ? itemPubFilter : undefined,
        placement: itemPlacementFilter !== 'ALL' ? itemPlacementFilter : undefined,
        moderationStatus: itemModFilter !== 'ALL' ? itemModFilter : undefined,
        topic: itemTopicSearch.trim() || undefined,
        page,
        size: 15,
      });

      const data = res?.data;
      if (data?.content) {
        setItems(data.content);
        setItemsTotalPages(data.totalPages || 1);
        setItemsTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setItems(data);
        setItemsTotalPages(1);
        setItemsTotalElements(data.length);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to load Pulse items:', err);
      setError('Unable to load discussions overview.');
    }
  }, [itemPubFilter, itemPlacementFilter, itemModFilter, itemTopicSearch]);

  // Fetch Candidates Tab Data
  const fetchCandidates = useCallback(async (page = 0) => {
    try {
      const res = await apiAdminPulseService.getCandidates({
        status: candidateStatusFilter !== 'ALL' ? candidateStatusFilter : undefined,
        sourceId: candidateSourceFilter ? Number(candidateSourceFilter) : undefined,
        category: candidateCategoryFilter !== 'ALL' ? candidateCategoryFilter : undefined,
        page,
        size: 15,
      });

      const data = res?.data;
      if (data?.content) {
        setCandidates(data.content);
        setCandidatesTotalPages(data.totalPages || 1);
        setCandidatesTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setCandidates(data);
        setCandidatesTotalPages(1);
        setCandidatesTotalElements(data.length);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error('Failed to load candidates:', err);
      setError('Unable to load review queue.');
    }
  }, [candidateStatusFilter, candidateSourceFilter, candidateCategoryFilter]);

  // Fetch Sources Tab Data
  const fetchSources = useCallback(async (page = 0) => {
    try {
      const res = await apiAdminPulseService.getSources({
        isActive: sourceActiveFilter === 'ACTIVE' ? true : sourceActiveFilter === 'INACTIVE' ? false : undefined,
        page,
        size: 20,
      });

      const data = res?.data;
      if (data?.content) {
        setSources(data.content);
        setSourcesTotalPages(data.totalPages || 1);
        setSourcesTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setSources(data);
        setSourcesTotalPages(1);
        setSourcesTotalElements(data.length);
      } else {
        setSources([]);
      }
    } catch (err) {
      console.error('Failed to load sources:', err);
      setError('Unable to load RSS sources.');
    }
  }, [sourceActiveFilter]);

  // Comprehensive Refresh
  const refreshAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    await Promise.allSettled([
      loadOverviewStats(),
      fetchItems(itemsPage),
      fetchCandidates(candidatesPage),
      fetchCategoryCounts(),
      fetchSources(sourcesPage),
    ]);

    setLoading(false);
    setRefreshing(false);
  }, [loadOverviewStats, fetchItems, itemsPage, fetchCandidates, candidatesPage, fetchCategoryCounts, fetchSources, sourcesPage]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Filter effect updates
  useEffect(() => {
    if (activeTab === 'items') {
      fetchItems(itemsPage);
    }
  }, [activeTab, itemsPage, fetchItems]);

  useEffect(() => {
    if (activeTab === 'candidates') {
      fetchCandidates(candidatesPage);
      fetchCategoryCounts();
    }
  }, [activeTab, candidatesPage, fetchCandidates, fetchCategoryCounts]);

  useEffect(() => {
    if (activeTab === 'sources') {
      fetchSources(sourcesPage);
    }
  }, [activeTab, sourcesPage, fetchSources]);

  // Handle source activation toggle directly
  const handleToggleSourceActive = async (source) => {
    try {
      await apiAdminPulseService.toggleSourceActive(source.id);
      addToast(`Status toggled for source "${source.name}".`, 'info');
      fetchSources(sourcesPage);
      loadOverviewStats();
    } catch (err) {
      addToast(err?.message || 'Failed to toggle source active status.', 'error');
    }
  };

  // Handle manual RSS fetch for a single source
  const handleFetchNow = async (source) => {
    if (fetchingSourceId) return; // Prevent concurrent or repeated ingestion requests
    setFetchingSourceId(source.id);
    try {
      const res = await apiAdminPulseService.fetchSource(source.id);
      const summary = res?.data;
      const imported = summary?.candidatesImported ?? 0;
      const skipped = summary?.duplicatesSkipped ?? 0;
      const errors = summary?.errorCount ?? 0;

      addToast(
        `Fetched "${source.name}": ${imported} imported, ${skipped} skipped, ${errors} errors`,
        errors > 0 && imported === 0 ? 'warning' : 'success'
      );

      // Refresh Candidate Review Queue and source statistics after completion
      await Promise.allSettled([
        fetchSources(sourcesPage),
        fetchCandidates(0),
        loadOverviewStats(),
      ]);
    } catch (err) {
      console.error('Fetch Now error:', err);
      addToast(err?.message || `Failed to fetch RSS feed for "${source.name}".`, 'error');
    } finally {
      setFetchingSourceId(null);
    }
  };

  return (
    <AdminLayout activeRoute="/admin/pulse" onNavigate={onNavigate} onRefresh={() => refreshAll(true)} refreshing={refreshing}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--brand-plum, #6F405F)18',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-plum, #6F405F)',
                }}
              >
                <Radio size={18} />
              </div>
              <h1 className="page-heading" style={{ margin: 0 }}>
                Awaaj Pulse 1.0 Editorial Hub
              </h1>
            </div>
            <p className="secondary-text" style={{ marginTop: '4px' }}>
              Curation control room, news ingestion review, feed placement strategy, and safety moderation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => refreshAll(true)}
              disabled={refreshing}
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #E1DCDB)',
                background: '#fff',
                color: 'var(--eclipse, #2D1D15)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>

            <button
              onClick={() => setIsCreatingSource(true)}
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #E1DCDB)',
                background: '#fff',
                color: 'var(--eclipse, #2D1D15)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <Rss size={14} color="#8b5cf6" />
              Register Source
            </button>

            <button
              onClick={() => setIsCreatingItem(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--brand-plum, #6F405F)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(111, 64, 95, 0.25)',
              }}
            >
              <Plus size={16} />
              Create Discussion
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Top Summary Metrics */}
        <PulseStatsOverview stats={stats} loading={loading} />

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--border-light, #E1DCDB)',
            paddingBottom: '2px',
          }}
        >
          {[
            { id: 'items', label: 'Discussions Overview', icon: Radio, count: stats.publishedCount + stats.scheduledCount },
            { id: 'candidates', label: 'Candidate Review Queue', icon: Newspaper, count: stats.pendingCandidates },
            { id: 'sources', label: 'RSS News Sources', icon: Rss, count: stats.activeSources },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  border: 'none',
                  borderBottom: `3px solid ${isActive ? 'var(--brand-plum, #6F405F)' : 'transparent'}`,
                  backgroundColor: 'transparent',
                  color: isActive ? 'var(--brand-plum, #6F405F)' : 'var(--hurricane, #887B75)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'var(--brand-plum, #6F405F)15' : 'var(--soft-white, #F8F5F3)',
                      color: isActive ? 'var(--brand-plum, #6F405F)' : 'var(--hurricane, #887B75)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DISCUSSIONS OVERVIEW (ITEMS)                       */}
        {/* ========================================================= */}
        {activeTab === 'items' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: 'var(--pure-white, #ffffff)',
                borderRadius: '12px',
                border: '1px solid var(--border-light, #E1DCDB)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Publication Status */}
                <select
                  value={itemPubFilter}
                  onChange={(e) => {
                    setItemPubFilter(e.target.value);
                    setItemsPage(0);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #E1DCDB)',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="ALL">Status: All</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                </select>

                {/* Placement */}
                <select
                  value={itemPlacementFilter}
                  onChange={(e) => {
                    setItemPlacementFilter(e.target.value);
                    setItemsPage(0);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #E1DCDB)',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="ALL">Placement: All</option>
                  <option value="FEATURED_PULSE">FEATURED_PULSE</option>
                  <option value="NORMAL_FEED">NORMAL_FEED</option>
                  <option value="UNLISTED">UNLISTED</option>
                </select>

                {/* Moderation */}
                <select
                  value={itemModFilter}
                  onChange={(e) => {
                    setItemModFilter(e.target.value);
                    setItemsPage(0);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #E1DCDB)',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="ALL">Moderation: All</option>
                  <option value="VISIBLE">VISIBLE</option>
                  <option value="HIDDEN">HIDDEN</option>
                </select>
              </div>

              {/* Topic Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={itemTopicSearch}
                    onChange={(e) => {
                      setItemTopicSearch(e.target.value);
                      setItemsPage(0);
                    }}
                    placeholder="Filter by topic (e.g. POLITICS)..."
                    style={{
                      padding: '7px 12px 7px 32px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light, #E1DCDB)',
                      fontSize: '13px',
                      width: '230px',
                    }}
                  />
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--hurricane, #887B75)' }} />
                </div>
              </div>
            </div>

            {/* Table */}
            {items.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  backgroundColor: 'var(--pure-white, #ffffff)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  textAlign: 'center',
                }}
              >
                <Radio size={36} color="var(--hurricane, #887B75)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)' }}>
                  No Pulse Discussions Found
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--hurricane, #887B75)' }}>
                  There are no items matching the selected filters. Use &quot;Create Discussion&quot; to author a new item or approve from the review queue.
                </p>
              </div>
            ) : (
              <div className="mka-card table-responsive" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--soft-white, #F8F5F3)', borderBottom: '1px solid var(--border-light, #E1DCDB)' }}>
                      <th style={{ padding: '12px 16px' }}>Discussion</th>
                      <th style={{ padding: '12px 14px' }}>Topic</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px' }}>Placement</th>
                      <th style={{ padding: '12px 14px' }}>Moderation</th>
                      <th style={{ padding: '12px 14px' }}>Engagement</th>
                      <th style={{ padding: '12px 14px' }}>Published / Date</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', minWidth: '240px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--swiss-coffee, #F8F5F3)' }}>
                        {/* Discussion thumbnail & title */}
                        <td style={{ padding: '12px 16px', maxWidth: '320px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                onError={(e) => { e.target.style.display = 'none'; }}
                                style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--soft-white, #F8F5F3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--hurricane, #887B75)',
                                  flexShrink: 0,
                                }}
                              >
                                <Radio size={18} />
                              </div>
                            )}

                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 600, color: 'var(--eclipse, #2D1D15)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--hurricane, #887B75)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span>#{item.id}</span>
                                {item.sourceName && <span>• {item.sourceName}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Topic */}
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(111, 64, 95, 0.08)',
                              color: 'var(--brand-plum, #6F405F)',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {item.topic || 'GENERAL'}
                          </span>
                        </td>

                        {/* Publication Status Badge */}
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor:
                                item.publicationStatus === 'PUBLISHED'
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : item.publicationStatus === 'SCHEDULED'
                                  ? 'rgba(59, 130, 246, 0.12)'
                                  : 'rgba(156, 163, 175, 0.15)',
                              color:
                                item.publicationStatus === 'PUBLISHED'
                                  ? '#059669'
                                  : item.publicationStatus === 'SCHEDULED'
                                  ? '#2563eb'
                                  : '#4b5563',
                            }}
                          >
                            {item.publicationStatus}
                          </span>
                        </td>

                        {/* Placement */}
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor:
                                item.placement === 'FEATURED_PULSE'
                                  ? 'rgba(111, 64, 95, 0.12)'
                                  : 'var(--soft-white, #F8F5F3)',
                              color:
                                item.placement === 'FEATURED_PULSE'
                                  ? 'var(--brand-plum, #6F405F)'
                                  : 'var(--eclipse, #2D1D15)',
                            }}
                          >
                            {item.placement === 'FEATURED_PULSE' && <Star size={11} fill="currentColor" />}
                            {item.placement}
                          </span>
                        </td>

                        {/* Moderation */}
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor:
                                item.moderationStatus === 'HIDDEN'
                                  ? 'rgba(239, 68, 68, 0.12)'
                                  : 'rgba(16, 185, 129, 0.08)',
                              color:
                                item.moderationStatus === 'HIDDEN'
                                  ? '#dc2626'
                                  : '#059669',
                            }}
                          >
                            {item.moderationStatus}
                          </span>
                        </td>

                        {/* Engagement Stats */}
                        <td style={{ padding: '12px 14px', color: 'var(--hurricane, #887B75)', fontSize: '12px' }}>
                          <span>💬 {item.commentCount ?? 0}</span>
                          <span style={{ marginLeft: '8px' }}>✍️ {item.takeCount ?? 0}</span>
                          <span style={{ marginLeft: '8px' }}>❤️ {item.likeCount ?? 0}</span>
                        </td>

                        {/* Timestamps */}
                        <td style={{ padding: '12px 14px', color: 'var(--hurricane, #887B75)', fontSize: '11px' }}>
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Draft'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {/* Live View */}
                            {item.publicationStatus === 'PUBLISHED' && item.moderationStatus === 'VISIBLE' && (
                              <button
                                onClick={() => onNavigate(`/pulse/${item.id}`)}
                                title="View Public Discussion Page"
                                style={{
                                  padding: '5px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-light, #E1DCDB)',
                                  backgroundColor: '#fff',
                                  color: 'var(--brand-plum, #6F405F)',
                                  cursor: 'pointer',
                                }}
                              >
                                <ExternalLink size={14} />
                              </button>
                            )}

                            {/* Edit */}
                            <button
                              onClick={() => setItemEditorTarget(item)}
                              title="Edit Content Attributes"
                              style={{
                                padding: '5px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light, #E1DCDB)',
                                backgroundColor: '#fff',
                                color: 'var(--eclipse, #2D1D15)',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Placement */}
                            <button
                              onClick={() => setPlacementTarget(item)}
                              title="Update Placement Strategy"
                              style={{
                                padding: '5px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light, #E1DCDB)',
                                backgroundColor: '#fff',
                                color: 'var(--brand-plum, #6F405F)',
                                cursor: 'pointer',
                              }}
                            >
                              <Layers size={14} />
                            </button>

                            {/* Moderation */}
                            <button
                              onClick={() => setModerationTarget(item)}
                              title={item.moderationStatus === 'HIDDEN' ? 'Restore Discussion' : 'Hide Discussion'}
                              style={{
                                padding: '5px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light, #E1DCDB)',
                                backgroundColor: '#fff',
                                color: item.moderationStatus === 'HIDDEN' ? '#2563eb' : '#dc2626',
                                cursor: 'pointer',
                              }}
                            >
                              {item.moderationStatus === 'HIDDEN' ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>

                            {/* Audit Logs */}
                            <button
                              onClick={() => setAuditLogTarget(item)}
                              title="View Audit History Trail"
                              style={{
                                padding: '5px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light, #E1DCDB)',
                                backgroundColor: '#fff',
                                color: 'var(--hurricane, #887B75)',
                                cursor: 'pointer',
                              }}
                            >
                              <History size={14} />
                            </button>

                            {/* Permanent Delete */}
                            <button
                              onClick={() => setDeleteTarget(item)}
                              title="Delete Discussion Permanently"
                              aria-label={`Delete discussion ${item.id} permanently`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #fecaca',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {itemsTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--hurricane, #887B75)' }}>
                  Showing {items.length} of {itemsTotalElements} discussions (Page {itemsPage + 1} of {itemsTotalPages})
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setItemsPage((p) => Math.max(p - 1, 0))}
                    disabled={itemsPage === 0}
                    className="button-secondary"
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: itemsPage === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setItemsPage((p) => Math.min(p + 1, itemsTotalPages - 1))}
                    disabled={itemsPage >= itemsTotalPages - 1}
                    className="button-secondary"
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: itemsPage >= itemsTotalPages - 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CANDIDATE REVIEW QUEUE                             */}
        {/* ========================================================= */}
        {activeTab === 'candidates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Category Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                borderBottom: '1px solid var(--border-light, #E1DCDB)',
              }}
            >
              {[
                { id: 'ALL', label: 'All', count: categoryCounts.ALL },
                { id: 'GENERAL_NEWS', label: 'General News', count: categoryCounts.GENERAL_NEWS },
                { id: 'ENTERTAINMENT', label: 'Entertainment', count: categoryCounts.ENTERTAINMENT },
                { id: 'SPORTS', label: 'Sports', count: categoryCounts.SPORTS },
                { id: 'TECHNOLOGY', label: 'Technology', count: categoryCounts.TECHNOLOGY },
              ].map((cat) => {
                const isSelected = candidateCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCandidateCategoryFilter(cat.id);
                      setCandidatesPage(0);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid var(--brand-plum, #6F405F)' : '1px solid var(--border-light, #E1DCDB)',
                      backgroundColor: isSelected ? 'var(--brand-plum, #6F405F)' : '#fff',
                      color: isSelected ? '#fff' : 'var(--eclipse, #2D1D15)',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{cat.label}</span>
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--soft-white, #F8F5F3)',
                        color: isSelected ? '#fff' : 'var(--hurricane, #887B75)',
                      }}
                    >
                      {cat.count ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: 'var(--pure-white, #ffffff)',
                borderRadius: '12px',
                border: '1px solid var(--border-light, #E1DCDB)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <select
                  value={candidateStatusFilter}
                  onChange={(e) => {
                    setCandidateStatusFilter(e.target.value);
                    setCandidatesPage(0);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #E1DCDB)',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="PENDING_REVIEW">Status: PENDING_REVIEW</option>
                  <option value="PUBLISHED">Status: PUBLISHED</option>
                  <option value="REJECTED">Status: REJECTED</option>
                  <option value="ALL">Status: ALL</option>
                </select>

                {/* Source Filter */}
                <select
                  value={candidateSourceFilter}
                  onChange={(e) => {
                    setCandidateSourceFilter(e.target.value);
                    setCandidatesPage(0);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #E1DCDB)',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="">All Sources</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <span style={{ fontSize: '12px', color: 'var(--hurricane, #887B75)' }}>
                {candidatesTotalElements} items in candidate pipeline
              </span>
            </div>

            {/* Candidates Table */}
            {candidates.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  backgroundColor: 'var(--pure-white, #ffffff)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  textAlign: 'center',
                }}
              >
                <Newspaper size={36} color="var(--hurricane, #887B75)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)' }}>
                  Review Queue Is Clear
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--hurricane, #887B75)' }}>
                  No candidate articles currently match the review criteria. Ingested news feeds will populate this queue for editorial curation.
                </p>
              </div>
            ) : (
              <div className="mka-card table-responsive" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--soft-white, #F8F5F3)', borderBottom: '1px solid var(--border-light, #E1DCDB)' }}>
                      <th style={{ padding: '12px 16px' }}>Candidate Story</th>
                      <th style={{ padding: '12px 14px' }}>Source Outlet</th>
                      <th style={{ padding: '12px 14px' }}>Category</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px' }}>Ingested</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((cand) => {
                      const catName = cand.category || 'GENERAL_NEWS';
                      const catBadgeColors = {
                        GENERAL_NEWS: { bg: 'rgba(59, 130, 246, 0.1)', text: '#1d4ed8', border: '#bfdbfe', label: 'General News' },
                        ENTERTAINMENT: { bg: 'rgba(236, 72, 153, 0.1)', text: '#be185d', border: '#fbcfe8', label: 'Entertainment' },
                        SPORTS: { bg: 'rgba(16, 185, 129, 0.1)', text: '#047857', border: '#a7f3d0', label: 'Sports' },
                        TECHNOLOGY: { bg: 'rgba(139, 92, 246, 0.1)', text: '#6d28d9', border: '#ddd6fe', label: 'Technology' },
                      };
                      const catStyle = catBadgeColors[catName] || catBadgeColors.GENERAL_NEWS;

                      return (
                        <tr key={cand.id} style={{ borderBottom: '1px solid var(--swiss-coffee, #F8F5F3)' }}>
                          <td style={{ padding: '12px 16px', maxWidth: '360px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--eclipse, #2D1D15)', marginBottom: '3px' }}>
                              {cand.title}
                            </div>
                            {cand.summary && (
                              <div style={{ fontSize: '12px', color: 'var(--hurricane, #887B75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {cand.summary}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'var(--eclipse, #2D1D15)',
                                color: '#fff',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}
                            >
                              {cand.sourceName || 'RSS Feed'}
                            </span>
                          </td>

                          {/* Category Badge */}
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: catStyle.bg,
                                color: catStyle.text,
                                border: `1px solid ${catStyle.border}`,
                                fontSize: '11px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {catStyle.label}
                            </span>
                          </td>

                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor:
                                cand.status === 'PENDING_REVIEW'
                                  ? 'rgba(234, 179, 8, 0.15)'
                                  : cand.status === 'PUBLISHED'
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : 'rgba(239, 68, 68, 0.12)',
                              color:
                                cand.status === 'PENDING_REVIEW'
                                  ? '#b45309'
                                  : cand.status === 'PUBLISHED'
                                  ? '#059669'
                                  : '#dc2626',
                            }}
                          >
                            {cand.status}
                          </span>
                        </td>

                        <td style={{ padding: '12px 14px', color: 'var(--hurricane, #887B75)', fontSize: '12px' }}>
                          {cand.createdAt ? new Date(cand.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setCandidateReviewTarget(cand)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              backgroundColor: 'var(--brand-plum, #6F405F)',
                              color: '#fff',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Review & Curate
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {candidatesTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--hurricane, #887B75)' }}>
                  Showing {candidates.length} of {candidatesTotalElements} candidates (Page {candidatesPage + 1} of {candidatesTotalPages})
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCandidatesPage((p) => Math.max(p - 1, 0))}
                    disabled={candidatesPage === 0}
                    className="button-secondary"
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: candidatesPage === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCandidatesPage((p) => Math.min(p + 1, candidatesTotalPages - 1))}
                    disabled={candidatesPage >= candidatesTotalPages - 1}
                    className="button-secondary"
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: candidatesPage >= candidatesTotalPages - 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: RSS NEWS SOURCES                                   */}
        {/* ========================================================= */}
        {activeTab === 'sources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: 'var(--pure-white, #ffffff)',
                borderRadius: '12px',
                border: '1px solid var(--border-light, #E1DCDB)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={sourceActiveFilter}
                  onChange={(e) => {
                    setSourceActiveFilter(e.target.value);
                    setSourcesPage(0);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #E1DCDB)',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="ALL">All Sources</option>
                  <option value="ACTIVE">Active Feeds</option>
                  <option value="INACTIVE">Inactive Feeds</option>
                </select>
              </div>

              <button
                onClick={() => setIsCreatingSource(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--brand-plum, #6F405F)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={15} />
                Register New Source
              </button>
            </div>

            {/* Sources Table */}
            {sources.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  backgroundColor: 'var(--pure-white, #ffffff)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light, #E1DCDB)',
                  textAlign: 'center',
                }}
              >
                <Rss size={36} color="var(--hurricane, #887B75)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)' }}>
                  No RSS Sources Configured
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--hurricane, #887B75)' }}>
                  Register approved news publications or agency RSS feeds to enable candidate news ingestion.
                </p>
              </div>
            ) : (
              <div className="mka-card table-responsive" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--soft-white, #F8F5F3)', borderBottom: '1px solid var(--border-light, #E1DCDB)' }}>
                      <th style={{ padding: '12px 16px' }}>Source Name</th>
                      <th style={{ padding: '12px 14px' }}>Category</th>
                      <th style={{ padding: '12px 14px' }}>Feed URL</th>
                      <th style={{ padding: '12px 14px' }}>Website</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px' }}>Last Fetched</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--swiss-coffee, #F8F5F3)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--eclipse, #2D1D15)' }}>
                          {s.name}
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(111, 64, 95, 0.08)',
                              color: 'var(--brand-plum, #6F405F)',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {s.category || 'GENERAL'}
                          </span>
                        </td>

                        <td style={{ padding: '12px 14px', maxWidth: '240px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', color: 'var(--hurricane, #887B75)' }}>
                            {s.feedUrl}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          {s.siteUrl ? (
                            <a
                              href={s.siteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--brand-plum, #6F405F)', textDecoration: 'none', fontSize: '12px' }}
                            >
                              Visit <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span style={{ color: 'var(--hurricane, #887B75)', fontSize: '12px' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: s.isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: s.isActive ? '#059669' : '#dc2626',
                            }}
                          >
                            {s.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>

                        <td style={{ padding: '12px 14px', color: 'var(--hurricane, #887B75)', fontSize: '12px' }}>
                          {s.lastFetchedAt ? new Date(s.lastFetchedAt).toLocaleString() : 'Never'}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {/* Fetch Now button */}
                            <button
                              onClick={() => handleFetchNow(s)}
                              disabled={Boolean(fetchingSourceId)}
                              title={s.isActive ? 'Fetch latest articles from this feed' : 'Source is inactive'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: fetchingSourceId === s.id ? '#9ca3af' : 'var(--brand-plum, #6F405F)',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: fetchingSourceId ? 'not-allowed' : 'pointer',
                                opacity: !s.isActive || (fetchingSourceId && fetchingSourceId !== s.id) ? 0.6 : 1,
                              }}
                            >
                              <RefreshCw
                                size={12}
                                style={{
                                  animation: fetchingSourceId === s.id ? 'spin 1s linear infinite' : 'none',
                                }}
                              />
                              {fetchingSourceId === s.id ? 'Fetching...' : 'Fetch Now'}
                            </button>

                            <button
                              onClick={() => handleToggleSourceActive(s)}
                              title={s.isActive ? 'Deactivate source' : 'Activate source'}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light, #E1DCDB)',
                                backgroundColor: '#fff',
                                color: s.isActive ? '#dc2626' : '#059669',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {s.isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() => setSourceEditorTarget(s)}
                              title="Edit Source Metadata"
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light, #E1DCDB)',
                                backgroundColor: '#fff',
                                color: 'var(--eclipse, #2D1D15)',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit3 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODALS RENDER SECTION                                    */}
      {/* ========================================================= */}

      {/* 1. Candidate Review & Editorial Override Modal */}
      <PulseCandidateReviewModal
        isOpen={Boolean(candidateReviewTarget)}
        onClose={() => setCandidateReviewTarget(null)}
        candidate={candidateReviewTarget}
        onSuccess={() => {
          fetchCandidates(candidatesPage);
          fetchCategoryCounts();
          fetchItems(itemsPage);
          loadOverviewStats();
        }}
      />

      {/* 2. Content Authoring / Editor Modal */}
      <PulseItemEditorModal
        isOpen={isCreatingItem || Boolean(itemEditorTarget)}
        onClose={() => {
          setIsCreatingItem(false);
          setItemEditorTarget(null);
        }}
        itemToEdit={itemEditorTarget}
        onSuccess={() => {
          fetchItems(itemsPage);
          loadOverviewStats();
        }}
      />

      {/* 3. Placement Switcher Modal */}
      <PulsePlacementModal
        isOpen={Boolean(placementTarget)}
        onClose={() => setPlacementTarget(null)}
        item={placementTarget}
        onSuccess={() => {
          fetchItems(itemsPage);
          loadOverviewStats();
        }}
      />

      {/* 4. Moderation Modal (Hide / Restore) */}
      <PulseModerationModal
        isOpen={Boolean(moderationTarget)}
        onClose={() => setModerationTarget(null)}
        item={moderationTarget}
        onSuccess={() => {
          fetchItems(itemsPage);
          loadOverviewStats();
        }}
      />

      {/* 5. Audit History Trail Modal */}
      <PulseAuditTrailModal
        isOpen={Boolean(auditLogTarget)}
        onClose={() => setAuditLogTarget(null)}
        item={auditLogTarget}
      />

      {/* 6. Source Add / Edit Modal */}
      <PulseSourceModal
        isOpen={isCreatingSource || Boolean(sourceEditorTarget)}
        onClose={() => {
          setIsCreatingSource(false);
          setSourceEditorTarget(null);
        }}
        sourceToEdit={sourceEditorTarget}
        onSuccess={() => {
          fetchSources(sourcesPage);
          loadOverviewStats();
        }}
      />

      {/* 7. Permanent Deletion Confirmation Modal */}
      <PulseDeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        item={deleteTarget}
        onSuccess={(deletedId) => {
          setItems((prev) => prev.filter((it) => it.id !== deletedId));
          fetchItems(itemsPage);
          loadOverviewStats();
        }}
      />
    </AdminLayout>
  );
}
