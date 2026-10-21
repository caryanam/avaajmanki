import { useState, useEffect, useCallback } from 'react';

export function useLikedSongs(userId) {
  const storageKey = `mka_liked_songs_${userId || 'guest'}`;

  const [likedIds, setLikedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setLikedIds(stored ? new Set(JSON.parse(stored)) : new Set());
    } catch {
      setLikedIds(new Set());
    }
  }, [storageKey]);

  const toggleLike = useCallback((trackId) => {
    if (!trackId) return;
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch (err) {
        console.warn('Could not save liked song to localStorage:', err);
      }
      return next;
    });
  }, [storageKey]);

  const isLiked = useCallback((trackId) => {
    return likedIds.has(trackId);
  }, [likedIds]);

  return { isLiked, toggleLike, likedCount: likedIds.size };
}
