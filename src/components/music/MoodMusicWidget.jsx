import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LoaderCircle, Music2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import defaultCover from '../../assets/music-cover.jpg';
import { apiMusicService } from '../../services/apiMusicService.js';
import '../../styles/music.css';
import { getListeningMoodOption } from '../../config/musicMoods.js';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export function MoodMusicWidget() {
  const music = useMoodMusic();
  const musicTheme = getListeningMoodOption(music.selectedMood).theme;
  const { isWidgetOpen, setIsWidgetOpen } = music;
  const widgetRef = useRef(null);

  // Position state (null = default CSS bottom/right)
  const [pos, setPos] = useState({ x: null, y: null });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const hasMovedRef = useRef(false);

  // Keep position constrained within viewport on window resize
  useEffect(() => {
    function handleResize() {
      if (pos.x !== null && pos.y !== null) {
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 80;
        setPos((prev) => ({
          x: Math.max(10, Math.min(maxX, prev.x)),
          y: Math.max(10, Math.min(maxY, prev.y)),
        }));
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pos]);

  // Collapse player on click outside when expanded
  useEffect(() => {
    if (!isWidgetOpen) return;

    function handleOutsideClick(event) {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsWidgetOpen(false);
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isWidgetOpen, setIsWidgetOpen]);

  const currentSeconds = music.duration * (music.progress / 100);

  const handleBubblePlayToggle = async () => {
    if (music.currentTrack) {
      music.togglePlay();
      return;
    }
    if (music.queue && music.queue.length > 0) {
      music.playTrack(music.queue[0], music.queue);
      return;
    }
    try {
      const res = await apiMusicService.getPublicTracks({ page: 0, size: 10 });
      const tracks = res?.content || [];
      if (tracks.length > 0) {
        music.playTrack(tracks[0], tracks);
      }
    } catch (err) {
      console.warn('Could not fetch music for bubble play:', err);
    }
  };

  // Drag start handler for mouse & touch
  const handleDragStart = (e) => {
    if (e.type === 'mousedown' && e.button !== 0) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let currentX = pos.x;
    let currentY = pos.y;

    if (currentX === null || currentY === null) {
      if (widgetRef.current) {
        const rect = widgetRef.current.getBoundingClientRect();
        currentX = rect.left;
        currentY = rect.top;
      } else {
        currentX = window.innerWidth - 240;
        currentY = window.innerHeight - 80;
      }
    }

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: currentX,
      posY: currentY,
    };
    isDraggingRef.current = true;
    hasMovedRef.current = false;

    const handleDragMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const moveX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = moveX - dragStartRef.current.mouseX;
      const deltaY = moveY - dragStartRef.current.mouseY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMovedRef.current = true;
      }

      const widgetWidth = widgetRef.current ? widgetRef.current.offsetWidth : 220;
      const widgetHeight = widgetRef.current ? widgetRef.current.offsetHeight : 60;

      const newX = Math.max(10, Math.min(window.innerWidth - widgetWidth - 10, dragStartRef.current.posX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - widgetHeight - 10, dragStartRef.current.posY + deltaY));

      setPos({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
  };

  const dynamicStyle = {
    position: 'fixed',
    zIndex: 'var(--z-player, 500)',
    cursor: isDraggingRef.current ? 'grabbing' : 'grab',
    touchAction: 'none',
    ...(pos.x !== null && pos.y !== null
      ? { left: `${pos.x}px`, top: `${pos.y}px`, right: 'auto', bottom: 'auto' }
      : { left: '24px', bottom: '24px' }),
  };

  // Hide MoodMusicWidget if bottom player is active and in compact or expanded state
  const playerState = typeof window !== 'undefined' ? (localStorage.getItem('mka_player_state') || 'compact') : 'compact';
  if (music.currentTrack && (playerState === 'compact' || playerState === 'expanded')) {
    return null;
  }

  if (!music.isWidgetOpen) {
    return createPortal(
      <div
        ref={widgetRef}
        data-music-theme={musicTheme}
        style={dynamicStyle}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div
          className="music-player-bubble"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px 4px 5px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)',
            color: '#FFFFFF',
            boxShadow: '0 6px 18px rgba(61, 35, 52, 0.4)',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            cursor: isDraggingRef.current ? 'grabbing' : 'grab',
            userSelect: 'none',
            maxWidth: '210px',
            position: 'relative',
          }}
        >
          <img
            src={music.currentTrack?.coverUrl || defaultCover}
            alt=""
            onError={(e) => { e.currentTarget.src = defaultCover; }}
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />

          <div
            onClick={(e) => {
              if (hasMovedRef.current) return;
              music.setIsWidgetOpen(true);
            }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, cursor: 'pointer' }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1 }}>
              {music.currentTrack?.title || 'Aawaj Man Ki'}
            </span>
            <span style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1, marginTop: '1px' }}>
              {music.currentTrack?.artist || 'Click to play'}
            </span>
          </div>

          {/* Basic Controls Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={music.prevTrack}
              disabled={!music.currentTrack}
              style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', opacity: !music.currentTrack ? 0.5 : 1 }}
              title="Previous"
            >
              <SkipBack size={13} fill="currentColor" />
            </button>

            <button
              type="button"
              onClick={handleBubblePlayToggle}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
                border: 'none',
                color: '#FFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
              title={music.isPlaying ? 'Pause' : 'Play'}
            >
              {music.isBuffering ? (
                <LoaderCircle size={12} className="music-spin" />
              ) : music.isPlaying ? (
                <Pause size={12} fill="currentColor" />
              ) : (
                <Play size={12} fill="currentColor" style={{ marginLeft: '1px' }} />
              )}
            </button>

            <button
              type="button"
              onClick={music.nextTrack}
              disabled={!music.currentTrack}
              style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', opacity: !music.currentTrack ? 0.5 : 1 }}
              title="Next"
            >
              <SkipForward size={13} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <section
      ref={widgetRef}
      className="music-player"
      data-music-theme={musicTheme}
      aria-label="Music player"
      style={{
        ...dynamicStyle,
        ...(pos.x === null ? {} : { bottom: 'auto', right: 'auto' }),
      }}
    >
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ cursor: 'grab', userSelect: 'none', width: '100%' }}
      >
        <button
          className="music-icon-button music-player-close"
          type="button"
          onClick={() => music.setIsWidgetOpen(false)}
          aria-label="Minimize music player"
        >
          <X size={18} />
        </button>
        <div className="music-player-track">
          <img src={music.currentTrack.coverUrl || defaultCover} alt={`${music.currentTrack.title} cover`} onError={(e) => { e.currentTarget.src = defaultCover; }} />
          <div>
            <strong>{music.currentTrack.title}</strong>
            <span>{music.currentTrack.artist || 'Unknown artist'}</span>
          </div>
        </div>
      </div>

      {music.playbackError && <p className="music-player-error" role="alert">{music.playbackError}</p>}

      <label className="music-seek-label">
        <span>{formatTime(currentSeconds)}</span>
        <input aria-label="Seek track" type="range" min="0" max="100" step="0.1" value={music.progress || 0} onChange={(event) => music.handleSeek(event.target.value)} />
        <span>{formatTime(music.duration)}</span>
      </label>

      <div className="music-player-controls">
        <button
          className={`music-icon-button music-mode-button${music.shuffleEnabled ? ' active' : ''}`}
          type="button"
          onClick={music.toggleShuffle}
          aria-label={music.shuffleEnabled ? 'Shuffle on' : 'Shuffle off'}
          aria-pressed={music.shuffleEnabled}
          title={music.shuffleEnabled ? 'Shuffle on' : 'Shuffle off'}
        ><Shuffle size={19} /></button>
        <button className="music-icon-button" type="button" onClick={music.prevTrack} aria-label="Previous track"><SkipBack size={20} /></button>
        <button className="music-play-button" type="button" onClick={music.togglePlay} aria-label={music.isPlaying ? 'Pause' : 'Play'}>
          {music.isBuffering ? <LoaderCircle className="music-spin" size={22} /> : music.isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button className="music-icon-button" type="button" onClick={music.nextTrack} aria-label="Next track"><SkipForward size={20} /></button>
        <button
          className={`music-icon-button music-mode-button${music.repeatMode !== 'OFF' ? ' active' : ''}`}
          type="button"
          onClick={music.cycleRepeatMode}
          aria-label={`Repeat ${music.repeatMode.toLowerCase()}`}
          title={`Repeat ${music.repeatMode.toLowerCase()}`}
        >{music.repeatMode === 'ONE' ? <Repeat1 size={19} /> : <Repeat size={19} />}</button>
        <button className="music-icon-button" type="button" onClick={music.toggleMute} aria-label={music.isMuted ? 'Unmute' : 'Mute'}>
          {music.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input className="music-volume" aria-label="Volume" type="range" min="0" max="1" step="0.05" value={music.isMuted ? 0 : music.volume} onChange={(event) => music.setVolume(event.target.value)} />
      </div>
      <Music2 className="music-player-watermark" aria-hidden="true" />
    </section>,
    document.body
  );
}
