import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  LoaderCircle,
  Music2,
  RefreshCw,
  Search,
  Users,
  Disc,
  X,
  ChevronRight,
  FilterX
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { apiMusicService } from '../../services/apiMusicService.js';
import { apiPostService } from '../../services/apiPostService.js';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import '../../styles/music.css';
import { MyTracksPanel } from '../../components/music/MyTracksPanel.jsx';
import {
  buildListeningCatalogParams,
  getListeningMoodOption,
  getMusicMoodLabel,
  shouldFallbackToFullCatalog,
} from '../../config/musicMoods.js';
import { aggregateMusicQueue } from '../../utils/musicQueue.js';
import { CommunityComposer } from '../../components/music/CommunityComposer.jsx';
import { CommunityFeed } from '../../components/music/CommunityFeed.jsx';
import { NowPlayingPanel } from '../../components/music/NowPlayingPanel.jsx';
import { CommunityLibraryPanel } from '../../components/music/CommunityLibraryPanel.jsx';
import { mapPost } from '../../services/apiMappers.js';
import { PremiumHeroBanner } from '../../components/music/PremiumHeroBanner.jsx';
import { PremiumMoodCards } from '../../components/music/PremiumMoodCards.jsx';
import { CompactSongCard } from '../../components/music/CompactSongCard.jsx';
import { PremiumBottomPlayer } from '../../components/music/PremiumBottomPlayer.jsx';
import { useLikedSongs } from '../../hooks/useLikedSongs.js';

export function MusicPage({ onNavigate }) {
  const music = useMoodMusic();
  const { replaceQueuePreservingCurrentTrack } = music;
  const { isLiked, toggleLike } = useLikedSongs(music.musicSessionUserId);

  const [query, setQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());
  const [showAllTracks, setShowAllTracks] = useState(false);

  const [view, setView] = useState(() => {
    const urlView = new URLSearchParams(window.location.search).get('view');
    if (urlView === 'mine') return 'mine';
    if (urlView === 'community') return 'community';
    return 'browse'; // Default to the premium streaming experience
  });

  const moodOption = getListeningMoodOption(music.selectedMood);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Synchronize with search in TopNavbar
  useEffect(() => {
    const handleMusicSearch = (e) => {
      setQuery(e.detail || '');
    };
    window.addEventListener('music-search', handleMusicSearch);
    return () => window.removeEventListener('music-search', handleMusicSearch);
  }, []);

  // Public Catalog Queries
  const baseFilters = useMemo(
    () => ({
      query: debouncedQuery,
      page: 0,
      size: showAllTracks ? 50 : 24,
    }),
    [debouncedQuery, showAllTracks]
  );

  const filters = useMemo(
    () => buildListeningCatalogParams(baseFilters, music.selectedMood),
    [baseFilters, music.selectedMood]
  );

  const canLoad = music.musicSessionReady;

  const tracksQuery = useQuery({
    queryKey: ['public-music', filters],
    queryFn: () => apiMusicService.getPublicTracks(filters),
    enabled: canLoad && view === 'browse',
    staleTime: 60 * 1000,
  });

  const shouldFallback =
    canLoad &&
    view === 'browse' &&
    shouldFallbackToFullCatalog({
      selectedMood: music.selectedMood,
      page: 0,
      isSuccess: tracksQuery.isSuccess,
      content: tracksQuery.data?.content,
    });

  const fallbackQuery = useQuery({
    queryKey: ['public-music', 'mood-fallback', baseFilters],
    queryFn: () => apiMusicService.getPublicTracks(baseFilters),
    enabled: shouldFallback,
  });

  // Source queue aggregation for smooth continuous listening
  const sourceQueueQuery = useQuery({
    queryKey: ['music-source-queue', music.musicSessionUserId, music.selectedMood || 'ALL'],
    queryFn: ({ signal }) =>
      aggregateMusicQueue({
        selectedMood: music.selectedMood,
        signal,
        fetchPage: (params, requestSignal) =>
          apiMusicService.getPublicTracks(params, { signal: requestSignal }),
      }),
    enabled: canLoad,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (sourceQueueQuery.isSuccess && sourceQueueQuery.data?.tracks?.length > 0) {
      replaceQueuePreservingCurrentTrack(sourceQueueQuery.data.tracks);
    }
  }, [replaceQueuePreservingCurrentTrack, sourceQueueQuery.data, sourceQueueQuery.isSuccess]);

  // Community Feed Query (for Community tab)
  const communityPostsQuery = useQuery({
    queryKey: ['community-posts-feed'],
    queryFn: () => apiPostService.getPosts({ page: 0, size: 50, community: 'MUSIC' }),
    enabled: canLoad && view === 'community',
  });

  const rawCommunityPosts =
    communityPostsQuery.data?.data?.content || communityPostsQuery.data?.content || [];
  const communityPosts = useMemo(() => {
    return rawCommunityPosts
      .map(mapPost)
      .filter((post) => {
        if (!post) return false;
        const hasAudio = Boolean(post.audioUrl || post.audio?.audioUrl);
        const hasTrack = Boolean(post.musicTrackId);
        const isVoiceType =
          post.type === 'VOICE_NOTE' || post.postType === 'VOICE_NOTE' || post.type === 'MUSIC';
        return hasAudio || hasTrack || isVoiceType;
      });
  }, [rawCommunityPosts]);

  const activeQuery = shouldFallback ? fallbackQuery : tracksQuery;
  const tracks = activeQuery.data?.content || [];

  // Display limited subset (e.g. 6 or 12) if not viewing all, or all tracks if expanded
  const displayedTracks = useMemo(() => {
    if (showAllTracks || debouncedQuery) return tracks;
    return tracks.slice(0, 12);
  }, [tracks, showAllTracks, debouncedQuery]);

  const handleSelectMood = (apiMood) => {
    // If user clicks the already selected mood, reset to full collection
    if (music.selectedMood === apiMood) {
      music.completeMoodSelection(null);
    } else {
      music.completeMoodSelection(apiMood);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    window.dispatchEvent(new CustomEvent('music-search', { detail: '' }));
  };

  return (
    <UserLayout activeRoute="/music" onNavigate={onNavigate} wide>
      <div className="premium-music-container" data-music-theme={moodOption.theme}>
        {/* If in community or mine view, show tab bar so user can switch back to Discover */}
        {view !== 'browse' && (
          <nav className="premium-music-nav-tabs" aria-label="Music Sections">
            <button
              type="button"
              className={`premium-music-tab-pill ${view === 'browse' ? 'active' : ''}`}
              onClick={() => setView('browse')}
            >
              <Disc size={15} /> Discover
            </button>
            <button
              type="button"
              className={`premium-music-tab-pill ${view === 'community' ? 'active' : ''}`}
              onClick={() => setView('community')}
            >
              <Users size={15} /> Community
            </button>
            <button
              type="button"
              className={`premium-music-tab-pill ${view === 'mine' ? 'active' : ''}`}
              onClick={() => setView('mine')}
            >
              <Music2 size={15} /> My Uploads
            </button>
          </nav>
        )}

        {/* ════════════ VIEW: BROWSE (PREMIUM EXPERIENCE) ════════════ */}
        {view === 'browse' && (
          <>
            {/* 1. HERO SECTION (contains compact subnav in top-right) */}
            <PremiumHeroBanner view={view} onViewChange={setView} />

            {/* 2. FOUR PREMIUM MOOD CARDS */}
            <PremiumMoodCards
              selectedMood={music.selectedMood}
              onSelectMood={handleSelectMood}
            />

            {/* Active Mood Pill Banner if mood filter is applied */}
            {music.selectedMood && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: '#FDF2F4',
                  border: '1px solid #F8D7E0',
                  color: '#982B55',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <span>
                  Filtering by mood: <strong>{getMusicMoodLabel(music.selectedMood)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => music.completeMoodSelection(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#982B55',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <FilterX size={14} /> Clear mood filter
                </button>
              </div>
            )}

            {/* 4. RECENTLY ADDED SONGS SECTION */}
            <section className="premium-recently-added-section" aria-labelledby="recently-added-heading">
              <div className="premium-section-header">
                <div className="premium-section-title-wrap">
                  <h2 id="recently-added-heading">Recently Added</h2>
                  <p>Fresh tracks to match your moments.</p>
                </div>
                <button
                  type="button"
                  className="premium-view-all-link"
                  onClick={() => setShowAllTracks((prev) => !prev)}
                >
                  {showAllTracks ? 'Show less' : 'View all'}
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Fallback Notice if current mood has no songs */}
              {((shouldFallback && fallbackQuery.isSuccess) || sourceQueueQuery.data?.fallbackUsed) && (
                <p className="music-fallback-note" role="status" style={{ marginBottom: 16 }}>
                  We don't have tracks for this mood yet, so we're playing from the full collection.
                </p>
              )}

              {/* Loading State */}
              {activeQuery.isLoading ? (
                <div className="music-loading">
                  <LoaderCircle className="music-spin" size={32} color="#982B55" aria-label="Loading music" />
                </div>
              ) : activeQuery.isError ? (
                <div className="music-error">
                  <p>Unable to load tracks right now.</p>
                  <button
                    className="music-secondary"
                    type="button"
                    onClick={() => activeQuery.refetch()}
                    style={{ marginTop: 8 }}
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                </div>
              ) : displayedTracks.length === 0 ? (
                /* Intentional Empty State */
                <div
                  className="music-empty"
                  style={{
                    padding: '48px 24px',
                    borderRadius: '16px',
                    background: '#FFFFFF',
                    border: '1.5px dashed #EADBDE',
                  }}
                >
                  <Music2 size={36} color="#C2185B" style={{ opacity: 0.6, marginBottom: 12 }} />
                  <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#1F161A' }}>
                    {debouncedQuery
                      ? `No tracks found for "${debouncedQuery}"`
                      : music.selectedMood
                      ? `No tracks found for ${getMusicMoodLabel(music.selectedMood)}`
                      : 'No tracks available yet'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#756966' }}>
                    {debouncedQuery
                      ? 'Try checking for typos or searching with different keywords.'
                      : 'Check back soon for new releases or try another mood.'}
                  </p>
                  {(debouncedQuery || music.selectedMood) && (
                    <button
                      type="button"
                      className="music-secondary"
                      onClick={() => {
                        setQuery('');
                        setDebouncedQuery('');
                        music.completeMoodSelection(null);
                      }}
                      style={{ marginTop: 14 }}
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              ) : (
                /* Compact Uniform Cards Grid */
                <div className="compact-songs-grid">
                  {displayedTracks.map((track) => (
                    <CompactSongCard
                      key={track.id}
                      track={track}
                      queue={tracks}
                      isLiked={isLiked(track.id)}
                      onToggleLike={toggleLike}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ════════════ VIEW: COMMUNITY ════════════ */}
        {view === 'community' && (
          <div className="community-music-layout">
            <aside className="community-sidebar-column">
              <NowPlayingPanel />
              <CommunityLibraryPanel />
            </aside>
            <main className="community-main-column">
              <CommunityComposer
                onPostPublished={() => communityPostsQuery.refetch()}
                onOpenSongUpload={() => setView('mine')}
              />
              <CommunityFeed
                posts={communityPosts}
                isLoading={communityPostsQuery.isLoading}
                isError={communityPostsQuery.isError}
                onRefetch={() => communityPostsQuery.refetch()}
                currentUserId={music.musicSessionUserId}
                onPostDeleted={() => communityPostsQuery.refetch()}
              />
            </main>
          </div>
        )}

        {/* ════════════ VIEW: MY TRACKS ════════════ */}
        {view === 'mine' && <MyTracksPanel />}
      </div>
    </UserLayout>
  );
}
