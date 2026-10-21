import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { clearMusicSession, getMusicSessionUserId, readMusicSession, saveMusicSession } from '../utils/musicSession.js';
import { dedupeTracksById, locateCurrentTrack } from '../utils/musicQueue.js';
import { getMediaUrl } from '../config/env.js';
import defaultCoverAsset from '../assets/music-cover.jpg';
import {
  cycleRepeatMode,
  DEFAULT_PLAYBACK_MODES,
  derivePlaybackQueue,
  REPEAT_MODES,
  reshuffleForNextCycle,
  resolveNextAction,
  resolvePreviousAction,
} from '../utils/musicPlayback.js';

const MoodMusicContext = createContext(null);

export function MoodMusicProvider({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const userId = getMusicSessionUserId(currentUser);
  const [sourceQueue, setSourceQueue] = useState([]);
  const [queue, setQueue] = useState([]);
  const [trackIndex, setTrackIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [musicMode, setMusicMode] = useState('ALL');
  const [selectorCompleted, setSelectorCompleted] = useState(false);
  const [musicSessionReady, setMusicSessionReady] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(DEFAULT_PLAYBACK_MODES.shuffleEnabled);
  const [repeatMode, setRepeatMode] = useState(DEFAULT_PLAYBACK_MODES.repeatMode);

  const audioRef = useRef(null);
  const sourceQueueRef = useRef([]);
  const queueRef = useRef([]);
  const trackIndexRef = useRef(-1);
  const currentTrackRef = useRef(null);
  const playAtRef = useRef(() => {});
  const nextRef = useRef(() => {});
  const identityRef = useRef(null);
  const shuffleEnabledRef = useRef(false);
  const repeatModeRef = useRef(REPEAT_MODES.OFF);
  const requestTokenRef = useRef(0);
  const stallWatchdogRef = useRef(null);
  const callbacksRef = useRef({});

  const clearStallWatchdog = useCallback(() => {
    if (stallWatchdogRef.current) {
      clearTimeout(stallWatchdogRef.current);
      stallWatchdogRef.current = null;
    }
  }, []);

  const startStallWatchdog = useCallback(() => {
    clearStallWatchdog();
    stallWatchdogRef.current = setTimeout(() => {
      callbacksRef.current.setIsBuffering?.(false);
      callbacksRef.current.setPlaybackError?.("Couldn't load this track. Please retry or skip.");
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        try {
          audio.pause();
        } catch (_) {
          // ignore
        }
      }
    }, 8000);
  }, [clearStallWatchdog]);

  const resetPlayer = useCallback(() => {
    clearStallWatchdog();
    requestTokenRef.current++;
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch (_) {
        // ignore
      }
    }
    sourceQueueRef.current = [];
    queueRef.current = [];
    trackIndexRef.current = -1;
    currentTrackRef.current = null;
    setSourceQueue([]);
    setQueue([]);
    setTrackIndex(-1);
    setCurrentTrack(null);
    setIsPlaying(false);
    setIsWidgetOpen(false);
    setProgress(0);
    setDuration(0);
    setIsBuffering(false);
    setPlaybackError('');
    shuffleEnabledRef.current = false;
    repeatModeRef.current = REPEAT_MODES.OFF;
    setShuffleEnabled(DEFAULT_PLAYBACK_MODES.shuffleEnabled);
    setRepeatMode(DEFAULT_PLAYBACK_MODES.repeatMode);
  }, [clearStallWatchdog]);

  useEffect(() => {
    if (authLoading) return;
    const previousId = identityRef.current;
    if (previousId !== null && previousId !== userId) {
      clearMusicSession(previousId);
      resetPlayer();
    }
    identityRef.current = userId;
    const session = readMusicSession(userId);
    setSelectedMood(session.selectedMood);
    setMusicMode(session.mode);
    setSelectorCompleted(session.selectorCompleted);
    setMusicSessionReady(true);
    if (userId === null) resetPlayer();
  }, [authLoading, resetPlayer, userId]);

  const completeMoodSelection = useCallback((mood) => {
    const session = saveMusicSession(userId, mood);
    setSelectedMood(session.selectedMood);
    setMusicMode(session.mode);
    setSelectorCompleted(session.selectorCompleted);
  }, [userId]);

  const playAt = useCallback(async (index, nextQueue = queueRef.current) => {
    const tracks = Array.isArray(nextQueue)
      ? nextQueue.filter((track) => track?.audioUrl || track?.publicAudioUrl || track?.privateAudioUrl)
      : [];
    if (!tracks.length) {
      setPlaybackError('This track has no playable audio source.');
      return;
    }

    const safeIndex = ((index % tracks.length) + tracks.length) % tracks.length;
    const targetTrack = tracks[safeIndex];
    const resolvedUrl = getMediaUrl(targetTrack.audioUrl || targetTrack.publicAudioUrl || targetTrack.privateAudioUrl);
    const coverSource = targetTrack.coverUrl
      || targetTrack.publicCoverUrl
      || targetTrack.privateCoverUrl
      || targetTrack.artworkUrl
      || targetTrack.albumImage;
    const resolvedCover = coverSource ? getMediaUrl(coverSource) : defaultCoverAsset;

    const track = {
      ...targetTrack,
      id: String(targetTrack.id),
      audioUrl: resolvedUrl,
      coverUrl: resolvedCover,
    };

    const audio = audioRef.current;
    if (!audio) return;

    const token = ++requestTokenRef.current;
    clearStallWatchdog();

    queueRef.current = tracks;
    trackIndexRef.current = safeIndex;
    setQueue(tracks);
    setTrackIndex(safeIndex);
    currentTrackRef.current = track;
    setCurrentTrack(track);
    setPlaybackError('');
    setProgress(0);
    setDuration(track.durationSeconds || 0);
    setIsBuffering(true);
    setIsWidgetOpen(true);
    startStallWatchdog();

    audio.src = resolvedUrl;
    audio.load();

    try {
      await audio.play();
      if (requestTokenRef.current !== token) return;
      clearStallWatchdog();
      setIsPlaying(true);
      setIsBuffering(false);
      setPlaybackError('');
    } catch (error) {
      if (requestTokenRef.current !== token) return;
      clearStallWatchdog();
      setIsPlaying(false);
      setIsBuffering(false);
      if (error?.name === 'AbortError') {
        return;
      }
      setPlaybackError(error?.name === 'NotAllowedError'
        ? 'Playback was blocked by the browser. Press play to continue.'
        : 'Unable to play this track. Please try another track.');
    }
  }, [clearStallWatchdog, startStallWatchdog]);

  playAtRef.current = playAt;

  const retry = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrackRef.current) return;
    const token = ++requestTokenRef.current;
    setPlaybackError('');
    setIsBuffering(true);
    startStallWatchdog();
    try {
      audio.load();
      await audio.play();
      if (requestTokenRef.current !== token) return;
      clearStallWatchdog();
      setIsPlaying(true);
      setIsBuffering(false);
      setPlaybackError('');
    } catch (err) {
      if (requestTokenRef.current !== token) return;
      clearStallWatchdog();
      setIsPlaying(false);
      setIsBuffering(false);
      if (err?.name === 'AbortError') return;
      setPlaybackError(err?.name === 'NotAllowedError'
        ? 'Playback was blocked by the browser. Press play to continue.'
        : 'Unable to play this track. Please try again.');
    }
  }, [clearStallWatchdog, startStallWatchdog]);

  const replayCurrent = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrackRef.current) return;
    audio.currentTime = 0;
    setProgress(0);
    setPlaybackError('');
    setIsBuffering(true);
    const token = ++requestTokenRef.current;
    startStallWatchdog();
    try {
      await audio.play();
      if (requestTokenRef.current !== token) return;
      clearStallWatchdog();
      setIsPlaying(true);
      setIsBuffering(false);
    } catch {
      if (requestTokenRef.current !== token) return;
      clearStallWatchdog();
      setIsPlaying(false);
      setIsBuffering(false);
      setPlaybackError('Unable to replay this track. Please try another track.');
    }
  }, [clearStallWatchdog, startStallWatchdog]);

  const advanceTrack = useCallback((naturalEnd = false) => {
    const tracks = queueRef.current;
    if (!tracks.length) return;
    const action = resolveNextAction({
      index: trackIndexRef.current,
      queueLength: tracks.length,
      repeatMode: repeatModeRef.current,
      naturalEnd,
    });
    if (action.type === 'REPLAY') {
      replayCurrent();
      return;
    }
    if (action.type === 'WRAP' && shuffleEnabledRef.current) {
      const reshuffled = reshuffleForNextCycle(sourceQueueRef.current, currentTrackRef.current);
      queueRef.current = reshuffled;
      setQueue(reshuffled);
      trackIndexRef.current = 0;
      setTrackIndex(0);
      playAtRef.current(0, reshuffled);
      return;
    }
    if (action.type === 'PLAY' || action.type === 'WRAP') {
      playAtRef.current(action.index, tracks);
      return;
    }
    if (naturalEnd) {
      clearStallWatchdog();
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, [clearStallWatchdog, replayCurrent]);

  const nextTrack = useCallback(() => advanceTrack(false), [advanceTrack]);
  const skip = useCallback(() => advanceTrack(false), [advanceTrack]);

  nextRef.current = advanceTrack;

  const prevTrack = useCallback(() => {
    const tracks = queueRef.current;
    if (!tracks.length) return;
    const action = resolvePreviousAction({
      index: trackIndexRef.current,
      queueLength: tracks.length,
      repeatMode: repeatModeRef.current,
    });
    if (action.type === 'PLAY' || action.type === 'WRAP') playAtRef.current(action.index, tracks);
  }, []);

  // Keep all state setters and watchdog handlers in callbacksRef for the audio element listeners
  useEffect(() => {
    callbacksRef.current = {
      setDuration,
      setProgress,
      setIsBuffering,
      setIsPlaying,
      setPlaybackError,
      clearStallWatchdog,
      startStallWatchdog,
    };
  });

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = 0.85;
    audioRef.current = audio;

    const updateTime = () => {
      const actualDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      callbacksRef.current.setDuration?.(actualDuration);
      callbacksRef.current.setProgress?.(actualDuration ? (audio.currentTime / actualDuration) * 100 : 0);
    };
    const updateMetadata = () => callbacksRef.current.setDuration?.(Number.isFinite(audio.duration) ? audio.duration : 0);
    const markBuffering = () => {
      callbacksRef.current.setIsBuffering?.(true);
      callbacksRef.current.startStallWatchdog?.();
    };
    const markPlay = () => {
      callbacksRef.current.setIsPlaying?.(true);
    };
    const markPlaying = () => {
      callbacksRef.current.setIsPlaying?.(true);
      callbacksRef.current.setIsBuffering?.(false);
      callbacksRef.current.setPlaybackError?.('');
      callbacksRef.current.clearStallWatchdog?.();
    };
    const markPaused = () => {
      callbacksRef.current.setIsPlaying?.(false);
      callbacksRef.current.clearStallWatchdog?.();
    };
    const markReady = () => {
      callbacksRef.current.setIsBuffering?.(false);
      callbacksRef.current.clearStallWatchdog?.();
    };
    const markSeeking = () => {
      callbacksRef.current.setIsBuffering?.(true);
    };
    const markSeeked = () => {
      callbacksRef.current.setIsBuffering?.(false);
    };
    const markError = () => {
      callbacksRef.current.setIsPlaying?.(false);
      callbacksRef.current.setIsBuffering?.(false);
      callbacksRef.current.clearStallWatchdog?.();
      callbacksRef.current.setPlaybackError?.('Unable to play this track. The audio may be unavailable.');
    };
    const markAbortedOrEmptied = () => {
      callbacksRef.current.setIsPlaying?.(false);
      callbacksRef.current.setIsBuffering?.(false);
      callbacksRef.current.clearStallWatchdog?.();
    };
    const handleEnded = () => {
      callbacksRef.current.setIsPlaying?.(false);
      callbacksRef.current.setIsBuffering?.(false);
      callbacksRef.current.clearStallWatchdog?.();
      nextRef.current(true);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateMetadata);
    audio.addEventListener('play', markPlay);
    audio.addEventListener('playing', markPlaying);
    audio.addEventListener('waiting', markBuffering);
    audio.addEventListener('stalled', markBuffering);
    audio.addEventListener('seeking', markSeeking);
    audio.addEventListener('seeked', markSeeked);
    audio.addEventListener('canplay', markReady);
    audio.addEventListener('pause', markPaused);
    audio.addEventListener('error', markError);
    audio.addEventListener('abort', markAbortedOrEmptied);
    audio.addEventListener('emptied', markAbortedOrEmptied);
    audio.addEventListener('ended', handleEnded);

    return () => {
      callbacksRef.current.clearStallWatchdog?.();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateMetadata);
      audio.removeEventListener('play', markPlay);
      audio.removeEventListener('playing', markPlaying);
      audio.removeEventListener('waiting', markBuffering);
      audio.removeEventListener('stalled', markBuffering);
      audio.removeEventListener('seeking', markSeeking);
      audio.removeEventListener('seeked', markSeeked);
      audio.removeEventListener('canplay', markReady);
      audio.removeEventListener('pause', markPaused);
      audio.removeEventListener('error', markError);
      audio.removeEventListener('abort', markAbortedOrEmptied);
      audio.removeEventListener('emptied', markAbortedOrEmptied);
      audio.removeEventListener('ended', handleEnded);
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch (_) {
        // ignore
      }
      audioRef.current = null;
    };
  }, []);

  const playTrack = useCallback((track, incomingQueue = []) => {
    if (!track) return;
    const targetId = String(track.id);

    // Filter tracks without audioUrl and keep the queue exactly as passed
    const rawQueue = (Array.isArray(incomingQueue) && incomingQueue.length > 0)
      ? incomingQueue
      : (queueRef.current && queueRef.current.length > 0 ? queueRef.current : [track]);

    const sanitizedQueue = dedupeTracksById(
      rawQueue.some((item) => String(item?.id) === targetId) ? rawQueue : [track, ...rawQueue]
    ).filter((item) => item?.audioUrl || item?.publicAudioUrl || item?.privateAudioUrl);

    sourceQueueRef.current = sanitizedQueue;
    setSourceQueue(sanitizedQueue);

    // Recompute index AFTER filtering based on String(id)
    const targetIndex = sanitizedQueue.findIndex((item) => String(item?.id) === targetId);
    const indexToPlay = targetIndex >= 0 ? targetIndex : 0;

    return playAt(indexToPlay, sanitizedQueue);
  }, [playAt]);

  const replaceQueuePreservingCurrentTrack = useCallback((newQueue) => {
    const source = dedupeTracksById(newQueue).filter((track) => track?.audioUrl || track?.publicAudioUrl || track?.privateAudioUrl);
    const current = currentTrackRef.current;
    const tracks = derivePlaybackQueue({
      sourceQueue: source,
      shuffleEnabled: shuffleEnabledRef.current,
      currentTrack: current,
    });
    const nextIndex = locateCurrentTrack(tracks, current);
    sourceQueueRef.current = source;
    queueRef.current = tracks;
    trackIndexRef.current = nextIndex;
    setSourceQueue(source);
    setQueue(tracks);
    setTrackIndex(nextIndex);
    if (!tracks.length && !current) {
      currentTrackRef.current = null;
      setCurrentTrack(null);
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    const enabled = !shuffleEnabledRef.current;
    const tracks = derivePlaybackQueue({
      sourceQueue: sourceQueueRef.current,
      shuffleEnabled: enabled,
      currentTrack: currentTrackRef.current,
    });
    const nextIndex = locateCurrentTrack(tracks, currentTrackRef.current);
    shuffleEnabledRef.current = enabled;
    queueRef.current = tracks;
    trackIndexRef.current = nextIndex;
    setShuffleEnabled(enabled);
    setQueue(tracks);
    setTrackIndex(nextIndex);
  }, []);

  const changeRepeatMode = useCallback(() => {
    const nextMode = cycleRepeatMode(repeatModeRef.current);
    repeatModeRef.current = nextMode;
    setRepeatMode(nextMode);
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrackRef.current) return;
    if (!audio.paused && !audio.ended) {
      audio.pause();
      setIsPlaying(false);
      clearStallWatchdog();
      return;
    }
    if (audio.ended || (audio.duration && audio.currentTime >= audio.duration)) {
      audio.currentTime = 0;
      setProgress(0);
    }
    const token = ++requestTokenRef.current;
    setPlaybackError('');
    setIsBuffering(true);
    startStallWatchdog();
    try {
      await audio.play();
      if (requestTokenRef.current !== token) return;
      clearStallWatchdog();
      setIsPlaying(true);
      setIsBuffering(false);
      setPlaybackError('');
    } catch (error) {
      if (requestTokenRef.current !== token) return;
      clearStallWatchdog();
      setIsPlaying(false);
      setIsBuffering(false);
      if (error?.name === 'AbortError') return;
      setPlaybackError(error?.name === 'NotAllowedError'
        ? 'Playback was blocked by the browser. Press play to continue.'
        : 'Unable to resume playback. Please try again.');
    }
  }, [clearStallWatchdog, startStallWatchdog]);

  const handleSeek = useCallback((newPercent) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const percent = Math.min(100, Math.max(0, Number(newPercent)));
    audio.currentTime = (percent / 100) * audio.duration;
    setProgress(percent);
  }, []);

  const setVolume = useCallback((newVolume) => {
    const audio = audioRef.current;
    const safeVolume = Math.min(1, Math.max(0, Number(newVolume)));
    if (audio) {
      audio.volume = safeVolume;
      audio.muted = safeVolume === 0;
    }
    setVolumeState(safeVolume);
    setIsMuted(safeVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }, []);

  const accountStateReady = identityRef.current === userId;

  return (
    <MoodMusicContext.Provider value={{
      sourceQueue: accountStateReady ? sourceQueue : [],
      playbackQueue: accountStateReady ? queue : [],
      queue: accountStateReady ? queue : [],
      trackIndex: accountStateReady ? trackIndex : -1,
      currentTrack: accountStateReady ? currentTrack : null,
      isPlaying: accountStateReady ? isPlaying : false,
      isWidgetOpen: accountStateReady ? isWidgetOpen : false,
      progress,
      duration,
      volume,
      isMuted,
      isBuffering,
      playbackError,
      selectedMood: accountStateReady ? selectedMood : null,
      musicMode: accountStateReady ? musicMode : 'ALL',
      selectorCompleted: accountStateReady ? selectorCompleted : false,
      musicSessionReady: accountStateReady ? musicSessionReady : false,
      musicSessionUserId: accountStateReady ? userId : null,
      shuffleEnabled: accountStateReady ? shuffleEnabled : false,
      repeatMode: accountStateReady ? repeatMode : REPEAT_MODES.OFF,
      setIsWidgetOpen,
      playTrack,
      replaceQueuePreservingCurrentTrack,
      toggleShuffle,
      cycleRepeatMode: changeRepeatMode,
      togglePlay,
      nextTrack,
      prevTrack,
      playNext: nextTrack,
      playPrevious: prevTrack,
      retry,
      skip,
      handleSeek,
      currentTime: duration > 0 ? (progress / 100) * duration : 0,
      seekTo: (seconds) => handleSeek(duration > 0 ? (seconds / duration) * 100 : 0),
      setVolume,
      toggleMute,
      completeMoodSelection,
      resetPlayer,
    }}>
      {children}
    </MoodMusicContext.Provider>
  );
}

export function useMoodMusic() {
  const context = useContext(MoodMusicContext);
  if (!context) throw new Error('useMoodMusic must be used within MoodMusicProvider');
  return context;
}
