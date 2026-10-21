import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Heart, Bookmark, Share2, MoreHorizontal, MessageSquare,
  ChevronDown, Send, Image as ImageIcon, Smile, Mic, MicOff, Loader2,
  X, CornerDownRight, Trash2, Check, Shield
} from 'lucide-react';
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';
import { AppHeader } from '../../components/layout/AppHeader.jsx';
import { DesktopSidebar } from '../../components/layout/DesktopSidebar.jsx';
import { MobileNavigation } from '../../components/layout/MobileNavigation.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiPostService } from '../../services/apiPostService.js';
import { apiCommentService } from '../../services/apiCommentService.js';
import { apiClient } from '../../services/apiClient.js';
import { mapPost, mapComment } from '../../services/apiMappers.js';
import { getTopicMetadata } from '../../utils/topicMetadata.js';
import { RealtimeTimestamp } from '../../utils/formatDate.js';
import { getMediaUrl } from '../../config/env.js';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import avatarSilhouette from '../../assets/home/avatar-silhouette.jpg';

// Deterministic vibrant avatar backgrounds
const AVATAR_PALETTE = ['#BE123C', '#0284C7', '#16A34A', '#9333EA', '#EA580C', '#0D9488'];
function getAvatarBg(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// Fallback seed comments matching the approved visual reference
const DEFAULT_SEED_COMMENTS = [
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

/**
 * Two-line clamped comment text with dynamic overflow detection
 */
function TruncatedCommentText({ text, isExpanded, onToggleExpand }) {
  const textRef = useRef(null);
  const [canOverflow, setCanOverflow] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const checkOverflow = () => {
      if (el && !isExpanded) {
        setCanOverflow(el.scrollHeight > el.clientHeight + 2);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text, isExpanded]);

  return (
    <div className="post-disc-comment-body">
      <p
        ref={textRef}
        className={`post-disc-comment-text ${isExpanded ? 'expanded' : 'clamped'}`}
      >
        {text}
      </p>
      {(canOverflow || isExpanded) && (
        <button
          type="button"
          className="post-disc-read-more-btn"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export function PostDiscussionPage({ postId, topicId = 'MENTAL_HEALTH', onNavigate }) {
  const { posts = [], reactToPost, toggleSavePost, savedPostIds = [] } = usePosts();
  const { currentUser: authUser } = useAuth();
  const currentUser = authUser || (typeof localStorage !== 'undefined' ? (JSON.parse(localStorage.getItem('auth_user') || localStorage.getItem('mka_current_user') || 'null')) : null);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [fetchedPost, setFetchedPost] = useState(null);
  const [localComments, setLocalComments] = useState([]);
  const [activeSort, setActiveSort] = useState('MOST_LIKED'); // 'MOST_LIKED' | 'TRENDING' | 'NEWEST'
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [expandedTextIds, setExpandedTextIds] = useState(new Set());
  const [likeState, setLikeState] = useState({});

  // Message Composer State matching Awaaj Pulse pattern
  const [commentText, setCommentText] = useState('');
  const [attachedImageUrl, setAttachedImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('EN'); // 'EN' | 'HI' | 'MR'
  const [replyingToItem, setReplyingToItem] = useState(null); // { id, parentId, username } | null

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const commentsStreamRef = useRef(null);
  const baseVoiceTextRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [postId, topicId]);

  // Find post in context memory
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

  // Fetch single post from backend if not found in memory
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
    return () => {
      isMounted = false;
    };
  }, [postId, matchedPost]);

  // Resolve active post
  const activePost = useMemo(() => {
    if (matchedPost) return matchedPost;
    if (fetchedPost) return fetchedPost;

    // Fallback baseline post matching approved screenshot reference
    const meta = getTopicMetadata(topicId);
    return {
      id: postId || `discussion_${meta.id.toLowerCase()}`,
      title: 'How do you deal with overthinking at night?',
      hashtag: '#Anxiety',
      topic: meta.id,
      topicName: meta.name,
      content:
        "No matter how tired I am, my mind keeps thinking about past mistakes, future worries and random things. It's affecting my sleep and next day I feel exhausted. How do you stop overthinking and actually rest?\n\nWould love to hear your tips, routines or anything that has worked for you. ❤️",
      username: '@anonymous',
      authorUsername: '@anonymous',
      isAnonymous: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      reactions: { HEART: 1200 },
      likeCount: 1200,
      commentsCount: 245,
      commentCount: 245,
    };
  }, [matchedPost, fetchedPost, postId, topicId]);

  // Active topic metadata
  const topicMeta = useMemo(() => {
    return getTopicMetadata(activePost?.topic || topicId);
  }, [activePost, topicId]);

  // Fetch comments for active post
  const activePostId = activePost?.id;
  const { data: serverCommentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['post-discussion-comments', activePostId],
    queryFn: async () => {
      if (!activePostId) return [];
      try {
        const res = await apiCommentService.getCommentsByPostId(activePostId, { page: 0, size: 50 });
        const list = res?.data?.content || res?.content || res?.data || [];
        return Array.isArray(list) ? list.map(mapComment) : [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(activePostId),
    staleTime: 30000,
  });

  // Reconcile comments
  useEffect(() => {
    if (serverCommentsData && serverCommentsData.length > 0) {
      setLocalComments(serverCommentsData);
    } else {
      setLocalComments(DEFAULT_SEED_COMMENTS);
    }
  }, [serverCommentsData]);

  // Voice recording integration via useVoiceRecorder
  const handleVoiceTranscription = useCallback((transcribedText) => {
    if (!transcribedText) return;
    if (baseVoiceTextRef.current === null) {
      baseVoiceTextRef.current = commentText;
    }
    const prefix = baseVoiceTextRef.current ? `${baseVoiceTextRef.current} ` : '';
    setCommentText(`${prefix}${transcribedText}`);
  }, [commentText]);

  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecorder({
    language: voiceLanguage,
    onTranscription: handleVoiceTranscription,
    onError: (err) => addToast(err?.message || 'Voice input error', 'error'),
  });

  const toggleRecording = () => {
    if (!currentUser) {
      addToast('Please log in to record audio notes.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }
    if (isRecording) {
      stopRecording();
      baseVoiceTextRef.current = null;
    } else {
      baseVoiceTextRef.current = commentText;
      startRecording();
    }
  };

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.post-disc-sort-wrap')) {
        setSortDropdownOpen(false);
      }
      if (!e.target.closest('.post-disc-emoji-anchor')) {
        setShowEmojiPicker(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowEmojiPicker(false);
        setSortDropdownOpen(false);
        setReplyingToItem(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Image Upload Workflow
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPEG, PNG, WebP).', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size exceeds 5MB limit.', 'error');
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.imageUrl || res.data?.imageUrl || '';
      if (url) {
        setAttachedImageUrl(url);
        addToast('Photo attached successfully.', 'success');
      }
    } catch {
      addToast('Failed to upload image.', 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Emoji Select
  const handleEmojiSelect = (emojiData) => {
    if (!emojiData?.emoji) return;
    setCommentText((prev) => `${prev}${emojiData.emoji}`);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  // Toggle Read More / Less
  const toggleTextExpand = (id) => {
    setExpandedTextIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Toggle Like reaction on comments
  const handleToggleLike = (commentId, initialLiked = false, initialCount = 0) => {
    if (!currentUser) {
      addToast('Please log in to like comments.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }
    const current = likeState[commentId] ?? {
      liked: initialLiked,
      count: Number(initialCount) || 0,
    };
    const nextLiked = !current.liked;
    const nextCount = nextLiked ? current.count + 1 : Math.max(0, current.count - 1);

    setLikeState((prev) => ({
      ...prev,
      [commentId]: { liked: nextLiked, count: nextCount },
    }));

    if (!String(commentId).startsWith('seed_') && !String(commentId).startsWith('temp_')) {
      apiCommentService.likeComment(commentId).catch(() => {
        setLikeState((prev) => ({ ...prev, [commentId]: current }));
      });
    }
  };

  // Delete comment / reply
  const handleDeleteComment = async (itemId, isReply = false, parentId = null) => {
    if (!currentUser) {
      addToast('Please log in to delete.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }
    if (isReply && parentId) {
      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: (c.replies || []).filter((r) => r.id !== itemId),
            };
          }
          return c;
        })
      );
    } else {
      setLocalComments((prev) => prev.filter((c) => c.id !== itemId));
    }
    addToast('Deleted successfully.', 'info');

    try {
      if (!String(itemId).startsWith('seed_') && !String(itemId).startsWith('temp_')) {
        await apiCommentService.deleteComment(itemId);
      }
      queryClient.invalidateQueries({ queryKey: ['post-discussion-comments', activePostId] });
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Comment / Reply
  const handlePostSubmit = async () => {
    if (!currentUser) {
      addToast('Please log in to participate in the discussion.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }
    const trimmed = commentText.trim();
    if (!trimmed && !attachedImageUrl) {
      addToast('Please write a message or attach a photo.', 'error');
      return;
    }

    setIsSubmitting(true);
    const tempId = `temp_${Date.now()}`;

    if (replyingToItem) {
      // Replying to a parent comment
      const newReply = {
        id: tempId,
        content: trimmed,
        imageUrl: attachedImageUrl || undefined,
        username: currentUser?.username || '@anonymous',
        authorUsername: currentUser?.username || '@anonymous',
        isAnonymous: true,
        likeCount: 0,
        createdAt: new Date().toISOString(),
      };

      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === replyingToItem.parentId || c.id === replyingToItem.id) {
            return { ...c, replies: [...(c.replies || []), newReply] };
          }
          return c;
        })
      );

      const targetParentId = replyingToItem.parentId || replyingToItem.id;
      const imgToSubmit = attachedImageUrl || null;
      setReplyingToItem(null);
      setCommentText('');
      setAttachedImageUrl('');
      addToast('Reply posted anonymously!', 'success');

      try {
        if (!String(targetParentId).startsWith('seed_')) {
          await apiCommentService.replyToComment(targetParentId, trimmed, voiceLanguage, imgToSubmit);
        }
        queryClient.invalidateQueries({ queryKey: ['post-discussion-comments', activePostId] });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // New Top-level Comment
      const imgToSubmit = attachedImageUrl || null;
      const newComment = {
        id: tempId,
        content: trimmed,
        imageUrl: imgToSubmit || undefined,
        username: currentUser?.username || '@anonymous',
        authorUsername: currentUser?.username || '@anonymous',
        isAnonymous: true,
        likeCount: 0,
        createdAt: new Date().toISOString(),
        replies: [],
      };

      // Optimistically pin new comment at top
      setLocalComments((prev) => [newComment, ...prev]);
      setCommentText('');
      setAttachedImageUrl('');
      addToast('Comment posted anonymously!', 'success');

      // Scroll comments stream to top
      setTimeout(() => {
        if (commentsStreamRef.current) {
          commentsStreamRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);

      try {
        if (!String(activePostId).startsWith('discussion_')) {
          await apiCommentService.createComment(activePostId, trimmed, voiceLanguage, imgToSubmit);
        }
        queryClient.invalidateQueries({ queryKey: ['post-discussion-comments', activePostId] });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Sort comments
  const sortedComments = useMemo(() => {
    const list = [...localComments];
    if (activeSort === 'NEWEST') {
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    if (activeSort === 'TRENDING') {
      return list.sort((a, b) => {
        const scoreA = (a.likeCount || 0) * 2 + (a.replies?.length || 0) * 3;
        const scoreB = (b.likeCount || 0) * 2 + (b.replies?.length || 0) * 3;
        return scoreB - scoreA;
      });
    }
    // Default 'MOST_LIKED'
    return list.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  }, [localComments, activeSort]);

  const isSaved = savedPostIds.includes(activePost?.id);
  const heartCount = activePost?.reactions?.HEART || activePost?.likeCount || 1200;
  const userHasHeart = activePost?.userReaction === 'HEART' || activePost?.isLikedByCurrentUser;
  const totalCommentsCount = localComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="home-page-root">
      {/* ── STICKY APP HEADER ── */}
      <AppHeader onNavigate={onNavigate} />

      {/* ── 3-COLUMN LAYOUT (DESKTOP) ── */}
      <div className="post-disc-desktop-grid">
        {/* Column 1: Left Navigation Sidebar */}
        <DesktopSidebar
          activeRoute="/explore"
          onNavigate={onNavigate}
          onJoinCommunity={() => onNavigate ? onNavigate('/explore') : (window.location.href = '/explore')}
        />

        {/* Column 2: Center Main Post Content */}
        <main className="post-disc-center-col" id="post-main-content">
          {/* Breadcrumbs */}
          <nav className="topic-disc-breadcrumb" aria-label="Breadcrumb">
            <span
              className="breadcrumb-link"
              onClick={() => onNavigate ? onNavigate('/home') : (window.location.href = '/home')}
            >
              Home
            </span>
            <span className="breadcrumb-separator">›</span>
            <span
              className="breadcrumb-link"
              onClick={() => onNavigate ? onNavigate('/explore') : (window.location.href = '/explore')}
            >
              Explore
            </span>
            <span className="breadcrumb-separator">›</span>
            <span
              className="breadcrumb-link"
              onClick={() => onNavigate ? onNavigate(`/topic/${topicMeta.id.toLowerCase()}`) : (window.location.href = `/topic/${topicMeta.id.toLowerCase()}`)}
            >
              {topicMeta.name}
            </span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Discussion</span>
          </nav>

          {/* Back Navigation Bar */}
          <div className="post-disc-back-bar">
            <button
              type="button"
              className="post-disc-back-btn"
              onClick={() => onNavigate ? onNavigate(`/topic/${topicMeta.id.toLowerCase()}`) : (window.location.href = `/topic/${topicMeta.id.toLowerCase()}`)}
            >
              <ArrowLeft size={16} />
              <span>Back to {topicMeta.name}</span>
            </button>

            <span
              className="post-disc-topic-pill"
              style={{ backgroundColor: topicMeta.badgeBg, color: topicMeta.badgeColor }}
            >
              <span>{topicMeta.icon}</span>
              <span>{topicMeta.name}</span>
            </span>
          </div>

          {/* Original Post Article Card */}
          <article className="post-disc-original-card">
            {/* Header: Author + Timestamp + Menu */}
            <div className="post-disc-author-row">
              <div className="post-disc-author-left">
                <img
                  src={avatarSilhouette}
                  alt="Anonymous"
                  className="post-disc-author-avatar"
                />
                <div className="post-disc-author-info">
                  <span className="post-disc-author-name">
                    {activePost.username || '@anonymous'}
                  </span>
                  <span className="post-disc-timestamp">
                    <RealtimeTimestamp date={activePost.createdAt} />
                  </span>
                </div>
              </div>

              <div className="post-disc-author-right">
                <button
                  type="button"
                  className="post-disc-menu-btn"
                  onClick={() => {
                    navigator.clipboard?.writeText?.(window.location.href);
                    addToast('Link copied to clipboard!', 'success');
                  }}
                  title="Share link"
                >
                  <Share2 size={16} color="#64748B" />
                </button>
              </div>
            </div>

            {/* Post Title */}
            {activePost.title && (
              <h1 className="post-disc-title">{activePost.title}</h1>
            )}

            {/* Hashtag Pill */}
            {(activePost.hashtag || activePost.subtopic || activePost.topic) && (
              <div className="post-disc-tags-row">
                <span className="post-disc-tag">
                  {activePost.hashtag || `#${(activePost.subtopic || activePost.topic).replace(/\s+/g, '')}`}
                </span>
                {topicMeta.tags?.slice(0, 2).map((t) => (
                  <span key={t} className="post-disc-tag">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Post Content */}
            <div className="post-disc-content">
              {activePost.content?.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Attached Media */}
            {activePost.imageUrl && (
              <div className="post-disc-media-box">
                <img
                  src={getMediaUrl(activePost.imageUrl)}
                  alt="Attached illustration"
                  className="post-disc-media-img"
                  loading="lazy"
                />
              </div>
            )}

            {/* Engagement Actions Bar */}
            <div className="post-disc-engagement-bar">
              <div className="post-disc-actions-group">
                {/* Heart React */}
                <button
                  type="button"
                  className={`post-disc-action-pill ${userHasHeart ? 'active-heart' : ''}`}
                  onClick={() => reactToPost(activePost.id, 'HEART')}
                  title="Like post"
                >
                  <Heart
                    size={16}
                    fill={userHasHeart ? '#E11D48' : 'none'}
                    color={userHasHeart ? '#E11D48' : '#64748B'}
                  />
                  <span>{heartCount}</span>
                </button>

                {/* Comments Counter */}
                <button
                  type="button"
                  className="post-disc-action-pill"
                  onClick={() => {
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                  title="View comments"
                >
                  <MessageSquare size={16} color="#64748B" />
                  <span>{totalCommentsCount}</span>
                </button>

                {/* Bookmark */}
                <button
                  type="button"
                  className={`post-disc-action-pill ${isSaved ? 'active-bookmark' : ''}`}
                  onClick={() => toggleSavePost(activePost.id)}
                  title="Save post"
                >
                  <Bookmark
                    size={16}
                    fill={isSaved ? '#E11D48' : 'none'}
                    color={isSaved ? '#E11D48' : '#64748B'}
                  />
                  <span>Save</span>
                </button>
              </div>

              <button
                type="button"
                className="post-disc-share-btn"
                onClick={() => {
                  navigator.clipboard?.writeText?.(window.location.href);
                  addToast('Discussion link copied!', 'success');
                }}
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>
          </article>
        </main>

        {/* Column 3: Dedicated Sticky Discussion Panel (reusing Pulse pattern) */}
        <aside className="post-disc-right-panel" aria-label="Discussion Panel">
          {/* 1. Discussion Header & Sort Bar */}
          <div className="post-disc-header-bar">
            <div className="post-disc-header-left">
              <MessageSquare size={16} color="#E11D48" />
              <h3 className="post-disc-panel-title">
                {totalCommentsCount} Comments
              </h3>
            </div>

            {/* Sorting Dropdown */}
            <div className="post-disc-sort-wrap">
              <button
                type="button"
                className="post-disc-sort-btn"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                aria-expanded={sortDropdownOpen}
              >
                <span>
                  {activeSort === 'MOST_LIKED'
                    ? 'Most Liked'
                    : activeSort === 'TRENDING'
                    ? 'Trending'
                    : 'Latest'}
                </span>
                <ChevronDown size={13} />
              </button>

              {sortDropdownOpen && (
                <div className="post-disc-sort-menu">
                  <button
                    type="button"
                    className={`post-disc-sort-opt ${activeSort === 'MOST_LIKED' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSort('MOST_LIKED');
                      setSortDropdownOpen(false);
                    }}
                  >
                    Most Liked
                  </button>
                  <button
                    type="button"
                    className={`post-disc-sort-opt ${activeSort === 'TRENDING' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSort('TRENDING');
                      setSortDropdownOpen(false);
                    }}
                  >
                    Trending
                  </button>
                  <button
                    type="button"
                    className={`post-disc-sort-opt ${activeSort === 'NEWEST' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSort('NEWEST');
                      setSortDropdownOpen(false);
                    }}
                  >
                    Latest
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. Scrollable Comments List Stream */}
          <div
            ref={commentsStreamRef}
            className="post-disc-comments-stream"
            role="region"
            aria-label="Comments Stream"
          >
            {commentsLoading ? (
              <div className="post-disc-loading">
                <Loader2 size={22} className="spin-animation" color="#E11D48" />
                <span>Loading comments...</span>
              </div>
            ) : sortedComments.length === 0 ? (
              <div className="post-disc-empty">
                <p>No comments yet. Be the first to share your perspective!</p>
              </div>
            ) : (
              sortedComments.map((comment) => {
                const commentUser = comment.username || comment.authorUsername || '@anonymous';
                const avatarBg = getAvatarBg(commentUser);
                const rawLikes = Number(comment.likeCount) || 0;
                const currentLike = likeState[comment.id] ?? {
                  liked: Boolean(comment.likedByCurrentUser),
                  count: rawLikes,
                };
                const replies = comment.replies || [];
                const isOwner =
                  currentUser?.username &&
                  commentUser.replace(/^@/, '').toLowerCase() === currentUser.username.toLowerCase();

                return (
                  <div key={comment.id} className="post-disc-comment-item">
                    <div className="post-disc-comment-row">
                      <div
                        className="post-disc-avatar"
                        style={{ backgroundColor: avatarBg }}
                      >
                        <span>{commentUser.slice(1, 3).toUpperCase() || 'AN'}</span>
                      </div>

                      <div className="post-disc-comment-main">
                        <div className="post-disc-comment-meta">
                          <span className="post-disc-comment-user">{commentUser}</span>
                          <span className="post-disc-meta-dot">•</span>
                          <span className="post-disc-comment-time">
                            <RealtimeTimestamp date={comment.createdAt} />
                          </span>

                          {isOwner && (
                            <button
                              type="button"
                              className="post-disc-del-btn"
                              onClick={() => handleDeleteComment(comment.id)}
                              title="Delete comment"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>

                        {/* Clamped Text Body with Read More */}
                        <TruncatedCommentText
                          text={comment.content || ''}
                          isExpanded={expandedTextIds.has(comment.id)}
                          onToggleExpand={() => toggleTextExpand(comment.id)}
                        />

                        {/* Optional Attached Photo */}
                        {comment.imageUrl && (
                          <div className="post-disc-attached-media">
                            <img
                              src={getMediaUrl(comment.imageUrl)}
                              alt="Comment attachment"
                              className="post-disc-comment-img"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Engagement Actions */}
                        <div className="post-disc-comment-actions">
                          <button
                            type="button"
                            className={`post-disc-like-btn ${currentLike.liked ? 'liked' : ''}`}
                            onClick={() => handleToggleLike(comment.id, comment.likedByCurrentUser, comment.likeCount)}
                          >
                            <Heart
                              size={13}
                              fill={currentLike.liked ? '#E11D48' : 'none'}
                              color={currentLike.liked ? '#E11D48' : '#64748B'}
                            />
                            <span>{currentLike.count > 0 ? currentLike.count : ''}</span>
                          </button>

                          <button
                            type="button"
                            className="post-disc-reply-btn"
                            onClick={() => {
                              setReplyingToItem({
                                id: comment.id,
                                parentId: comment.id,
                                username: commentUser,
                              });
                              setTimeout(() => textareaRef.current?.focus(), 50);
                            }}
                          >
                            Reply
                          </button>
                        </div>

                        {/* Nested Replies */}
                        {replies.length > 0 && (
                          <div className="post-disc-nested-replies">
                            {replies.map((reply) => {
                              const replyUser = reply.username || reply.authorUsername || '@anonymous';
                              const replyBg = getAvatarBg(replyUser);
                              const isReplyOwner =
                                currentUser?.username &&
                                replyUser.replace(/^@/, '').toLowerCase() === currentUser.username.toLowerCase();

                              return (
                                <div key={reply.id} className="post-disc-reply-item">
                                  <div
                                    className="post-disc-reply-avatar"
                                    style={{ backgroundColor: replyBg }}
                                  >
                                    <span>{replyUser.slice(1, 3).toUpperCase() || 'AN'}</span>
                                  </div>

                                  <div className="post-disc-reply-main">
                                    <div className="post-disc-comment-meta">
                                      <span className="post-disc-comment-user">{replyUser}</span>
                                      <span className="post-disc-meta-dot">•</span>
                                      <span className="post-disc-comment-time">
                                        <RealtimeTimestamp date={reply.createdAt} />
                                      </span>

                                      {isReplyOwner && (
                                        <button
                                          type="button"
                                          className="post-disc-del-btn"
                                          onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                          title="Delete reply"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>

                                    <TruncatedCommentText
                                      text={reply.content || ''}
                                      isExpanded={expandedTextIds.has(reply.id)}
                                      onToggleExpand={() => toggleTextExpand(reply.id)}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 3. Anchored Bottom Message Composer (Matching Awaaj Pulse Reference) */}
          <div className="post-disc-bottom-composer">
            {/* Reply Mode Active Banner */}
            {replyingToItem && (
              <div className="post-disc-reply-banner">
                <div className="post-disc-reply-info">
                  <CornerDownRight size={13} color="#E11D48" />
                  <span>Replying to <strong>{replyingToItem.username}</strong></span>
                </div>
                <button
                  type="button"
                  className="post-disc-reply-cancel"
                  onClick={() => setReplyingToItem(null)}
                  title="Cancel reply"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Voice Listening Banner */}
            {isRecording && (
              <div className="pulse-voice-listening-banner">
                <span className="pulse-voice-pulse-dot" />
                <span className="pulse-voice-listening-text">
                  Listening in {voiceLanguage === 'HI' ? 'Hindi' : voiceLanguage === 'MR' ? 'Marathi' : 'English'}... Speak now
                </span>
                <button
                  type="button"
                  className="pulse-voice-stop-btn"
                  onClick={stopRecording}
                >
                  Done
                </button>
              </div>
            )}
            {isTranscribing && (
              <div className="pulse-voice-listening-banner transcribing">
                <Loader2 size={13} className="spin-animation" />
                <span className="pulse-voice-listening-text">Transcribing voice note...</span>
              </div>
            )}

            {/* Top Row: User Avatar + Textarea */}
            <div className="post-disc-composer-input-row">
              <img
                src={avatarSilhouette}
                alt="Anonymous User"
                className="post-disc-composer-avatar"
              />

              <div className="post-disc-textarea-wrap">
                <textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePostSubmit();
                    }
                  }}
                  maxLength={500}
                  placeholder={
                    replyingToItem
                      ? `Reply to ${replyingToItem.username}...`
                      : 'Share your thoughts anonymously...'
                  }
                  className="post-disc-composer-textarea"
                  rows={2}
                />
              </div>
            </div>

            {/* Photo Attachment Preview */}
            {attachedImageUrl && (
              <div className="pulse-composer-attached-preview">
                <img
                  src={getMediaUrl(attachedImageUrl)}
                  alt="Attachment"
                  className="pulse-attached-img"
                />
                <button
                  type="button"
                  className="pulse-remove-photo-btn"
                  onClick={() => setAttachedImageUrl('')}
                  title="Remove attached photo"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Bottom Toolbar: Media, Emoji, Voice, Lang, Char Count, Send */}
            <div className="post-disc-composer-toolbar">
              <div className="post-disc-tools-left">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handlePhotoSelect}
                  disabled={isUploadingPhoto || isSubmitting}
                />

                {/* Photo Attachment */}
                <button
                  type="button"
                  className="post-disc-tool-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto || isSubmitting}
                  title="Attach photo"
                >
                  {isUploadingPhoto ? (
                    <Loader2 size={16} className="spin-animation" />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                </button>

                {/* Emoji Picker Popover */}
                <div className="post-disc-emoji-anchor">
                  <button
                    type="button"
                    className={`post-disc-tool-btn ${showEmojiPicker ? 'active' : ''}`}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Insert emoji"
                  >
                    <Smile size={16} />
                  </button>

                  {showEmojiPicker && (
                    <div className="post-disc-emoji-popover">
                      <EmojiPicker
                        onEmojiClick={handleEmojiSelect}
                        autoFocusSearch={false}
                        theme={Theme.LIGHT}
                        emojiStyle={EmojiStyle.NATIVE}
                        lazyLoadEmojis={true}
                        width={300}
                        height={360}
                        previewConfig={{ showPreview: false }}
                      />
                    </div>
                  )}
                </div>

                {/* Microphone / Speech-to-text */}
                <button
                  type="button"
                  className={`post-disc-tool-btn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  disabled={isTranscribing}
                  title={isRecording ? 'Stop voice recording' : 'Voice-to-text'}
                >
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                {/* Language Selector Pills: EN / HI / MR */}
                <div className="post-disc-lang-pills">
                  {['EN', 'HI', 'MR'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`post-disc-lang-btn ${voiceLanguage === lang ? 'active' : ''}`}
                      onClick={() => setVoiceLanguage(lang)}
                      disabled={isRecording}
                      title={`Recognition in ${lang === 'EN' ? 'English' : lang === 'HI' ? 'Hindi' : 'Marathi'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: Counter & Post Button */}
              <div className="post-disc-tools-right">
                <span className="post-disc-char-count">{commentText.length}/500</span>

                <button
                  type="button"
                  className="post-disc-send-btn"
                  onClick={handlePostSubmit}
                  disabled={isSubmitting || (!commentText.trim() && !attachedImageUrl)}
                  title={replyingToItem ? 'Post reply' : 'Post comment'}
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="spin-animation" />
                  ) : (
                    <>
                      <span>{replyingToItem ? 'Reply' : 'Post'}</span>
                      <Send size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation activeRoute="/explore" onNavigate={onNavigate} />
    </div>
  );
}
