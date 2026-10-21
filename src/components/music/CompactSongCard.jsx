import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageSquare, MoreVertical, Play, Pause, LoaderCircle, Check, Copy, ListPlus, AlertCircle } from 'lucide-react';
import defaultCover from '../../assets/music-cover.jpg';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';

function formatDuration(seconds) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function CompactSongCard({ track, queue, isLiked, onToggleLike, likeCount }) {
  const music = useMoodMusic();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  const isActive = Boolean(music.currentTrack && String(music.currentTrack.id) === String(track.id));
  const hasError = isActive && Boolean(music.playbackError);
  const isBuffering = isActive && Boolean(music.isBuffering);
  const isPlaying = isActive && Boolean(music.isPlaying) && !isBuffering && !hasError;

  // Format real duration if available, or use current active duration if playing
  const displayDuration = (isActive && music.duration > 0)
    ? formatDuration(music.duration)
    : formatDuration(track.durationSeconds) || (track.duration ? String(track.duration) : null);

  // Close 3-dots menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handlePlayToggle = (e) => {
    e.stopPropagation();
    if (isActive) {
      if (hasError) {
        music.retry();
      } else {
        music.togglePlay();
      }
    } else {
      music.playTrack(track, queue);
    }
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/music?trackId=${track.id}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1200);
  };

  const handlePlayNext = (e) => {
    e.stopPropagation();
    if (music.queue && music.queue.length > 0) {
      const newQueue = [...music.queue];
      const currentIndex = music.trackIndex >= 0 ? music.trackIndex : 0;
      newQueue.splice(currentIndex + 1, 0, track);
      music.replaceQueuePreservingCurrentTrack?.(newQueue);
    } else {
      music.playTrack(track, [track]);
    }
    setMenuOpen(false);
  };

  return (
    <article className={`compact-song-card ${isActive ? 'is-active' : ''}`}>
      {/* 1. Rectangular Thumbnail with Play Overlay & Duration */}
      <div className="compact-song-artwork" onClick={handlePlayToggle}>
        <img
          src={track.coverUrl || defaultCover}
          alt={`${track.title} artwork`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultCover;
          }}
        />

        {/* Play/Pause Button Overlay */}
        <button
          type="button"
          className={`compact-song-play-overlay ${isPlaying ? 'playing' : ''} ${hasError ? 'error' : ''}`}
          onClick={handlePlayToggle}
          aria-label={hasError ? `Error: ${music.playbackError}. Tap to retry` : isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          title={hasError ? 'Playback error. Tap to retry' : isPlaying ? 'Pause' : 'Play'}
        >
          {hasError ? (
            <AlertCircle size={20} color="#FF3B30" />
          ) : isBuffering ? (
            <LoaderCircle size={20} className="music-spin" />
          ) : isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
          )}
        </button>

        {/* Duration Pill at bottom right */}
        {displayDuration && (
          <span className="compact-song-duration-pill">{displayDuration}</span>
        )}
      </div>

      {/* 2. Song Details & Metadata */}
      <div className="compact-song-details">
        <h4 className="compact-song-title" title={track.title}>
          {track.title}
        </h4>
        {track.artist && (
          <p className="compact-song-artist" title={track.artist}>
            {track.artist}
          </p>
        )}

        {/* 3. Engagement & Actions Row */}
        <div className="compact-song-actions-row">
          <button
            type="button"
            className={`compact-action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike?.(track.id);
            }}
            aria-label={isLiked ? 'Unlike song' : 'Like song'}
          >
            <Heart
              size={14}
              strokeWidth={2}
              fill={isLiked ? '#FF2E93' : 'none'}
              color={isLiked ? '#FF2E93' : 'currentColor'}
            />
            {likeCount !== undefined && likeCount !== null && (
              <span className="compact-action-count">{likeCount}</span>
            )}
          </button>

          {track.commentCount !== undefined && track.commentCount !== null && (
            <span className="compact-action-item">
              <MessageSquare size={13} strokeWidth={2} />
              <span className="compact-action-count">{track.commentCount}</span>
            </span>
          )}

          {/* Three dots menu */}
          <div className="compact-song-menu-anchor" ref={menuRef}>
            <button
              type="button"
              className="compact-action-btn more-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              aria-label="More options"
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <div className="compact-song-dropdown-menu">
                <button type="button" onClick={handlePlayNext}>
                  <ListPlus size={14} /> Play next
                </button>
                <button type="button" onClick={handleCopyLink}>
                  {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  {copied ? 'Copied link!' : 'Copy link'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
