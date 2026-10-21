import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  ListMusic,
  LoaderCircle,
  Minimize2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import { useTranslation } from 'react-i18next';
import defaultCover from '../../assets/music-cover.jpg';

const PLAYER_STATE_KEY = 'mka_player_state';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

export function PremiumBottomPlayer({ isLiked, onToggleLike }) {
  const { t } = useTranslation();
  const music = useMoodMusic();

  const {
    currentTrack,
    isPlaying,
    isBuffering,
    playbackError,
    duration,
    progress,
    volume,
    isMuted,
    shuffleEnabled,
    repeatMode,
    queue,
    togglePlay,
    prevTrack,
    nextTrack,
    handleSeek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    playTrack,
    retry,
    skip,
    resetPlayer,
  } = music;

  // Persisted state: 'compact' (default) | 'expanded' | 'pill'
  const [playerState, setPlayerState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PLAYER_STATE_KEY);
      if (saved === 'compact' || saved === 'expanded' || saved === 'pill') {
        return saved;
      }
    }
    return 'compact';
  });

  const [queueOpen, setQueueOpen] = useState(false);
  const sheetRef = useRef(null);

  // Sync state to localStorage & document root variable --player-offset
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PLAYER_STATE_KEY, playerState);

    // Dynamic padding offset: 64px bar + 16px bottom gap + 16px breathing room = 96px for compact
    if (!currentTrack || playerState === 'pill') {
      document.documentElement.style.setProperty('--player-offset', '0px');
    } else {
      document.documentElement.style.setProperty('--player-offset', '96px');
    }
  }, [playerState, currentTrack]);

  // Route change: collapse expanded -> compact (do not stop playback)
  useEffect(() => {
    const handleRouteChange = () => {
      setPlayerState((prev) => (prev === 'expanded' ? 'compact' : prev));
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Global Keyboard Navigation:
  // - Space: Play/Pause (when not inside input, textarea, contenteditable)
  // - Shift + Right: Next
  // - Shift + Left: Previous
  // - Escape: Expanded -> Compact
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isEditable = document.activeElement?.isContentEditable;
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || isEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.shiftKey && e.code === 'ArrowRight') {
        e.preventDefault();
        nextTrack();
      } else if (e.shiftKey && e.code === 'ArrowLeft') {
        e.preventDefault();
        prevTrack();
      } else if (e.key === 'Escape' && playerState === 'expanded') {
        e.preventDefault();
        setPlayerState('compact');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack, playerState]);

  // Click on compact progress bar to seek
  const handleCompactSeek = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    handleSeek(newPercent);
  }, [handleSeek]);

  // Close player action: stops audio, clears track, resets state
  const handleClosePlayer = useCallback(() => {
    resetPlayer();
    document.documentElement.style.setProperty('--player-offset', '0px');
  }, [resetPlayer]);

  // Elapsed time in seconds
  const currentSeconds = duration > 0 ? (progress / 100) * duration : 0;

  if (!currentTrack) return null;
  const displayTrack = currentTrack;
  const trackIsLiked = isLiked?.(displayTrack.id);

  // ──────────────────────────────────────────────────────────
  // 3. MINIMISED PILL (52px Circular Floating Button)
  // ──────────────────────────────────────────────────────────
  if (playerState === 'pill') {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - ((progress || 0) / 100) * circumference;

    return (
      <aside
        className="premium-bottom-player-container state-pill" data-testid="player-pill"
        role="region"
        aria-label={t('music.player.ariaLabel', 'Audio Player')}
      >
        <button
          type="button"
          className="mka-player-pill-button"
          onClick={() => setPlayerState('compact')}
          title={`${displayTrack.title} — ${t('music.player.restore', 'Restore player')}`}
          aria-label={`${displayTrack.title} — ${t('music.player.restore', 'Restore player')}`}
        >
          {/* Circular SVG Progress Ring */}
          <svg className="mka-pill-svg-ring" width="52" height="52" viewBox="0 0 52 52">
            <circle
              className="mka-pill-ring-bg"
              cx="26"
              cy="26"
              r={radius}
              fill="none"
              strokeWidth="2.5"
            />
            <circle
              className="mka-pill-ring-fill"
              cx="26"
              cy="26"
              r={radius}
              fill="none"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Thumbnail Cover */}
          <img
            className="mka-pill-cover"
            src={displayTrack.coverUrl || defaultCover}
            alt=""
            onError={(e) => { e.currentTarget.src = defaultCover; }}
          />

          {/* Animated Equalizer while playing */}
          {isPlaying && (
            <div className="mka-pill-equaliser" aria-hidden="true">
              <span className="mka-eq-bar" />
              <span className="mka-eq-bar" />
              <span className="mka-eq-bar" />
            </div>
          )}

          {/* Mini Play/Pause Overlay Action */}
          <span
            className="mka-pill-play-overlay"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            title={isPlaying ? t('music.player.pause', 'Pause') : t('music.player.play', 'Play')}
          >
            {isBuffering ? (
              <LoaderCircle size={10} className="music-spin" />
            ) : isPlaying ? (
              <Pause size={10} fill="currentColor" />
            ) : (
              <Play size={10} fill="currentColor" style={{ marginLeft: '1px' }} />
            )}
          </span>
        </button>
      </aside>
    );
  }

  // ──────────────────────────────────────────────────────────
  // 2. EXPANDED BOTTOM SHEET STATE
  // ──────────────────────────────────────────────────────────
  if (playerState === 'expanded') {
    return (
      <div
        className="mka-expanded-backdrop" data-testid="player-expanded"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setPlayerState('compact');
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-label={t('music.player.ariaLabel', 'Audio Player')}
      >
        <div className="mka-expanded-sheet" ref={sheetRef}>
          {/* Header Bar */}
          <div className="mka-expanded-header">
            <button
              type="button"
              className="mka-btn-icon"
              onClick={() => setPlayerState('compact')}
              aria-label={t('music.player.collapse', 'Collapse player')}
              title={t('music.player.collapse', 'Collapse player')}
            >
              <ChevronDown size={22} />
            </button>
            <div className="mka-drag-handle" aria-hidden="true" />
            <button
              type="button"
              className="mka-btn-icon"
              onClick={handleClosePlayer}
              aria-label={t('music.player.close', 'Close player')}
              title={t('music.player.close', 'Close player')}
            >
              <X size={20} />
            </button>
          </div>

          <div className="mka-expanded-content">
            {/* Playback Error Banner if any */}
            {playbackError && (
              <div className="premium-player-error-banner" role="alert" style={{ width: '100%' }}>
                <AlertCircle size={16} />
                <span style={{ flex: 1 }}>{playbackError}</span>
                {retry && (
                  <button
                    type="button"
                    onClick={retry}
                    style={{
                      background: 'rgba(0,0,0,0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  >
                    {t('music.player.retry', 'Retry')}
                  </button>
                )}
                {skip && (
                  <button
                    type="button"
                    onClick={skip}
                    style={{
                      background: 'rgba(0,0,0,0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '12px',
                      marginLeft: '6px',
                    }}
                  >
                    {t('music.player.skip', 'Skip')}
                  </button>
                )}
              </div>
            )}

            {/* Artwork Cover */}
            <div className="mka-expanded-cover">
              <img
                src={displayTrack.coverUrl || defaultCover}
                alt=""
                onError={(e) => { e.currentTarget.src = defaultCover; }}
              />
            </div>

            {/* Title, Artist & Like */}
            <div className="mka-expanded-meta">
              <h3 className="mka-expanded-title" title={displayTrack.title}>
                {displayTrack.title}
              </h3>
              <p className="mka-expanded-artist" title={displayTrack.artist}>
                {displayTrack.artist || 'Aawaj Man Ki'}
              </p>
            </div>

            {/* Scrub Slider with Full Timestamps */}
            <div className="mka-expanded-scrub-row">
              <span className="mka-expanded-time">{formatTime(currentSeconds)}</span>
              <div className="mka-expanded-slider-wrap">
                <input
                  type="range"
                  className="mka-slider"
                  aria-label={t('music.player.seek', 'Seek playback')}
                  aria-valuetext={`${formatTime(currentSeconds)} of ${formatTime(duration)}`}
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress || 0}
                  style={{
                    background: `linear-gradient(to right, #6F405F 0%, #6F405F ${progress || 0}%, #E1DCDB ${progress || 0}%, #E1DCDB 100%)`,
                  }}
                  onChange={(e) => handleSeek(e.target.value)}
                />
              </div>
              <span className="mka-expanded-time">{formatTime(duration)}</span>
            </div>

            {/* Transport Controls Row */}
            <div className="mka-expanded-controls">
              <button
                type="button"
                className={`mka-btn-icon ${shuffleEnabled ? 'mka-control-active' : ''}`}
                onClick={toggleShuffle}
                aria-label={shuffleEnabled ? t('music.player.shuffleOff', 'Shuffle Off') : t('music.player.shuffleOn', 'Shuffle On')}
                title={shuffleEnabled ? t('music.player.shuffleOff', 'Shuffle Off') : t('music.player.shuffleOn', 'Shuffle On')}
              >
                <Shuffle size={20} />
              </button>

              <button
                type="button"
                className="mka-btn-icon"
                onClick={prevTrack}
                aria-label={t('music.player.previous', 'Previous')}
                title={t('music.player.previous', 'Previous')}
              >
                <SkipBack size={22} fill="currentColor" />
              </button>

              <button
                type="button"
                className="mka-btn-play-52"
                onClick={togglePlay}
                aria-label={isPlaying ? t('music.player.pause', 'Pause') : t('music.player.play', 'Play')}
                title={isPlaying ? t('music.player.pause', 'Pause') : t('music.player.play', 'Play')}
              >
                {isBuffering ? (
                  <LoaderCircle size={26} className="music-spin" />
                ) : isPlaying ? (
                  <Pause size={26} fill="currentColor" />
                ) : (
                  <Play size={26} fill="currentColor" style={{ marginLeft: '2px' }} />
                )}
              </button>

              <button
                type="button"
                className="mka-btn-icon"
                onClick={nextTrack}
                aria-label={t('music.player.next', 'Next')}
                title={t('music.player.next', 'Next')}
              >
                <SkipForward size={22} fill="currentColor" />
              </button>

              <button
                type="button"
                className={`mka-btn-icon ${repeatMode !== 'OFF' ? 'mka-control-active' : ''}`}
                onClick={cycleRepeatMode}
                aria-label={`${t('music.player.repeat', 'Repeat')}: ${repeatMode}`}
                title={`${t('music.player.repeat', 'Repeat')}: ${repeatMode}`}
              >
                {repeatMode === 'ONE' ? <Repeat1 size={20} /> : <Repeat size={20} />}
              </button>
            </div>

            {/* Volume & Queue Accordion Row */}
            <div className="mka-expanded-extra-row">
              <div className="mka-expanded-volume-wrap">
                <button
                  type="button"
                  className="mka-btn-icon"
                  onClick={toggleMute}
                  aria-label={isMuted ? t('music.player.unmute', 'Unmute') : t('music.player.mute', 'Mute')}
                  title={isMuted ? t('music.player.unmute', 'Unmute') : t('music.player.mute', 'Mute')}
                >
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  className="mka-expanded-volume-slider"
                  aria-label={t('music.player.volume', 'Volume')}
                  aria-valuetext={`${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  style={{
                    background: `linear-gradient(to right, #6F405F 0%, #6F405F ${(isMuted ? 0 : volume) * 100}%, #E1DCDB ${(isMuted ? 0 : volume) * 100}%, #E1DCDB 100%)`,
                  }}
                  onChange={(e) => setVolume(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className={`mka-compact-like-btn ${trackIsLiked ? 'liked' : ''}`}
                  onClick={() => onToggleLike?.(displayTrack.id)}
                  aria-label={trackIsLiked ? t('music.player.unlike', 'Unlike track') : t('music.player.like', 'Like track')}
                  title={trackIsLiked ? t('music.player.unlike', 'Unlike track') : t('music.player.like', 'Like track')}
                >
                  <Heart
                    size={20}
                    strokeWidth={2}
                    fill={trackIsLiked ? '#FF2E93' : 'none'}
                    color={trackIsLiked ? '#FF2E93' : '#6F405F'}
                  />
                </button>

                <button
                  type="button"
                  className={`mka-btn-icon ${queueOpen ? 'mka-control-active' : ''}`}
                  onClick={() => setQueueOpen((prev) => !prev)}
                  aria-label={t('music.player.queue', 'Playback Queue')}
                  title={t('music.player.queue', 'Playback Queue')}
                >
                  <ListMusic size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Queue Drawer */}
            {queueOpen && (
              <div className="mka-expanded-queue-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px' }}>
                  <strong style={{ fontSize: '12px', color: '#2D1D15' }}>
                    {t('music.player.queue', 'Playback Queue')} ({queue.length})
                  </strong>
                </div>
                {queue.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <button
                      key={`${track.id}-${idx}`}
                      type="button"
                      className={`mka-expanded-queue-item ${isCurrent ? 'active' : ''}`}
                      onClick={() => playTrack(track, queue)}
                    >
                      <img
                        src={track.coverUrl || defaultCover}
                        alt=""
                        onError={(e) => { e.currentTarget.src = defaultCover; }}
                      />
                      <div className="mka-queue-meta">
                        <strong>{track.title}</strong>
                        <span>{track.artist || 'Aawaj Man Ki'}</span>
                      </div>
                      {isCurrent && isPlaying && (
                        <span style={{ fontSize: '10px', color: '#6F405F', fontWeight: 700 }}>
                          {t('music.player.playing', 'Playing')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // 1. COMPACT BAR (Default Single Row, Max Width 720px)
  // ──────────────────────────────────────────────────────────
  return (
    <aside
      className="premium-bottom-player-container state-compact" data-testid="player-compact"
      role="region"
      aria-label={t('music.player.ariaLabel', 'Audio Player')}
    >
      <div className="mka-player-compact-bar">
        {/* Top 3px Progress Line */}
        <div
          className="mka-compact-progress-top"
          onClick={handleCompactSeek}
          role="slider"
          aria-label={t('music.player.seek', 'Seek playback')}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress || 0}
          aria-valuetext={`${formatTime(currentSeconds)} of ${formatTime(duration)}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') handleSeek(Math.min(100, (progress || 0) + 5));
            if (e.key === 'ArrowLeft') handleSeek(Math.max(0, (progress || 0) - 5));
          }}
        >
          <div
            className="mka-compact-progress-fill"
            style={{ width: `${progress || 0}%` }}
          />
          <div className="mka-compact-progress-hover-time">
            {formatTime(currentSeconds)} / {formatTime(duration)}
          </div>
        </div>

        {/* Left: 44px Cover & Track Info (Click opens expanded) */}
        <div
          className="mka-compact-left"
          onClick={() => setPlayerState('expanded')}
          title={t('music.player.expand', 'Expand player')}
        >
          <div className="mka-compact-cover">
            <img
              src={displayTrack.coverUrl || defaultCover}
              alt=""
              onError={(e) => { e.currentTarget.src = defaultCover; }}
            />
          </div>
          <div className="mka-compact-meta">
            <strong className="mka-compact-title" title={displayTrack.title}>
              {displayTrack.title}
            </strong>
            <span className="mka-compact-artist" title={displayTrack.artist}>
              {displayTrack.artist || 'Aawaj Man Ki'}
            </span>
          </div>
        </div>

        {/* Centre: Previous, Play/Pause (40px), Next */}
        <div className="mka-compact-center">
          <button
            type="button"
            className="mka-btn-icon mka-hide-mobile"
            onClick={prevTrack}
            aria-label={t('music.player.previous', 'Previous')}
            title={t('music.player.previous', 'Previous')}
          >
            <SkipBack size={18} fill="currentColor" />
          </button>

          <button
            type="button"
            className="mka-btn-play-40"
            onClick={togglePlay}
            aria-label={isPlaying ? t('music.player.pause', 'Pause') : t('music.player.play', 'Play')}
            title={isPlaying ? t('music.player.pause', 'Pause') : t('music.player.play', 'Play')}
          >
            {isBuffering ? (
              <LoaderCircle size={20} className="music-spin" />
            ) : isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
            )}
          </button>

          <button
            type="button"
            className="mka-btn-icon"
            onClick={nextTrack}
            aria-label={t('music.player.next', 'Next')}
            title={t('music.player.next', 'Next')}
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {/* Right: Like, Expand, Minimise, Close */}
        <div className="mka-compact-right">
          <button
            type="button"
            className={`mka-compact-like-btn mka-hide-mobile ${trackIsLiked ? 'liked' : ''}`}
            onClick={() => onToggleLike?.(displayTrack.id)}
            aria-label={trackIsLiked ? t('music.player.unlike', 'Unlike track') : t('music.player.like', 'Like track')}
            title={trackIsLiked ? t('music.player.unlike', 'Unlike track') : t('music.player.like', 'Like track')}
          >
            <Heart
              size={18}
              strokeWidth={2}
              fill={trackIsLiked ? '#FF2E93' : 'none'}
              color={trackIsLiked ? '#FF2E93' : '#6F405F'}
            />
          </button>

          <button
            type="button"
            className="mka-btn-icon"
            onClick={() => setPlayerState('expanded')}
            aria-label={t('music.player.expand', 'Expand player')}
            title={t('music.player.expand', 'Expand player')}
          >
            <ChevronUp size={20} />
          </button>

          <button
            type="button"
            className="mka-btn-icon"
            onClick={() => setPlayerState('pill')}
            data-testid="player-minimise"
            aria-label={t('music.player.minimize', 'Minimize player')}
            title={t('music.player.minimize', 'Minimize player')}
          >
            <Minimize2 size={17} />
          </button>

          <button
            type="button"
            className="mka-btn-icon"
            onClick={handleClosePlayer}
            data-testid="player-close"
            aria-label={t('music.player.close', 'Close player')}
            title={t('music.player.close', 'Close player')}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
