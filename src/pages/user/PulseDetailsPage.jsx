import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../../components/layout/AppHeader.jsx';
import { DesktopSidebar } from '../../components/layout/DesktopSidebar.jsx';
import { MobileNavigation } from '../../components/layout/MobileNavigation.jsx';
import { PulseArticleHeader } from '../../components/pulse/PulseArticleHeader.jsx';
import { PulseArticleHero } from '../../components/pulse/PulseArticleHero.jsx';
import { PulseArticleBody } from '../../components/pulse/PulseArticleBody.jsx';
import { PulseArticleDiscussion } from '../../components/pulse/PulseArticleDiscussion.jsx';
import { PulseImageLightbox } from '../../components/pulse/PulseImageLightbox.jsx';
import { apiPulseService } from '../../services/apiPulseService.js';
import { apiCommentService } from '../../services/apiCommentService.js';
import { mapComment } from '../../services/apiMappers.js';
import { moderationCheck } from '../../utils/moderationCheck.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage, getLanguageCode } from '../../context/LanguageContext.jsx';
import { getMediaUrl } from '../../config/env.js';
import { Loader2, AlertCircle, ArrowLeft, MessageSquare, X } from 'lucide-react';

export function PulseDetailsPage({ pulseId, onNavigate }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { currentLanguage } = useLanguage();
  const queryClient = useQueryClient();

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isMobileDiscussionOpen, setIsMobileDiscussionOpen] = useState(false);

  // 1. Fetch Pulse Item Details
  const pulseQuery = useQuery({
    queryKey: ['pulse-detail', pulseId],
    queryFn: async () => {
      return await apiPulseService.getPulseItemById(pulseId);
    },
    enabled: Boolean(pulseId),
    staleTime: 30000,
  });

  const pulseItem = pulseQuery.data;

  // 2. Fetch Pulse Comments
  const commentsQuery = useQuery({
    queryKey: ['pulse-comments', pulseId],
    queryFn: async () => {
      const response = await apiPulseService.getPulseComments(pulseId, { size: 50 });
      const raw = response.content || response.data || response || [];
      return Array.isArray(raw) ? raw.map(mapComment) : [];
    },
    enabled: Boolean(pulseId),
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const comments = commentsQuery.data || [];


  // Scroll to discussion section and focus comment input (or open mobile drawer)
  const handleScrollToDiscussion = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileDiscussionOpen(true);
      return;
    }
    const input = document.getElementById('pulse-comment-input');
    if (input) {
      input.focus();
    }
  };

  // Submit comment directly to Pulse item
  const handleCreateComment = async (text, imageUrl = null) => {
    if (!currentUser) {
      addToast('Please log in to join the discussion.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }
    try {
      const langCode = getLanguageCode ? getLanguageCode(currentLanguage) : 'EN';
      const raw = await apiPulseService.createPulseComment(pulseId, text, langCode, imageUrl);
      const created = mapComment(raw) || raw;

      // Reconcile query cache with new comment at the very top (index 0)
      queryClient.setQueryData(['pulse-comments', pulseId], (oldData = []) => {
        const isPageObj = oldData && typeof oldData === 'object' && Array.isArray(oldData.content);
        const list = isPageObj ? oldData.content : (Array.isArray(oldData) ? oldData : []);
        const filtered = list.filter((c) => String(c.id) !== String(created.id));
        const updated = [created, ...filtered];
        return isPageObj ? { ...oldData, content: updated } : updated;
      });

      // Synchronize pulse detail headline count
      queryClient.setQueryData(['pulse-detail', pulseId], (old) => {
        if (!old) return old;
        const currentCount = Number(old.commentCount || old.discussionCount || 0);
        return {
          ...old,
          commentCount: currentCount + 1,
          discussionCount: currentCount + 1,
        };
      });

      addToast('Perspective posted to discussion!', 'success');
      return created;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to post comment';
      addToast(msg, 'error');
      throw err;
    }
  };

  // Instant optimistic reply handling for comment threads (tested & required)
  const handleReplySubmit = async (commentId, replyText) => {
    if (!currentUser) {
      addToast('Please log in to reply to comments.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }

    const trimmed = (replyText || '').trim();
    if (trimmed.length < 2) {
      addToast('Reply must be at least 2 characters.', 'error');
      return;
    }

    const modCheck = moderationCheck(trimmed);
    if (modCheck && modCheck.status === 'BLOCKED') {
      addToast(modCheck.message || 'Your reply contains restricted content.', 'error');
      throw new Error('Moderation blocked');
    }

    // 1. Collision-safe temporary ID for optimistic reply
    const tempReplyId = `temp_reply_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const currentUserId = currentUser.id || currentUser.userId;
    const optimisticReply = {
      id: tempReplyId,
      parentCommentId: commentId,
      pulseItemId: Number(pulseId),
      authorId: currentUserId,
      userId: currentUserId,
      username: currentUser.username ? (currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`) : '@you',
      authorUsername: currentUser.username ? (currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`) : '@you',
      authorAvatar: currentUser.avatar || 'avatar_default',
      avatarInitials: currentUser.avatarInitials || (currentUser.fullName || currentUser.name || 'You').slice(0, 2).toUpperCase(),
      originalContent: trimmed,
      content: trimmed,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      likedByCurrentUser: false,
      reactions: {},
      isOptimistic: true,
      status: 'SENDING',
    };

    // 2. Instantly update React Query cache (< 10ms click-to-visible)
    queryClient.setQueryData(['pulse-comments', pulseId], (oldData = []) => {
      const list = Array.isArray(oldData) ? oldData : (oldData?.content || []);
      return list.map((c) => {
        if (String(c.id) === String(commentId)) {
          const existingReplies = c.replies || [];
          if (existingReplies.some((r) => r.id === tempReplyId)) return c;
          return {
            ...c,
            replies: [...existingReplies, optimisticReply],
          };
        }
        return c;
      });
    });

    // 3. Dispatch network request in background
    try {
      const langCode = getLanguageCode ? getLanguageCode(currentLanguage) : 'EN';
      const response = await apiCommentService.replyToComment(commentId, trimmed, langCode);
      const rawServerReply = response?.data || response;
      const serverReply = mapComment(rawServerReply) || rawServerReply;

      // 4. Smoothly reconcile: replace temp ID with server confirmed reply
      queryClient.setQueryData(['pulse-comments', pulseId], (oldData = []) => {
        const list = Array.isArray(oldData) ? oldData : (oldData?.content || []);
        return list.map((c) => {
          if (String(c.id) === String(commentId)) {
            const existingReplies = c.replies || [];
            const reconciled = existingReplies.map((r) => {
              if (r.id === tempReplyId) {
                return {
                  ...r,
                  ...serverReply,
                  id: serverReply.id || r.id,
                  isOptimistic: false,
                  status: 'ACTIVE',
                };
              }
              return r;
            });
            const seen = new Set();
            const deduped = reconciled.filter((r) => {
              if (seen.has(r.id)) return false;
              seen.add(r.id);
              return true;
            });
            return { ...c, replies: deduped };
          }
          return c;
        });
      });

      addToast('Reply published!', 'success');
      return serverReply;
    } catch (err) {
      // 5. Rollback on failure and report error
      queryClient.setQueryData(['pulse-comments', pulseId], (oldData = []) => {
        const list = Array.isArray(oldData) ? oldData : (oldData?.content || []);
        return list.map((c) => {
          if (String(c.id) === String(commentId)) {
            return {
              ...c,
              replies: (c.replies || []).filter((r) => r.id !== tempReplyId),
            };
          }
          return c;
        });
      });

      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to post reply. Please try again.';
      addToast(errorMsg, 'error');
      throw err;
    }
  };

  // Handle editing a comment or reply (authenticated ownership enforced)
  const handleUpdateComment = async (commentId, updatedText) => {
    if (!currentUser) {
      addToast('Please log in to edit discussions.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }

    const trimmed = (updatedText || '').trim();
    if (!trimmed) {
      addToast('Comment content cannot be empty.', 'error');
      throw new Error('Comment content cannot be empty');
    }

    const modCheck = moderationCheck(trimmed);
    if (modCheck && modCheck.status === 'BLOCKED') {
      addToast(modCheck.message || 'Your comment contains restricted content.', 'error');
      throw new Error('Moderation blocked');
    }

    try {
      const res = await apiCommentService.updateComment(commentId, trimmed);
      const updatedData = res?.data || res;
      const finalContent = updatedData?.originalContent || updatedData?.content || trimmed;

      queryClient.setQueryData(['pulse-comments', pulseId], (oldData = []) => {
        const list = Array.isArray(oldData) ? oldData : (oldData?.content || []);
        return list.map((c) => {
          if (String(c.id) === String(commentId)) {
            return {
              ...c,
              content: finalContent,
              originalContent: finalContent,
            };
          }
          if (Array.isArray(c.replies)) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                String(r.id) === String(commentId)
                  ? { ...r, content: finalContent, originalContent: finalContent }
                  : r
              ),
            };
          }
          return c;
        });
      });

      addToast('Updated successfully', 'success');
      return res;
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || 'Failed to update comment';
      addToast(msg, 'error');
      throw err;
    }
  };

  // Handle deleting a comment or reply (immediate optimistic removal with rollback)
  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    if (!currentUser) {
      addToast('Please log in to delete discussions.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }

    // 1. Snapshot previous state for rollback on API failure
    const previousComments = queryClient.getQueryData(['pulse-comments', pulseId]);
    const previousDetail = queryClient.getQueryData(['pulse-detail', pulseId]);

    // 2. Optimistically remove the comment or reply from visible list
    queryClient.setQueryData(['pulse-comments', pulseId], (oldData = []) => {
      const isPageObj = oldData && typeof oldData === 'object' && Array.isArray(oldData.content);
      const list = isPageObj ? oldData.content : (Array.isArray(oldData) ? oldData : []);

      let updatedList;
      if (isReply || parentId) {
        updatedList = list.map((c) => {
          if (parentId && String(c.id) !== String(parentId)) {
            return c;
          }
          return {
            ...c,
            replies: (c.replies || []).filter((r) => String(r.id) !== String(commentId)),
          };
        });
      } else {
        updatedList = list.filter((c) => String(c.id) !== String(commentId));
      }

      return isPageObj ? { ...oldData, content: updatedList } : updatedList;
    });

    // 3. Optimistically synchronize headline comment count
    queryClient.setQueryData(['pulse-detail', pulseId], (old) => {
      if (!old) return old;
      const currentCount = Number(old.commentCount || old.discussionCount || 0);
      const newCount = Math.max(0, currentCount - 1);
      return {
        ...old,
        commentCount: newCount,
        discussionCount: newCount,
      };
    });

    // 4. Send request through the existing delete API
    try {
      await apiCommentService.deleteComment(commentId);
      addToast(isReply ? 'Reply deleted' : 'Comment deleted', 'success');
      // Synchronize comment counts and cached data with server
      queryClient.invalidateQueries({ queryKey: ['pulse-detail', pulseId] });
    } catch (err) {
      // 5. On failure, restore the comment and show a concise error toast
      queryClient.setQueryData(['pulse-comments', pulseId], previousComments);
      queryClient.setQueryData(['pulse-detail', pulseId], previousDetail);

      const msg = err?.response?.data?.message || err?.message || 'Failed to delete. Please try again.';
      addToast(msg, 'error');
      throw err;
    }
  };

  // Loading State
  if (pulseQuery.isLoading) {
    return (
      <div className="pulse-dashboard-root">
        <AppHeader onNavigate={onNavigate} />
        <div className="pulse-desktop-grid">
          <DesktopSidebar activeRoute="/pulse" onNavigate={onNavigate} />
          <main className="pulse-article-center-stream">
            <div className="pulse-details-loading-state">
              <Loader2 size={36} className="spin-animation" color="#C4005D" />
              <span>Loading Awaaj Pulse story...</span>
            </div>
          </main>
          <div className="pulse-article-right-sidebar" />
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (pulseQuery.isError || !pulseItem) {
    return (
      <div className="pulse-dashboard-root">
        <AppHeader onNavigate={onNavigate} />
        <div className="pulse-desktop-grid">
          <DesktopSidebar activeRoute="/pulse" onNavigate={onNavigate} />
          <main className="pulse-article-center-stream">
            <div className="pulse-details-error-state">
              <AlertCircle size={44} color="#C4005D" />
              <h2>Story Unavailable</h2>
              <p>This news article may have been updated or is currently unpublished.</p>
              <button
                type="button"
                className="pulse-return-feed-btn"
                onClick={() => onNavigate('/pulse')}
              >
                <ArrowLeft size={16} />
                <span>Return to Pulse Feed</span>
              </button>
            </div>
          </main>
          <div className="pulse-article-right-sidebar" />
        </div>
      </div>
    );
  }

  return (
    <div className="pulse-dashboard-root pulse-article-detail-page">
      {/* ── TOP APPLICATION HEADER ── */}
      <AppHeader onNavigate={onNavigate} />

      {/* ── THREE-COLUMN DESKTOP GRID ── */}
      <div className="pulse-desktop-grid pulse-article-detail-grid">
        {/* Column 1: Left Navigation & Promo Sidebar */}
        <DesktopSidebar
          activeRoute="/pulse"
          onNavigate={onNavigate}
        />

        {/* Column 2: Central Editorial Article Reading Stream */}
        <main className="pulse-article-center-stream" id="pulse-main-content" tabIndex={0}>
          <article className="pulse-article-container">
            {/* A. Editorial Header (Breadcrumbs, Category, Title, Summary, Meta Bar) */}
            <PulseArticleHeader
              article={pulseItem}
              commentCount={comments.length}
              onNavigate={onNavigate}
              onJoinDiscussion={handleScrollToDiscussion}
            />

            {/* B. Featured Hero Image with Carousel Counter & Lightbox */}
            <PulseArticleHero
              article={pulseItem}
              onExpandImage={() => setIsLightboxOpen(true)}
            />

            {/* C. Formatted Article Body with Pull Quote & Source Link */}
            <PulseArticleBody
              article={pulseItem}
            />
          </article>
        </main>

        {/* Column 3: Dedicated Right Discussion Panel */}
        <PulseArticleDiscussion
          pulseItemId={pulseItem.id}
          comments={comments}
          isLoading={commentsQuery.isLoading}
          onCreateComment={handleCreateComment}
          onReplySubmit={handleReplySubmit}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          onNavigate={onNavigate}
        />
      </div>

      {/* Mobile Floating Sticky Discussion Trigger Button */}
      <div className="pulse-mobile-discussion-bar">
        <button
          type="button"
          className="pulse-mobile-open-discussion-btn"
          onClick={() => setIsMobileDiscussionOpen(true)}
        >
          <MessageSquare size={18} />
          <span>Discussion ({comments.length})</span>
        </button>
      </div>

      {/* Mobile Discussion Drawer Modal */}
      {isMobileDiscussionOpen && (
        <div
          className="pulse-mobile-discussion-drawer-overlay"
          onClick={() => setIsMobileDiscussionOpen(false)}
        >
          <div
            className="pulse-mobile-discussion-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pulse-mobile-drawer-handle-bar">
              <span className="pulse-mobile-drawer-handle" />
              <button
                type="button"
                className="pulse-mobile-drawer-close-btn"
                onClick={() => setIsMobileDiscussionOpen(false)}
                aria-label="Close discussion drawer"
              >
                <X size={20} />
              </button>
            </div>
            <PulseArticleDiscussion
              pulseItemId={pulseItem.id}
              comments={comments}
              isLoading={commentsQuery.isLoading}
              onCreateComment={handleCreateComment}
              onReplySubmit={handleReplySubmit}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation bar */}
      <MobileNavigation activeRoute="/pulse" onNavigate={onNavigate} />

      {/* Image Lightbox Modal */}
      <PulseImageLightbox
        isOpen={isLightboxOpen}
        imageUrl={pulseItem.imageUrl ? getMediaUrl(pulseItem.imageUrl) : null}
        altText={pulseItem.title}
        caption={pulseItem.caption || pulseItem.title}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
}
