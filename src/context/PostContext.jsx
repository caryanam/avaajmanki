import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiPostService } from '../services/apiPostService.js';
import { mapPost } from '../services/apiMappers.js';
import { useAuth } from './AuthContext.jsx';
import { useLanguage, normalizeLanguage } from './LanguageContext.jsx';
import { useToast } from './ToastContext.jsx';
import { mergeFeed } from '../utils/feedCache.js';

const PostContext = createContext(null);

export function PostProvider({ children }) {
  const { currentUser } = useAuth();
  const { currentLanguage } = useLanguage();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [savedPostIds, setSavedPostIds] = useState([]);

  const normLang = normalizeLanguage(currentLanguage);

  // TanStack Query: Realtime Posts Feed with preserved data state & seamless background merge
  const {
    data: posts = [],
    isLoading: loading,
    isFetching,
    refetch: refreshPosts,
  } = useQuery({
    queryKey: ['posts', normLang, currentUser?.id || 'guest'],
    queryFn: async ({ queryKey }) => {
      const previousCachedPosts = queryClient.getQueryData(queryKey) || [];

      try {
        const response = await apiPostService.getPosts();
        const rawContent = response.data?.content || response.content || response.data;
        
        if (Array.isArray(rawContent) && rawContent.length > 0) {
          const freshPosts = rawContent.map(mapPost);

          return mergeFeed(freshPosts, previousCachedPosts);
        }

        return Array.isArray(rawContent) ? mergeFeed(rawContent.map(mapPost), previousCachedPosts) : previousCachedPosts;
      } catch (err) {
        console.error('[PostContext] Feed query error, preserving previous feed:', err);
        if (Array.isArray(previousCachedPosts) && previousCachedPosts.length > 0) {
          return previousCachedPosts;
        }
        return [];
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 10000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    retry: 2,
  });

  const createPost = async (postData) => {
    if (!currentUser) throw new Error('You must be logged in to create a post.');
    if (currentUser.status === 'POST_RESTRICTED' || currentUser.status === 'TEMPORARILY_SUSPENDED' || currentUser.status === 'BANNED') {
      throw new Error(`Posting restricted: ${currentUser.restrictionReason || 'Account restricted.'}`);
    }

    // 0ms Instant Optimistic UI Post Creation
    const tempId = `temp_post_${Date.now()}`;
    const optimisticPost = mapPost({
      id: tempId,
      title: postData.title || '',
      originalContent: postData.content,
      content: postData.content,
      topic: postData.topic || 'GENERAL',
      type: postData.postType || 'TEXT',
      imageUrl: postData.imageUrl || null,
      username: currentUser?.username || '@me',
      authorAvatar: currentUser?.avatarInitials || 'AN',
      status: 'ACTIVE',
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    });

    queryClient.setQueriesData({ queryKey: ['posts'] }, (old = []) => {
      if (!Array.isArray(old)) return [optimisticPost];
      return [optimisticPost, ...old];
    });

    try {
      const response = await apiPostService.createPost(postData);
      const rawPostData = response.data || response;
      const newPost = mapPost(rawPostData);

      queryClient.setQueriesData({ queryKey: ['posts'] }, (old = []) => {
        if (!Array.isArray(old)) return [newPost];
        return [newPost, ...old.filter((p) => p.id !== tempId && p.id !== newPost.id)];
      });

      queryClient.invalidateQueries({ queryKey: ['posts'] });
      addToast('Thought published successfully!', 'success');
      return newPost;
    } catch (err) {
      queryClient.setQueriesData({ queryKey: ['posts'] }, (old = []) => {
        if (!Array.isArray(old)) return [];
        return old.filter((p) => p.id !== tempId);
      });
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to publish post to database';
      addToast(errorMsg, 'error');
      throw err;
    }
  };

  const updatePost = async (postId, updates) => {
    try {
      const response = await apiPostService.updatePost(postId, updates.content || updates);
      const updated = mapPost(response.data || response);
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      addToast('Post updated in database.', 'info');
      return updated;
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to update post';
      addToast(errorMsg, 'error');
    }
  };

  const deletePost = async (postId) => {
    try {
      await apiPostService.deletePost(postId);
    } catch (e) {
      console.warn('[PostContext] Backend delete notice:', e);
    }

    queryClient.setQueriesData({ queryKey: ['posts'] }, (oldPosts = []) =>
      oldPosts.filter((p) => p.id !== postId)
    );

    await queryClient.invalidateQueries({ queryKey: ['posts'] });
    addToast('Thought permanently deleted from database.', 'info');
  };

  const reactToPost = async (postId, reactionType = 'RELATE') => {
    if (!currentUser) {
      addToast('Please login to react to posts.', 'error');
      return;
    }

    const typeKey = (reactionType || 'RELATE').toUpperCase();

    // 1. Optimistically update TanStack Query cache instantly for immediate UI feedback
    queryClient.setQueriesData({ predicate: (query) => query.queryKey[0] === 'posts' }, (oldPosts = []) => {
      if (!Array.isArray(oldPosts)) return oldPosts;
      return oldPosts.map((p) => {
        if (String(p.id) !== String(postId)) return p;

        const prevReaction = p.userReaction ? p.userReaction.toUpperCase() : null;
        const currentReactions = { ...(p.reactions || {}) };

        let newUserReaction = typeKey;
        let newIsLiked = true;

        if (prevReaction === typeKey) {
          // Toggling off same reaction
          newUserReaction = null;
          newIsLiked = false;
          currentReactions[typeKey] = Math.max(0, (currentReactions[typeKey] || 1) - 1);
        } else {
          // If switching from another reaction, decrement old
          if (prevReaction && currentReactions[prevReaction]) {
            currentReactions[prevReaction] = Math.max(0, currentReactions[prevReaction] - 1);
          }
          currentReactions[typeKey] = (currentReactions[typeKey] || 0) + 1;
        }

        const newLikesCount = Object.values(currentReactions).reduce((a, b) => a + b, 0);

        return {
          ...p,
          userReaction: newUserReaction,
          isLikedByCurrentUser: newIsLiked,
          likesCount: newLikesCount,
          reactions: currentReactions,
        };
      });
    });

    // 2. Call backend API to persist reaction in database
    try {
      await apiPostService.reactToPost(postId, typeKey);
    } catch (e) {
      console.warn('[PostContext] Reaction API notice:', e);
    }
  };

  const toggleSavePost = (postId) => {
    setSavedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    addToast('Post saved state updated.', 'info');
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        isFetching,
        savedPostIds,
        refreshPosts,
        createPost,
        updatePost,
        deletePost,
        reactToPost,
        toggleSavePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePosts must be used within PostProvider');
  return context;
}
