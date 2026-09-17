import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Music, Mic, Play, LoaderCircle } from 'lucide-react';
import { apiPostService } from '../../services/apiPostService.js';
import { apiMusicService } from '../../services/apiMusicService.js';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import defaultCover from '../../assets/music-cover.jpg';
import { getMusicMoodLabel } from '../../config/musicMoods.js';
import { mapPost } from '../../services/apiMappers.js';

export function CommunityLibraryPanel() {
  const music = useMoodMusic();
  const [activeTab, setActiveTab] = useState('my-tracks'); // 'saved' | 'my-tracks'

  const savedPostsQuery = useQuery({
    queryKey: ['saved-posts-library'],
    queryFn: () => apiPostService.getSavedPosts({ page: 0, size: 20 }),
  });

  const catalogTracksQuery = useQuery({
    queryKey: ['community-library-tracks', music.selectedMood || 'ALL'],
    queryFn: () => apiMusicService.getPublicTracks({
      ...(music.selectedMood ? { mood: music.selectedMood } : {}),
      page: 0,
      size: 20,
    }),
  });

  const rawSavedPosts = savedPostsQuery.data?.data?.content || savedPostsQuery.data?.content || [];
  const savedPosts = rawSavedPosts
    .map(mapPost)
    .filter((post) => Boolean(post && (post.audioUrl || post.audio?.audioUrl || post.musicTrackId || post.type === 'VOICE_NOTE')));
  const catalogTracks = catalogTracksQuery.data?.content || [];

  const handlePlaySavedAudio = (post) => {
    if (!post.audio || !post.audio.audioUrl) return;
    const track = {
      id: post.audio.musicTrackId || `post_${post.id}`,
      title: post.title || post.audio.title || 'Voice Note',
      artist: post.username || post.audio.artistName || 'Community User',
      audioUrl: post.audio.audioUrl,
      coverUrl: post.audio.coverUrl || defaultCover,
    };
    music.playTrack(track, [track]);
  };

  const handlePlayCatalogTrack = (track) => {
    if (!track.audioUrl) return;
    music.playTrack(track, catalogTracks);
  };

  return (
    <aside className="community-library-card">
      <div className="community-library-heading">
        <h3>Your Library</h3>
        <button type="button" onClick={() => setActiveTab('my-tracks')}>View all</button>
      </div>
      <div className="library-header-tabs">
        <button
          className={`library-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={15} /> Bookmarks ({savedPosts.length})
        </button>

        <button
          className={`library-tab-btn ${activeTab === 'my-tracks' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveTab('my-tracks')}
        >
          <Music size={15} /> {music.selectedMood ? getMusicMoodLabel(music.selectedMood) : 'All Music'} ({catalogTracks.length})
        </button>
      </div>

      <div className="library-content-body">
        {activeTab === 'saved' && (
          <>
            {savedPostsQuery.isLoading ? (
              <div className="library-loading">
                <LoaderCircle className="music-spin" size={20} />
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="library-empty">
                <Bookmark size={28} opacity={0.4} />
                <p>No bookmarked posts yet.</p>
              </div>
            ) : (
              <ul className="library-item-list">
                {savedPosts.map((post) => (
                  <li key={post.id} className="library-item">
                    <div className="library-item-info">
                      {post.audio ? <Mic size={16} className="item-icon" /> : <Bookmark size={16} className="item-icon" />}
                      <div className="item-text">
                        <strong className="item-title">{post.title || post.originalContent || 'Saved Post'}</strong>
                        <span className="item-sub">@{post.username}</span>
                      </div>
                    </div>

                    {post.audio && (
                      <button
                        className="library-play-btn"
                        type="button"
                        onClick={() => handlePlaySavedAudio(post)}
                        title="Play audio"
                      >
                        <Play size={14} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {activeTab === 'my-tracks' && (
          <>
            {catalogTracksQuery.isLoading ? (
              <div className="library-loading">
                <LoaderCircle className="music-spin" size={20} />
              </div>
            ) : catalogTracksQuery.isError ? (
              <div className="library-empty">
                <Music size={28} opacity={0.4} />
                <p>Unable to load published music.</p>
              </div>
            ) : catalogTracks.length === 0 ? (
              <div className="library-empty">
                <Music size={28} opacity={0.4} />
                <p>No published {music.selectedMood ? getMusicMoodLabel(music.selectedMood).toLowerCase() : ''} tracks yet.</p>
              </div>
            ) : (
              <ul className="library-item-list">
                {catalogTracks.map((track) => (
                  <li key={track.id} className="library-item">
                    <div className="library-item-info">
                      <img className="item-thumb" src={track.coverUrl || defaultCover} alt={track.title} />
                      <div className="item-text">
                        <strong className="item-title">{track.title}</strong>
                        <span className="item-sub">{track.artist || 'Man Ki Aavaj'}</span>
                      </div>
                    </div>

                    <button
                      className="library-play-btn"
                      type="button"
                      onClick={() => handlePlayCatalogTrack(track)}
                      disabled={!track.audioUrl}
                      title="Play track"
                    >
                      <Play size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
