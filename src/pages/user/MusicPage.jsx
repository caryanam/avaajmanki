import React, { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Music2, Pause, Play, RefreshCw, Search, Users, Disc } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { apiMusicService } from '../../services/apiMusicService.js';
import { apiPostService } from '../../services/apiPostService.js';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import defaultCover from '../../assets/music-cover.jpg';
import '../../styles/music.css';
import { MyTracksPanel } from '../../components/music/MyTracksPanel.jsx';
import { buildListeningCatalogParams, getListeningMoodOption, getMusicMoodLabel, shouldFallbackToFullCatalog } from '../../config/musicMoods.js';
import { MoodSelectionModal } from '../../components/music/MoodSelectionModal.jsx';
import { aggregateMusicQueue } from '../../utils/musicQueue.js';
import { CommunityComposer } from '../../components/music/CommunityComposer.jsx';
import { CommunityFeed } from '../../components/music/CommunityFeed.jsx';
import { NowPlayingPanel } from '../../components/music/NowPlayingPanel.jsx';
import { CommunityLibraryPanel } from '../../components/music/CommunityLibraryPanel.jsx';
import { mapPost } from '../../services/apiMappers.js';

const LANGUAGES = ['EN', 'HI', 'BN', 'MR', 'TE', 'TA', 'GU', 'UR', 'KN', 'OR', 'ML', 'PA', 'AS', 'SAT', 'KS', 'MNI', 'DOI', 'BHO'];

function TrackCard({ track, queue }) {
  const music = useMoodMusic();
  const active = music.currentTrack?.id === track.id;
  const playing = active && music.isPlaying;
  return (
    <article className="music-card">
      <div className="music-card-cover">
        <img
          src={track.coverUrl || defaultCover}
          alt={`${track.title} cover`}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = defaultCover;
          }}
        />
        <button
          className="music-card-play"
          type="button"
          onClick={() => (active ? music.togglePlay() : music.playTrack(track, queue))}
          aria-label={`${playing ? 'Pause' : 'Play'} ${track.title}`}
        >
          {active && music.isBuffering ? <LoaderCircle className="music-spin" size={20} /> : playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
      <div className="music-card-body">
        <strong title={track.title}>{track.title}</strong>
        <span title={track.artist}>{track.artist || 'Unknown artist'}</span>
        <div className="music-tags">
          {track.language && <span className="music-tag">{track.language}</span>}
          {(track.moods || []).map((trackMood) => (
            <span className="music-tag" key={trackMood}>
              {getMusicMoodLabel(trackMood)}
            </span>
          ))}
          {track.genre && <span className="music-tag">{track.genre}</span>}
        </div>
      </div>
    </article>
  );
}

export function MusicPage({ onNavigate }) {
  const music = useMoodMusic();
  const { replaceQueuePreservingCurrentTrack } = music;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(0);
  const [view, setView] = useState(() => {
    const urlView = new URLSearchParams(window.location.search).get('view');
    if (urlView === 'mine') return 'mine';
    if (urlView === 'browse') return 'browse';
    return 'community';
  });

  const [changeMoodOpen, setChangeMoodOpen] = useState(false);
  const moodOption = getListeningMoodOption(music.selectedMood);
  const modalRequired = music.musicSessionReady && !music.selectorCompleted;
  const modalOpen = modalRequired || changeMoodOpen;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => setPage(0), [debouncedQuery, language, genre, music.selectedMood]);

  // Public Catalog Queries
  const baseFilters = useMemo(() => ({ query: debouncedQuery, language, genre: genre.trim(), page, size: 20 }), [debouncedQuery, language, genre, page]);
  const filters = useMemo(() => buildListeningCatalogParams(baseFilters, music.selectedMood), [baseFilters, music.selectedMood]);
  const canLoad = music.musicSessionReady && music.selectorCompleted;
  const tracksQuery = useQuery({ queryKey: ['public-music', filters], queryFn: () => apiMusicService.getPublicTracks(filters), enabled: canLoad && view === 'browse' });
  const shouldFallback = canLoad && view === 'browse' && shouldFallbackToFullCatalog({ selectedMood: music.selectedMood, page, isSuccess: tracksQuery.isSuccess, content: tracksQuery.data?.content });
  const fallbackQuery = useQuery({ queryKey: ['public-music', 'mood-fallback', baseFilters], queryFn: () => apiMusicService.getPublicTracks(baseFilters), enabled: shouldFallback });
  const featuredParams = music.selectedMood ? { featured: true, mood: music.selectedMood, page: 0, size: 8 } : { featured: true, page: 0, size: 8 };
  const featuredQuery = useQuery({ queryKey: ['featured-music', music.selectedMood], queryFn: () => apiMusicService.getPublicTracks(featuredParams), enabled: canLoad && view === 'browse' });

  // Community Feed Query (strictly music & voice notes)
  const communityPostsQuery = useQuery({
    queryKey: ['community-posts-feed'],
    queryFn: () => apiPostService.getPosts({ page: 0, size: 50, community: 'MUSIC' }),
    enabled: canLoad && view === 'community',
  });

  const sourceQueueQuery = useQuery({
    queryKey: ['music-source-queue', music.musicSessionUserId, music.selectedMood || 'ALL'],
    queryFn: ({ signal }) =>
      aggregateMusicQueue({
        selectedMood: music.selectedMood,
        signal,
        fetchPage: (params, requestSignal) => apiMusicService.getPublicTracks(params, { signal: requestSignal }),
      }),
    enabled: canLoad,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (sourceQueueQuery.isSuccess) {
      replaceQueuePreservingCurrentTrack(sourceQueueQuery.data.tracks);
    }
  }, [replaceQueuePreservingCurrentTrack, sourceQueueQuery.data, sourceQueueQuery.isSuccess]);

  const activeQuery = shouldFallback ? fallbackQuery : tracksQuery;
  const tracks = activeQuery.data?.content || [];
  const featured = featuredQuery.data?.content || [];
  const rawCommunityPosts = communityPostsQuery.data?.data?.content || communityPostsQuery.data?.content || [];
  const communityPosts = useMemo(() => {
    return rawCommunityPosts
      .map(mapPost)
      .filter((post) => {
        if (!post) return false;
        const hasAudio = Boolean(post.audioUrl || post.audio?.audioUrl);
        const hasTrack = Boolean(post.musicTrackId);
        const isVoiceType = post.type === 'VOICE_NOTE' || post.postType === 'VOICE_NOTE' || post.type === 'MUSIC';
        return hasAudio || hasTrack || isVoiceType;
      });
  }, [rawCommunityPosts]);
  const hasFilters = Boolean(debouncedQuery || language || genre.trim());

  const chooseMood = (option) => {
    music.completeMoodSelection(option.apiMood);
    setChangeMoodOpen(false);
    setPage(0);
  };

  return (
    <UserLayout activeRoute="/music" onNavigate={onNavigate} wide>
      <div className="music-experience" data-music-theme={moodOption.theme}>
        <div className={`music-page music-view-${view}`} aria-hidden={modalOpen || undefined} inert={modalOpen || undefined}>
          {/* Header & Tabs */}
          <header className="music-page-header music-mood-hero">
            <div>
              <span className="music-current-mood">{moodOption.title}</span>
              <h1>Community & Music</h1>
              <p>Listen, create, and share audio notes with the community.</p>
            </div>
            <div className="music-page-tabs">
              <button className="music-change-mood" type="button" onClick={() => setChangeMoodOpen(true)}>
                Change Mood
              </button>

              <button className={view === 'community' ? 'active' : ''} type="button" onClick={() => setView('community')}>
                <Users size={16} /> Community
              </button>

              <button className={view === 'browse' ? 'active' : ''} type="button" onClick={() => setView('browse')}>
                <Disc size={16} /> Browse Music
              </button>

              <button className={view === 'mine' ? 'active' : ''} type="button" onClick={() => setView('mine')}>
                My Tracks
              </button>
            </div>
          </header>

          {/* VIEW: COMMUNITY (Phase 4 Primary Layout) */}
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

          {/* VIEW: MY TRACKS */}
          {view === 'mine' && <MyTracksPanel />}

          {/* VIEW: BROWSE CATALOG */}
          {view === 'browse' && !featuredQuery.isLoading && !featuredQuery.isError && featured.length > 0 && (
            <section className="music-section" aria-labelledby="featured-music-title">
              <div className="music-section-heading">
                <div>
                  <h2 id="featured-music-title">Featured for this moment</h2>
                  <p>A few highlights from your current music mood.</p>
                </div>
              </div>
              <div className="music-grid">
                {featured.map((track) => (
                  <TrackCard key={track.id} track={track} queue={featured} />
                ))}
              </div>
            </section>
          )}

          {view === 'browse' && (
            <section className="music-section" aria-labelledby="all-music-title">
              <div className="music-section-heading">
                <div>
                  <h2 id="all-music-title">Your music</h2>
                  <p>{music.selectedMood ? `${moodOption.title} tracks, with simple filters when you need them.` : 'Let the full collection flow.'}</p>
                </div>
              </div>
              <div className="music-toolbar music-toolbar-listening">
                <label className="music-field">
                  <span>Search</span>
                  <div style={{ position: 'relative' }}>
                    <Search size={17} style={{ position: 'absolute', left: 12, top: 12, color: '#756966' }} />
                    <input style={{ paddingLeft: 38 }} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or artist" />
                  </div>
                </label>
                <label className="music-field">
                  <span>Language</span>
                  <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                    <option value="">All languages</option>
                    {LANGUAGES.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label className="music-field">
                  <span>Genre</span>
                  <input value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="Any genre" />
                </label>
              </div>

              {((shouldFallback && fallbackQuery.isSuccess) || sourceQueueQuery.data?.fallbackUsed) && (
                <p className="music-fallback-note" role="status">
                  We don't have tracks for this mood yet, so we're playing from the full collection.
                </p>
              )}

              {activeQuery.isLoading || !music.musicSessionReady ? (
                <div className="music-loading">
                  <LoaderCircle className="music-spin" aria-label="Loading music" />
                </div>
              ) : activeQuery.isError ? (
                <div className="music-error">
                  <div>
                    <p>Unable to load music.</p>
                    <button className="music-secondary" type="button" onClick={() => activeQuery.refetch()}>
                      <RefreshCw size={15} /> Retry
                    </button>
                  </div>
                </div>
              ) : tracks.length === 0 ? (
                <div className="music-empty">
                  <p>{hasFilters ? 'No tracks match your search or filters.' : 'No music available yet.'}</p>
                </div>
              ) : (
                <>
                  <div className="music-grid" style={{ marginTop: 20 }}>
                    {tracks.map((track) => (
                      <TrackCard key={track.id} track={track} queue={tracks} />
                    ))}
                  </div>
                  <div className="music-pagination">
                    <button className="music-secondary" type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
                      Previous
                    </button>
                    <span>
                      Page {page + 1} of {Math.max(1, activeQuery.data?.totalPages || 1)}
                    </span>
                    <button className="music-secondary" type="button" disabled={page + 1 >= (activeQuery.data?.totalPages || 1)} onClick={() => setPage((value) => value + 1)}>
                      Next
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        {/* Mood Selection Modal */}
        {modalOpen && (
          <MoodSelectionModal
            required={modalRequired}
            selectedMood={music.selectedMood}
            onSelect={chooseMood}
            onClose={() => setChangeMoodOpen(false)}
          />
        )}
      </div>
    </UserLayout>
  );
}
