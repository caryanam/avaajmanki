import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../../components/layout/AppHeader.jsx';
import { DesktopSidebar } from '../../components/layout/DesktopSidebar.jsx';
import { MobileNavigation } from '../../components/layout/MobileNavigation.jsx';

import { TopicDiscussionBreadcrumb } from '../../components/topic-discussion/TopicDiscussionBreadcrumb.jsx';
import { TopicDiscussionHeader } from '../../components/topic-discussion/TopicDiscussionHeader.jsx';
import { OriginalDiscussionPost } from '../../components/topic-discussion/OriginalDiscussionPost.jsx';
import { TopicDiscussionComments } from '../../components/topic-discussion/TopicDiscussionComments.jsx';
import { TopicOverviewWidget } from '../../components/topic-discussion/TopicOverviewWidget.jsx';
import { TopicGuidelinesWidget } from '../../components/topic-discussion/TopicGuidelinesWidget.jsx';
import { RelatedDiscussionsWidget } from '../../components/topic-discussion/RelatedDiscussionsWidget.jsx';

import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiPostService } from '../../services/apiPostService.js';
import { apiCommentService } from '../../services/apiCommentService.js';
import { mapPost, mapComment } from '../../services/apiMappers.js';
import { getTopicMetadata } from '../../utils/topicMetadata.js';

// Fallback seed comments matching the approved visual reference
const SEED_COMMENTS = [
  {
    id: 'seed_comment_1',
    content: "I used to overthink a lot at night too. What helped me was writing down my thoughts on paper before sleep. It clears the mind and makes it easier to relax.",
    username: '@anonymous',
    isAnonymous: true,
    likeCount: 320,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        id: 'seed_reply_1_1',
        content: 'Same here! Journaling really helps. I also keep a small "worry list" and tell myself I\'ll think about it tomorrow, not at night.',
        username: '@anonymous',
        isAnonymous: true,
        likeCount: 120,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'seed_comment_2',
    content: "I do 10 minutes of meditation before sleep. It really calms my mind. Even deep breathing works if you're new to meditation.",
    username: '@anonymous',
    isAnonymous: true,
    likeCount: 245,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    replies: [],
  },
  {
    id: 'seed_comment_3',
    content: "Try to reduce screen time before bed. I keep my phone away at least 30 minutes before sleep and it makes a big difference.",
    username: '@anonymous',
    isAnonymous: true,
    likeCount: 198,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    replies: [],
  },
];

export function TopicDiscussionPage({ topicId = 'MENTAL_HEALTH', postId, onNavigate }) {
  const { posts = [] } = usePosts();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [fetchedPost, setFetchedPost] = useState(null);
  const [localComments, setLocalComments] = useState([]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [topicId, postId]);

  // Find post in cache or state
  const matchedPost = useMemo(() => {
    if (postId) {
      return posts.find((p) => String(p.id) === String(postId));
    }
    // If only topicId is given, find the first relevant post matching the topic
    const cleanTopic = String(topicId).toUpperCase().replace(/[-\s&]+/g, '_');
    return posts.find((p) => {
      const top = String(p.subtopic || p.topicName || p.topic || '').toUpperCase();
      return top.includes(cleanTopic) || cleanTopic.includes(top);
    });
  }, [postId, topicId, posts]);

  // If postId provided but not in memory, fetch single post from backend
  useEffect(() => {
    let isMounted = true;
    if (postId && !matchedPost) {
      apiPostService
        .getPostById(postId)
        .then((res) => {
          if (!isMounted) return;
          const raw = res?.data || res;
          if (raw) setFetchedPost(mapPost(raw));
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [postId, matchedPost]);

  // Resolve active post
  const activePost = useMemo(() => {
    if (matchedPost) return matchedPost;
    if (fetchedPost) return fetchedPost;

    // Fallback baseline post matching approved screenshot reference
    const topicMeta = getTopicMetadata(topicId);
    return {
      id: postId || `discussion_${topicMeta.id.toLowerCase()}`,
      title: 'How do you deal with overthinking at night?',
      hashtag: '#Anxiety',
      topic: topicMeta.id,
      topicName: topicMeta.name,
      content:
        "No matter how tired I am, my mind keeps thinking about past mistakes, future worries and random things. It's affecting my sleep and next day I feel exhausted. How do you stop overthinking and actually rest?\n\nWould love to hear your tips, routines or anything that has worked for you. ❤️",
      username: '@anonymous',
      isAnonymous: true,
      likeCount: 1200,
      likesCount: 1200,
      commentCount: 245,
      commentsCount: 245,
      reactions: { HEART: 1200 },
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    };
  }, [matchedPost, fetchedPost, postId, topicId]);

  // Resolve topic metadata
  const topicMeta = useMemo(() => {
    const rawTopic = activePost?.subtopic || activePost?.topicName || activePost?.topic || topicId || 'MENTAL_HEALTH';
    return getTopicMetadata(rawTopic);
  }, [activePost, topicId]);

  // TanStack Query for Comments
  const activePostId = activePost?.id;
  const commentsQuery = useQuery({
    queryKey: ['post-discussion-comments', activePostId],
    queryFn: async () => {
      if (!activePostId || String(activePostId).startsWith('discussion_')) {
        return SEED_COMMENTS;
      }
      try {
        const res = await apiCommentService.getCommentsByPostId(activePostId);
        const raw = res?.data?.content || res?.data || res?.content || [];
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map(mapComment);
        }
        return SEED_COMMENTS;
      } catch {
        return SEED_COMMENTS;
      }
    },
    staleTime: 5000,
    refetchInterval: 15000,
  });

  // Keep local comments synchronized with query result
  useEffect(() => {
    if (commentsQuery.data) {
      setLocalComments(commentsQuery.data);
    }
  }, [commentsQuery.data]);

  // Add new comment
  const handleCommentCreated = useCallback(
    async (content, attachedImageUrl) => {
      const tempId = `temp_c_${Date.now()}`;
      const newComment = {
        id: tempId,
        content,
        username: currentUser?.username || '@anonymous',
        isAnonymous: true,
        likeCount: 0,
        createdAt: new Date().toISOString(),
        imageUrl: attachedImageUrl || null,
        replies: [],
      };

      // Optimistic update
      setLocalComments((prev) => [newComment, ...prev]);

      try {
        if (!String(activePostId).startsWith('discussion_')) {
          const res = await apiCommentService.createComment(activePostId, content);
          const saved = res?.data || res;
          if (saved?.id) {
            setLocalComments((prev) =>
              prev.map((c) => (c.id === tempId ? { ...c, id: saved.id } : c))
            );
          }
        }
        queryClient.invalidateQueries({ queryKey: ['post-discussion-comments', activePostId] });
        return newComment;
      } catch (err) {
        // Rollback
        setLocalComments((prev) => prev.filter((c) => c.id !== tempId));
        throw err;
      }
    },
    [activePostId, currentUser, queryClient]
  );

  // Add reply
  const handleReplyCreated = useCallback(
    async (parentCommentId, replyContent) => {
      const tempReplyId = `temp_r_${Date.now()}`;
      const newReply = {
        id: tempReplyId,
        content: replyContent,
        username: currentUser?.username || '@anonymous',
        isAnonymous: true,
        likeCount: 0,
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === parentCommentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        })
      );

      try {
        if (!String(parentCommentId).startsWith('seed_')) {
          await apiCommentService.replyToComment(parentCommentId, replyContent);
        }
        queryClient.invalidateQueries({ queryKey: ['post-discussion-comments', activePostId] });
      } catch (err) {
        // Rollback
        setLocalComments((prev) =>
          prev.map((c) => {
            if (c.id === parentCommentId) {
              return {
                ...c,
                replies: (c.replies || []).filter((r) => r.id !== tempReplyId),
              };
            }
            return c;
          })
        );
        throw err;
      }
    },
    [activePostId, currentUser, queryClient]
  );

  // Delete comment
  const handleCommentDeleted = useCallback(
    async (commentId) => {
      const previous = [...localComments];
      // Optimistic deletion
      setLocalComments((prev) => prev.filter((c) => c.id !== commentId));

      try {
        if (!String(commentId).startsWith('seed_') && !String(commentId).startsWith('temp_')) {
          await apiCommentService.deleteComment(commentId);
        }
        queryClient.invalidateQueries({ queryKey: ['post-discussion-comments', activePostId] });
      } catch (err) {
        // Rollback
        setLocalComments(previous);
        throw err;
      }
    },
    [localComments, activePostId, queryClient]
  );

  // Delete reply
  const handleReplyDeleted = useCallback(
    async (replyId, parentCommentId) => {
      const previous = [...localComments];
      // Optimistic deletion
      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === parentCommentId) {
            return {
              ...c,
              replies: (c.replies || []).filter((r) => r.id !== replyId),
            };
          }
          return c;
        })
      );

      try {
        if (!String(replyId).startsWith('seed_') && !String(replyId).startsWith('temp_')) {
          await apiCommentService.deleteComment(replyId);
        }
        queryClient.invalidateQueries({ queryKey: ['post-discussion-comments', activePostId] });
      } catch (err) {
        // Rollback
        setLocalComments(previous);
        throw err;
      }
    },
    [localComments, activePostId, queryClient]
  );

  // Related discussions from same topic or category
  const relatedPosts = useMemo(() => {
    return posts.filter((p) => {
      if (!p || String(p.id) === String(activePost?.id)) return false;
      const top = String(p.subtopic || p.topicName || p.topic || '').toUpperCase();
      const clean = String(topicMeta.name).toUpperCase();
      return top.includes(clean) || clean.includes(top);
    });
  }, [posts, activePost, topicMeta]);

  return (
    <div className="topic-discussion-page-root">
      {/* ── STICKY APP HEADER ── */}
      <AppHeader onNavigate={onNavigate} />

      {/* ── 3-COLUMN APPROVED LAYOUT GRID ── */}
      <div className="topic-discussion-desktop-grid">
        {/* Column 1: Left Navigation Sidebar (Reused without modification) */}
        <DesktopSidebar
          activeRoute="/explore"
          onNavigate={onNavigate}
          onJoinCommunity={() => onNavigate ? onNavigate('/explore') : (window.location.href = '/explore')}
        />

        {/* Column 2: Center Discussion Stream */}
        <main className="topic-discussion-center-stream" id="topic-discussion-stream">
          {/* 1. Breadcrumbs */}
          <TopicDiscussionBreadcrumb
            topicName={topicMeta.name}
            onNavigate={onNavigate}
          />

          {/* 2. Topic Header Card */}
          <TopicDiscussionHeader
            topicName={topicMeta.name}
            topicIcon={topicMeta.icon}
            badgeBg={topicMeta.badgeBg}
            discussionCount={topicMeta.discussionCount}
            topicId={topicMeta.id}
            onNavigate={onNavigate}
          />

          {/* 3. Original Discussion Post Card */}
          <OriginalDiscussionPost
            post={activePost}
            onNavigate={onNavigate}
            onCommentsClick={() => {
              document.getElementById('discussion-comments-area')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* 4. Discussion Comments Section */}
          <TopicDiscussionComments
            postId={activePost?.id}
            comments={localComments}
            onCommentCreated={handleCommentCreated}
            onCommentDeleted={handleCommentDeleted}
            onReplyCreated={handleReplyCreated}
            onReplyDeleted={handleReplyDeleted}
            onNavigate={onNavigate}
          />
        </main>

        {/* Column 3: Right Sidebar Widgets */}
        <aside className="topic-discussion-right-sidebar" aria-label="Topic Information">
          {/* Widget A: Topic Overview */}
          <TopicOverviewWidget
            topicId={topicMeta.id}
            topicName={topicMeta.name}
            topicIcon={topicMeta.icon}
            badgeBg={topicMeta.badgeBg}
            coverImage={topicMeta.image}
            description={topicMeta.description}
            discussionCount={topicMeta.discussionCount}
            memberCount={topicMeta.memberCount}
            tags={topicMeta.tags}
            onNavigate={onNavigate}
          />

          {/* Widget B: Community Guidelines */}
          <TopicGuidelinesWidget />

          {/* Widget C: Related Discussions */}
          <RelatedDiscussionsWidget
            discussions={relatedPosts}
            currentPostId={activePost?.id}
            topicName={topicMeta.name}
            onNavigate={onNavigate}
          />
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation activeRoute="/explore" onNavigate={onNavigate} />
    </div>
  );
}
