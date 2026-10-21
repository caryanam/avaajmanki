import React, { useState, useEffect } from 'react';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';
import { useLikedSongs } from '../../hooks/useLikedSongs.js';
import { PremiumBottomPlayer } from '../music/PremiumBottomPlayer.jsx';

export function GlobalMusicPlayer() {
  const music = useMoodMusic();
  const { isLiked, toggleLike } = useLikedSongs(music.musicSessionUserId);

  const [currentPath, setCurrentPath] = useState(() => {
    return typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handleLocationChange);
    const interval = setInterval(handleLocationChange, 250);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, []);

  const isMusicPage = currentPath === '/music' || currentPath.startsWith('/music');

  // Render only when a track is actively loaded
  const shouldRender = Boolean(music.currentTrack);

  if (!shouldRender) return null;

  return <PremiumBottomPlayer isLiked={isLiked} onToggleLike={toggleLike} />;
}
