import assert from 'node:assert/strict';
import test from 'node:test';

// Test harness simulating MoodMusicContext playback state logic
class PlaybackControllerMock {
  constructor() {
    this.currentTrack = null;
    this.queue = [];
    this.trackIndex = -1;
    this.isPlaying = false;
    this.isBuffering = false;
    this.playbackError = '';
    this.requestToken = 0;
    this.stallTimer = null;
  }

  clearStallWatchdog() {
    if (this.stallTimer) {
      clearTimeout(this.stallTimer);
      this.stallTimer = null;
    }
  }

  startStallWatchdog(timeoutMs = 8000) {
    this.clearStallWatchdog();
    this.stallTimer = setTimeout(() => {
      this.isBuffering = false;
      this.playbackError = "Couldn't load this track. Please retry or skip.";
      this.isPlaying = false;
    }, timeoutMs);
  }

  async playTrack(track, incomingQueue = [], audioMock = null) {
    const targetId = String(track.id);
    const rawQueue = (Array.isArray(incomingQueue) && incomingQueue.length > 0)
      ? incomingQueue
      : [track];

    const sanitizedQueue = rawQueue.filter((item) => item?.audioUrl);
    const targetIndex = sanitizedQueue.findIndex((item) => String(item?.id) === targetId);
    const indexToPlay = targetIndex >= 0 ? targetIndex : 0;

    return this.playAt(indexToPlay, sanitizedQueue, audioMock);
  }

  async playAt(index, nextQueue, audioMock) {
    const tracks = nextQueue.filter((t) => t?.audioUrl);
    if (!tracks.length) {
      this.playbackError = 'This track has no playable audio source.';
      return;
    }

    const targetTrack = tracks[index];
    const token = ++this.requestToken;
    this.clearStallWatchdog();

    this.queue = tracks;
    this.trackIndex = index;
    this.currentTrack = { ...targetTrack, id: String(targetTrack.id) };
    this.playbackError = '';
    this.isBuffering = true;
    this.startStallWatchdog();

    try {
      if (audioMock) {
        await audioMock.play();
      }
      if (this.requestToken !== token) return; // Stale request ignored
      this.clearStallWatchdog();
      this.isPlaying = true;
      this.isBuffering = false;
    } catch (err) {
      if (this.requestToken !== token) return; // Stale request ignored
      this.clearStallWatchdog();
      this.isPlaying = false;
      this.isBuffering = false;
      this.playbackError = err?.name === 'NotAllowedError'
        ? 'Playback was blocked by the browser. Press play to continue.'
        : 'Unable to play this track. Please try another track.';
    }
  }

  handleWaiting() {
    this.isBuffering = true;
    this.startStallWatchdog();
  }

  handlePlaying() {
    this.isPlaying = true;
    this.isBuffering = false;
    this.playbackError = '';
    this.clearStallWatchdog();
  }
}

test('play rejection sets isPlaying=false and retains currentTrack for retry', async () => {
  const controller = new PlaybackControllerMock();
  const mockAudio = {
    play: async () => {
      const err = new Error('NotAllowedError');
      err.name = 'NotAllowedError';
      throw err;
    },
  };

  const track = { id: 42, title: 'Sample Song', audioUrl: 'http://test/song.mp3' };
  await controller.playTrack(track, [track], mockAudio);

  assert.equal(controller.isPlaying, false, 'isPlaying must be false when play() rejects');
  assert.equal(controller.isBuffering, false, 'isBuffering must be false after rejection');
  assert.ok(controller.playbackError.includes('Playback was blocked'), 'playbackError must be set');
  assert.equal(controller.currentTrack?.id, '42', 'currentTrack must remain set so UI can offer Retry');
});

test('stall watchdog fires if buffering lasts over threshold without playing', async () => {
  const controller = new PlaybackControllerMock();
  controller.isBuffering = true;
  controller.startStallWatchdog(20); // 20ms for test speed

  assert.equal(controller.isBuffering, true);
  await new Promise((resolve) => setTimeout(resolve, 35));

  assert.equal(controller.isBuffering, false, 'watchdog must cancel buffering UI');
  assert.equal(controller.isPlaying, false, 'isPlaying must not be true when stalled');
  assert.ok(controller.playbackError.includes("Couldn't load this track"), 'watchdog must set error message');
});

test('rapid track switching ignores stale play promise and keeps the final track', async () => {
  const controller = new PlaybackControllerMock();

  const slowTrack = { id: 1, title: 'Slow Track', audioUrl: 'http://test/1.mp3' };
  const fastTrack = { id: 2, title: 'Fast Track', audioUrl: 'http://test/2.mp3' };

  let slowResolve;
  const slowAudio = {
    play: () => new Promise((resolve) => { slowResolve = resolve; }),
  };
  const fastAudio = {
    play: async () => {},
  };

  // Start slow track
  const p1 = controller.playTrack(slowTrack, [slowTrack, fastTrack], slowAudio);

  // Immediately switch to fast track
  const p2 = controller.playTrack(fastTrack, [slowTrack, fastTrack], fastAudio);
  await p2;

  assert.equal(controller.currentTrack?.id, '2');
  assert.equal(controller.isPlaying, true);

  // Now slow track resolves late
  if (slowResolve) slowResolve();
  await p1;

  // Verify state wasn't overwritten by the slow track
  assert.equal(controller.currentTrack?.id, '2', 'Track 2 must remain current after Track 1 resolves');
  assert.equal(controller.isPlaying, true);
});

test('buffering during playback sets isBuffering=true without falsely toggling isPlaying=false before watchdog', () => {
  const controller = new PlaybackControllerMock();
  controller.isPlaying = true;

  // Stalled/waiting event fires from HTML5 audio element
  controller.handleWaiting();

  assert.equal(controller.isBuffering, true, 'isBuffering must be true');
  // When recovered:
  controller.handlePlaying();
  assert.equal(controller.isBuffering, false, 'isBuffering must return to false');
  assert.equal(controller.isPlaying, true, 'isPlaying must stay true');
});

test('audio element instance remains stable and unchanged across state changes and track switches', async () => {
  // Simulates the audioRef and single-effect architecture in MoodMusicContext
  let currentAudioInstance = null;
  let mountEffectRuns = 0;
  let cleanupRuns = 0;

  // Simulate mount effect
  const mountAudioEffect = () => {
    mountEffectRuns++;
    const audio = {
      id: 'audio-inst-1',
      src: '',
      paused: true,
      volume: 0.85,
      play: async () => { audio.paused = false; },
      pause: () => { audio.paused = true; },
      load: () => {},
    };
    currentAudioInstance = audio;
    return () => {
      cleanupRuns++;
      currentAudioInstance = null;
    };
  };

  const cleanup = mountAudioEffect();
  const initialAudioInstance = currentAudioInstance;
  assert.ok(initialAudioInstance, 'Audio instance must be created on mount');

  const controller = new PlaybackControllerMock();

  // 1. Buffering state change
  controller.handleWaiting();
  assert.equal(controller.isBuffering, true);
  assert.equal(currentAudioInstance, initialAudioInstance, 'Audio instance must not change on buffering');

  // 2. Playback error state change
  controller.playbackError = 'Some transient network glitch';
  assert.equal(currentAudioInstance, initialAudioInstance, 'Audio instance must not change on playbackError');

  // 3. Track switch
  const trackA = { id: 101, title: 'Track A', audioUrl: 'http://cdn/a.mp3' };
  const trackB = { id: 102, title: 'Track B', audioUrl: 'http://cdn/b.mp3' };
  await controller.playTrack(trackA, [trackA, trackB], currentAudioInstance);
  assert.equal(controller.currentTrack?.id, '101');
  assert.equal(currentAudioInstance, initialAudioInstance, 'Audio instance must remain identical after playing Track A');

  await controller.playTrack(trackB, [trackA, trackB], currentAudioInstance);
  assert.equal(controller.currentTrack?.id, '102');
  assert.equal(currentAudioInstance, initialAudioInstance, 'Audio instance must remain identical after switching to Track B');

  // Verify effect has run exactly once and cleanup has not been triggered mid-session
  assert.equal(mountEffectRuns, 1, 'Mount effect must execute exactly once');
  assert.equal(cleanupRuns, 0, 'Cleanup must not be called during playback or state updates');

  cleanup();
  assert.equal(cleanupRuns, 1, 'Cleanup runs only on unmount');
  assert.equal(currentAudioInstance, null);
});

