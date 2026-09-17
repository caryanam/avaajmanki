import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiCommentService } from '../services/apiCommentService.js';
import { mapComment } from '../services/apiMappers.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CommentContext = createContext(null);

export function CommentProvider({ children }) {
  const [commentsByPost, setCommentsByPost] = useState({});
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const activePostIdsRef = React.useRef(new Set());

  const fetchComments = useCallback(async (postId) => {
    if (!postId) return [];
    const pStr = String(postId);
    if (pStr.startsWith('TOPIC_OPINION_') || isNaN(Number(postId))) {
      return [];
    }
    const pNum = Number(postId);
    activePostIdsRef.current.add(pStr);
    try {
      const response = await apiCommentService.getCommentsByPostId(postId);
      const raw = response.data?.content || response.data || [];
      const data = Array.isArray(raw) ? raw.map(mapComment) : [];
      
      setCommentsByPost((prev) => {
        const currentList = prev[pStr] || prev[pNum] || [];
        // Prevent flashing blank if backend transiently returns empty on populated post
        if (data.length === 0 && currentList.length > 0) {
          return prev;
        }
        return { ...prev, [pStr]: data, [pNum]: data };
      });
      return data;
    } catch (e) {
      // Keep existing comments on error
      return [];
    }
  }, []);

  // Automatic real-time background sync via TanStack Query standards (3-second interval)
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const activeIds = Array.from(activePostIdsRef.current);
      if (activeIds.length === 0) return;

      for (const pId of activeIds) {
        try {
          const response = await apiCommentService.getCommentsByPostId(pId);
          const raw = response.data?.content || response.data || [];
          const freshComments = Array.isArray(raw) ? raw.map(mapComment) : [];

          setCommentsByPost((prev) => {
            const currentList = prev[pId] || prev[Number(pId)] || [];
            if (freshComments.length === 0 && currentList.length > 0) {
              return prev;
            }
            // Only update state if comments or replies have changed
            if (JSON.stringify(currentList) !== JSON.stringify(freshComments)) {
              return { ...prev, [pId]: freshComments, [Number(pId)]: freshComments };
            }
            return prev;
          });
        } catch (err) {
          // Keep current state on error
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);


  const createComment = async (postId, content, postAuthorUsername) => {
    if (!currentUser) throw new Error('You must be logged in to comment.');
    if (currentUser.status === 'COMMENT_RESTRICTED') {
      throw new Error(`Commenting restricted: ${currentUser.restrictionReason || 'Account restricted.'}`);
    }

    // 0ms Instant Optimistic Comment Insertion
    const tempId = `temp_comment_${Date.now()}`;
    const optimisticComment = mapComment({
      id: tempId,
      postId,
      username: currentUser?.username || '@me',
      avatarInitials: currentUser?.avatarInitials || 'AN',
      content,
      originalContent: content,
      createdAt: new Date().toISOString(),
      reactions: {},
      userReaction: null,
      replies: [],
    });

    setCommentsByPost((prev) => {
      const existing = prev[postId] || [];
      return { ...prev, [postId]: [optimisticComment, ...existing] };
    });

    try {
      const response = await apiCommentService.createComment(postId, content);
      const serverComment = mapComment(response.data || response);

      setCommentsByPost((prev) => {
        const existing = prev[postId] || [];
        const filtered = existing.filter(c => c.id !== tempId && c.id !== serverComment.id);
        return { ...prev, [postId]: [serverComment, ...filtered] };
      });

      // Comments state updated directly without triggering posts API

      // Notify post author if commenting on someone else's post
      if (postAuthorUsername && currentUser.username) {
        const actorHandle = currentUser.username.trim().replace(/\s+/g, '');
        const cleanActor = actorHandle.startsWith('@') ? actorHandle : `@${actorHandle}`;
        const cleanAuthor = postAuthorUsername.trim().replace(/\s+/g, '').replace('@', '');
        
        if (cleanAuthor.toLowerCase() !== cleanActor.replace('@', '').toLowerCase()) {
          try {
            const { mockNotificationService } = await import('../services/mockNotificationService.js');
            mockNotificationService.addNotification({
              userId: cleanAuthor,
              type: 'COMMENT',
              actorUsername: cleanActor,
              actorInitials: cleanActor.replace('@', '').slice(0, 2).toUpperCase(),
              message: `${cleanActor} commented on your post`,
              targetPostId: postId,
            });
          } catch (e) {}
        }
      }

      addToast('Comment published!', 'success');
      return { comment: serverComment };
    } catch (err) {
      setCommentsByPost((prev) => {
        const existing = prev[postId] || [];
        return { ...prev, [postId]: existing.filter(c => c.id !== tempId) };
      });
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to post comment';
      addToast(errorMsg, 'error');
      throw err;
    }
  };

  const createReply = async (commentId, postId, content, commentAuthorUsername) => {
    if (!currentUser) throw new Error('You must be logged in to reply.');

    // 0ms Instant Optimistic Reply Insertion
    const tempReplyId = `temp_reply_${Date.now()}`;
    const optimisticReply = mapComment({
      id: tempReplyId,
      commentId,
      postId,
      username: currentUser?.username || '@me',
      avatarInitials: currentUser?.avatarInitials || 'AN',
      content,
      originalContent: content,
      createdAt: new Date().toISOString(),
      reactions: {},
    });

    setCommentsByPost((prev) => {
      const existingComments = prev[postId] || [];
      const updated = existingComments.map((c) => {
        if (String(c.id) === String(commentId)) {
          const currentReplies = c.replies || [];
          return { ...c, replies: [...currentReplies, optimisticReply] };
        }
        return c;
      });
      return { ...prev, [postId]: updated };
    });

    try {
      const response = await apiCommentService.replyToComment ? await apiCommentService.replyToComment(commentId, content) : await apiCommentService.createComment(postId, content);
      const serverReply = mapComment(response.data || response);

      setCommentsByPost((prev) => {
        const existingComments = prev[postId] || [];
        const updated = existingComments.map((c) => {
          if (String(c.id) === String(commentId)) {
            const currentReplies = (c.replies || []).filter(r => r.id !== tempReplyId && r.id !== serverReply.id);
            return { ...c, replies: [...currentReplies, serverReply] };
          }
          return c;
        });
        return { ...prev, [postId]: updated };
      });

      if (commentAuthorUsername && currentUser.username) {
        const actorHandle = currentUser.username.trim().replace(/\s+/g, '');
        const cleanActor = actorHandle.startsWith('@') ? actorHandle : `@${actorHandle}`;
        const cleanAuthor = commentAuthorUsername.trim().replace(/\s+/g, '').replace('@', '');

        if (cleanAuthor.toLowerCase() !== cleanActor.replace('@', '').toLowerCase()) {
          try {
            const { mockNotificationService } = await import('../services/mockNotificationService.js');
            mockNotificationService.addNotification({
              userId: cleanAuthor,
              type: 'REPLY',
              actorUsername: cleanActor,
              actorInitials: cleanActor.replace('@', '').slice(0, 2).toUpperCase(),
              message: `${cleanActor} replied to your comment`,
              targetPostId: postId,
            });
          } catch (e) {}
        }
      }

      addToast('Reply published!', 'success');
      return { reply: serverReply };
    } catch (err) {
      setCommentsByPost((prev) => {
        const existingComments = prev[postId] || [];
        const updated = existingComments.map((c) => {
          if (String(c.id) === String(commentId)) {
            return { ...c, replies: (c.replies || []).filter(r => r.id !== tempReplyId) };
          }
          return c;
        });
        return { ...prev, [postId]: updated };
      });
      addToast(err.message || 'Failed to post reply', 'error');
      throw err;
    }
  };


  const updateComment = async (commentId, postId, newContent) => {
    try {
      const response = await apiCommentService.updateComment(commentId, newContent);
      const comment = mapComment(response.data || response);
      await fetchComments(postId);
      addToast('Comment updated in database.', 'info');
      return { comment };
    } catch (err) {
      addToast(err.message || 'Failed to update comment.', 'error');
      throw err;
    }
  };

  const deleteComment = async (commentId, postId) => {
    try {
      await apiCommentService.deleteComment(commentId);
    } catch (e) {
      console.warn('[CommentContext] Delete comment notice:', e);
    }
    await fetchComments(postId);
    addToast('Comment deleted from database.', 'info');
  };

  const reactToComment = async (commentId, emoji, remove = false) => {
    try {
      if (remove) await apiCommentService.unlikeComment(commentId);
      else await apiCommentService.likeComment(commentId);
    } catch (e) {
      console.warn('[CommentContext] Reaction notice:', e);
    }
  };

  return (
    <CommentContext.Provider value={{
      commentsByPost,
      fetchComments,
      createComment,
      createReply,
      updateComment,
      deleteComment,
      reactToComment,
    }}>
      {children}
    </CommentContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentContext);
  if (!context) throw new Error('useComments must be used within CommentProvider');
  return context;
}
