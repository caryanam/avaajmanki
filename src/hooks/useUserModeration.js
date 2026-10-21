import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiUserService } from '../services/apiUserService.js';
import { apiProfileService } from '../services/apiProfileService.js';
import { useAuth } from '../context/AuthContext.jsx';

export const USER_MODERATION_KEYS = {
  muted: ['users', 'muted'],
  blocked: ['users', 'blocked'],
  hiddenPosts: ['users', 'hidden-posts'],
  myProfile: ['profile', 'me'],
};

/**
 * Shared TanStack Query hook for muted user handles.
 * Caches list for 5 minutes, enables only when authenticated,
 * and provides O(1) Set lookup.
 */
export function useMutedUsers() {
  const { currentUser } = useAuth();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isAuthenticated = Boolean(currentUser && token && !token.startsWith('mock'));
  const userId = currentUser?.id || currentUser?.userId || 'me';

  const query = useQuery({
    queryKey: [...USER_MODERATION_KEYS.muted, userId],
    queryFn: async () => {
      const res = await apiUserService.getMutedUsers();
      const raw = res?.data || res || [];
      const list = Array.isArray(raw) ? raw : [];
      const formatted = [];
      list.forEach((u) => {
        if (!u) return;
        const clean = String(u).replace(/^@/, '').trim();
        if (clean) formatted.push(clean, `@${clean}`);
      });
      return [...new Set(formatted)];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const mutedUsers = useMemo(() => query.data || [], [query.data]);

  const mutedSet = useMemo(() => {
    const set = new Set();
    mutedUsers.forEach((u) => {
      const clean = String(u).toLowerCase().replace(/^@/, '').trim();
      if (clean) {
        set.add(clean);
        set.add(`@${clean}`);
      }
    });
    return set;
  }, [mutedUsers]);

  const isMuted = useCallback((user) => {
    if (!user) return false;
    const clean = String(typeof user === 'object' ? (user.username || user.authorUsername || user.handle || user.id) : user).toLowerCase().replace(/^@/, '').trim();
    return mutedSet.has(clean);
  }, [mutedSet]);

  return {
    ...query,
    mutedUsers,
    mutedSet,
    isMuted,
  };
}

/**
 * Shared TanStack Query hook for blocked user handles.
 * Caches list for 5 minutes, enables only when authenticated,
 * and provides O(1) Set lookup.
 */
export function useBlockedUsers() {
  const { currentUser } = useAuth();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isAuthenticated = Boolean(currentUser && token && !token.startsWith('mock'));
  const userId = currentUser?.id || currentUser?.userId || 'me';

  const query = useQuery({
    queryKey: [...USER_MODERATION_KEYS.blocked, userId],
    queryFn: async () => {
      const res = await apiUserService.getBlockedUsers();
      const raw = res?.data || res || [];
      const list = Array.isArray(raw) ? raw : [];
      const formatted = [];
      list.forEach((u) => {
        if (!u) return;
        const clean = String(u).replace(/^@/, '').trim();
        if (clean) formatted.push(clean, `@${clean}`);
      });
      return [...new Set(formatted)];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const blockedUsers = useMemo(() => query.data || [], [query.data]);

  const blockedSet = useMemo(() => {
    const set = new Set();
    blockedUsers.forEach((u) => {
      const clean = String(u).toLowerCase().replace(/^@/, '').trim();
      if (clean) {
        set.add(clean);
        set.add(`@${clean}`);
      }
    });
    return set;
  }, [blockedUsers]);

  const isBlocked = useCallback((user) => {
    if (!user) return false;
    const clean = String(typeof user === 'object' ? (user.username || user.authorUsername || user.handle || user.id) : user).toLowerCase().replace(/^@/, '').trim();
    return blockedSet.has(clean);
  }, [blockedSet]);

  return {
    ...query,
    blockedUsers,
    blockedSet,
    isBlocked,
  };
}

/**
 * Shared TanStack Query hook for hidden posts.
 * Caches list for 5 minutes, enables only when authenticated,
 * and provides O(1) Set lookup.
 */
export function useHiddenPosts() {
  const { currentUser } = useAuth();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isAuthenticated = Boolean(currentUser && token && !token.startsWith('mock'));
  const userId = currentUser?.id || currentUser?.userId || 'me';

  const query = useQuery({
    queryKey: [...USER_MODERATION_KEYS.hiddenPosts, userId],
    queryFn: async () => {
      const res = await apiUserService.getHiddenPosts();
      const list = res?.data || res || [];
      if (!Array.isArray(list)) return [];
      return list.map((item) => ({
        id: item.postId || item.id,
        title: item.postTitle || item.title || `Thought #${item.postId || item.id}`,
        content: item.postTitle || item.content || '',
        username: item.authorUsername || item.username || '@anonymous',
        hiddenAt: item.createdAt || new Date().toISOString(),
      }));
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const hiddenPosts = useMemo(() => query.data || [], [query.data]);

  const hiddenSet = useMemo(() => {
    const set = new Set();
    hiddenPosts.forEach((item) => {
      const id = typeof item === 'object' ? (item.id || item.postId) : item;
      if (id != null) set.add(String(id));
    });
    return set;
  }, [hiddenPosts]);

  const isHidden = useCallback((postId) => {
    if (postId == null) return false;
    return hiddenSet.has(String(postId));
  }, [hiddenSet]);

  return {
    ...query,
    hiddenPosts,
    hiddenSet,
    isHidden,
  };
}

/**
 * Shared TanStack Query hook for current user profile (/api/profile/me).
 * Caches profile for 5 minutes, enables only when authenticated.
 */
export function useMyProfile() {
  const { currentUser } = useAuth();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isAuthenticated = Boolean(currentUser && token && !token.startsWith('mock'));
  const userId = currentUser?.id || currentUser?.userId || 'me';

  const query = useQuery({
    queryKey: [...USER_MODERATION_KEYS.myProfile, userId],
    queryFn: async () => {
      const res = await apiProfileService.getMyProfile();
      return res?.data || res || null;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    ...query,
    profile: query.data,
  };
}
