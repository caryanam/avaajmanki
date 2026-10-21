import React, { useRef } from 'react';
import { Pause, Play, Volume2, VolumeX, LoaderCircle, AlertCircle } from 'lucide-react';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import { getMediaUrl } from '../../config/env.js';
import defaultCover from '../../assets/music-cover.jpg';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function WaveformPlayer({
  audioUrl,
  durationSeconds = 0,
  waveform = [],
  title = 'Voice Note',
  artistName = '',
  trackId,
  coverUrl,
}) {
  const music = useMoodMusic();
  const waveformContainerRef = useRef(null);
  const resolvedAudioUrl = getMediaUrl(audioUrl);
  const resolvedCoverUrl = coverUrl ? getMediaUrl(coverUrl) : defaultCover;
  const generatedId = String(trackId || audioUrl);
  const isActive = Boolean(
    music.currentTrack &&
      (music.currentTrack.audioUrl === resolvedAudioUrl ||
        music.currentTrack.audioUrl === audioUrl ||
        String(music.currentTrack.id) === `community-audio-${generatedId}`)
  );
  const hasError = isActive && Boolean(music.playbackError);
  const isBuffering = isActive && Boolean(music.isBuffering);
  const isPlaying = isActive && Boolean(music.isPlaying) && !isBuffering && !hasError;
  const duration = isActive && music.duration ? music.duration : durationSeconds;
  const progressPercent = isActive ? music.progress : 0;
  const currentTime = duration > 0 ? (progressPercent / 100) * duration : 0;

  // Fallback 100 peak samples if waveform is missing or empty
  const peaks = React.useMemo(() => {
    if (Array.isArray(waveform) && waveform.length > 0) {
      if (waveform.length === 100) return waveform;
      // Interpolate or slice to 100 items
      const res = [];
      for (let i = 0; i < 100; i++) {
        const idx = Math.floor((i / 100) * waveform.length);
        res.push(Math.max(0.1, Math.min(1.0, Number(waveform[idx]) || 0.2)));
      }
      return res;
    }
    // Pseudo-random deterministic waveform pattern
    const mock = [];
    for (let i = 0; i < 100; i++) {
      const v = Math.abs(Math.sin(i * 0.15) * 0.7 + Math.cos(i * 0.3) * 0.3);
      mock.push(Math.max(0.15, Math.min(0.95, v)));
    }
    return mock;
  }, [waveform]);

  const togglePlay = () => {
    if (isActive) {
      if (hasError) {
        music.retry();
      } else {
        music.togglePlay();
      }
      return;
    }
    const track = {
      id: `community-audio-${generatedId}`,
      title,
      artist: artistName || 'Community',
      audioUrl: resolvedAudioUrl,
      coverUrl: resolvedCoverUrl,
      durationSeconds,
    };
    music.playTrack(track, [track]);
  };

  const handleSeek = (event) => {
    const container = waveformContainerRef.current;
    if (!container || !duration) return;

    const rect = container.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    if (!isActive) togglePlay();
    music.handleSeek(percentage * 100);
  };

  return (
    <div className="waveform-player-card">
      <div className="waveform-player-body">
        <button
          className={`waveform-play-btn ${hasError ? 'error' : ''}`}
          type="button"
          onClick={togglePlay}
          aria-label={hasError ? `Error: ${music.playbackError}. Tap to retry` : isPlaying ? 'Pause voice note' : 'Play voice note'}
          title={hasError ? 'Playback error. Tap to retry' : isPlaying ? 'Pause' : 'Play'}
        >
          {hasError ? (
            <AlertCircle size={18} color="#FF3B30" />
          ) : isBuffering ? (
            <LoaderCircle size={18} className="music-spin" />
          ) : isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} style={{ marginLeft: 2 }} />
          )}
        </button>

        <div className="waveform-track-info">
          <div
            className="waveform-bars-container"
            ref={waveformContainerRef}
            onClick={handleSeek}
            role="slider"
            aria-valuenow={Math.round(progressPercent)}
            aria-valuemin="0"
            aria-valuemax="100"
            tabIndex={0}
          >
            {peaks.map((height, idx) => {
              const barPercent = (idx / peaks.length) * 100;
              const isPlayed = barPercent <= progressPercent;
              return (
                <div
                  key={idx}
                  className={`waveform-bar ${isPlayed ? 'played' : ''}`}
                  style={{
                    height: `${Math.max(15, Math.round(height * 100))}%`,
                  }}
                />
              );
            })}
          </div>

          <div className="waveform-time-row">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          className="waveform-mute-btn"
          type="button"
          onClick={music.toggleMute}
          aria-label={music.isMuted ? 'Unmute' : 'Mute'}
        >
          {music.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
}
