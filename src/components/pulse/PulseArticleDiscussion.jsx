import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  MessageSquare,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Heart,
  Image as ImageIcon,
  Smile,
  Mic,
  MicOff,
  Send,
  Loader2,
  X,
  Copy,
  Flag,
  VolumeX,
  Shield,
  Sparkles,
  User,
  Edit3,
  Trash2,
  CornerDownRight,
} from 'lucide-react';
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';
import avatarSilhouette from '../../assets/home/avatar-silhouette.jpg';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiClient } from '../../services/apiClient.js';
import { apiCommentService } from '../../services/apiCommentService.js';
import { getMediaUrl } from '../../config/env.js';
import { formatDate } from '../../utils/formatDate.js';
import { ReportModal } from '../reports/ReportModal.jsx';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';

// Deterministic vibrant palette matching the approved screenshot
const AVATAR_PALETTE = [
  '#6D28D9', // Deep Purple (NI)
  '#0D9488', // Teal (AN)
  '#16A34A', // Emerald (AM)
  '#EA580C', // Orange (RO)
  '#2563EB', // Blue (ME)
  '#DB2777', // Magenta (KA)
  '#7C3AED', // Violet
  '#059669', // Mint
];

function getAvatarColor(identifier = '') {
  const clean = String(identifier).replace(/[@_\s-]/g, '').toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

function getInitials(username, fallback = 'AN') {
  if (!username) return fallback;
  const clean = String(username).replace('@', '').trim();
  const parts = clean.split(/[._\s-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || fallback;
}

const AVAILABLE_MOODS = [
  { id: 'optimistic', label: '🙏 Optimistic', tag: '[Mood: 🙏 Optimistic]' },
  { id: 'curious', label: '🤔 Curious', tag: '[Mood: 🤔 Curious]' },
  { id: 'trending', label: '🔥 Trending', tag: '[Mood: 🔥 Trending]' },
  { id: 'insightful', label: '💡 Insightful', tag: '[Mood: 💡 Insightful]' },
  { id: 'grateful', label: '❤️ Grateful', tag: '[Mood: ❤️ Grateful]' },
];

/**
 * TruncatedCommentText: Two-line preview with dynamic overflow detection.
 * Automatically shows 'Read more' if text overflows 2 visual lines,
 * and toggles to 'Read less'.
 */
function TruncatedCommentText({ text, isExpanded, onToggleExpand }) {
  const textRef = useRef(null);
  const [canOverflow, setCanOverflow] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const checkOverflow = () => {
      if (el) {
        if (!isExpanded) {
          const hasOverflow = el.scrollHeight > el.clientHeight + 1;
          setCanOverflow(hasOverflow);
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text, isExpanded]);

  return (
    <div className="pulse-comment-text-body">
      <p
        ref={textRef}
        className={`pulse-comment-p ${isExpanded ? 'expanded' : 'clamped'}`}
      >
        {text}
      </p>
      {(canOverflow || isExpanded) && (
        <button
          type="button"
          className="pulse-read-more-btn"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export function PulseArticleDiscussion({
  pulseItemId: _pulseItemId,
  comments = [],
  isLoading = false,
  onCreateComment,
  onReplySubmit,
  onUpdateComment,
  onDeleteComment,
  onNavigate,
}) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  // Filter & Sort State
  const [activeTab, setActiveTab] = useState('TOP'); // 'TOP' | 'LATEST' | 'MOST_LIKED'
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [identityMenuOpen, setIdentityMenuOpen] = useState(false);

  // Composer State
  const [commentText, setCommentText] = useState('');
  const [attachedImageUrl, setAttachedImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showMoodMenu, setShowMoodMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Single Shared Composer Reply State: { id, parentId, username } or null
  const [replyingToItem, setReplyingToItem] = useState(null);

  // Speech-to-Text State & Voice Recognition
  const [voiceLanguage, setVoiceLanguage] = useState('EN'); // 'EN' | 'HI' | 'MR'
  const baseVoiceTextRef = useRef(null);

  const handleVoiceTranscription = useCallback((transcribedText) => {
    if (!transcribedText) return;
    if (baseVoiceTextRef.current === null) {
      baseVoiceTextRef.current = commentText;
    }
    const base = baseVoiceTextRef.current;
    const spacer = base && !base.endsWith(' ') ? ' ' : '';
    setCommentText(base ? `${base}${spacer}${transcribedText}` : transcribedText);
  }, [commentText]);

  const { isRecording, isTranscribing, toggleRecording, stopRecording } = useVoiceRecorder(
    handleVoiceTranscription,
    voiceLanguage
  );

  useEffect(() => {
    if (!isRecording && !isTranscribing) {
      baseVoiceTextRef.current = null;
    }
  }, [isRecording, isTranscribing]);

  // Inline Edit State: item ID being edited and active text
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Session-pinned newly submitted comment IDs (Fix 1: newly created top-level comments stay at top)
  const [sessionNewCommentIds, setSessionNewCommentIds] = useState([]);

  // Set of comment / reply IDs currently being deleted (Fix 2: disable repeated deletion clicks)
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Report Modal State
  const [reportingItem, setReportingItem] = useState(null); // { id, content, username, isReply }

  // Expanded reply threads: Set of comment IDs that have expanded all replies
  const [expandedThreads, setExpandedThreads] = useState(new Set());

  // Expanded 2-line comment text previews: Set of comment/reply IDs that have full text expanded
  const [expandedTextIds, setExpandedTextIds] = useState(new Set());

  const toggleTextExpand = (id) => {
    setExpandedTextIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Optimistic like reaction state map: { [commentId]: { liked: boolean, count: number } }
  const [likeState, setLikeState] = useState({});

  // Active dropdown menu for individual comments: commentId or null
  const [activeMenuCommentId, setActiveMenuCommentId] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const commentsListRef = useRef(null);

  // Close menus and popovers on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.pulse-identity-dropdown-wrap')) {
        setIdentityMenuOpen(false);
      }
      if (!e.target.closest('.pulse-sort-dropdown-wrap')) {
        setSortDropdownOpen(false);
      }
      if (!e.target.closest('.pulse-mood-popover-anchor')) {
        setShowMoodMenu(false);
      }
      if (!e.target.closest('.pulse-emoji-popover-anchor')) {
        setShowEmojiPicker(false);
      }
      if (!e.target.closest('.pulse-comment-menu-wrap')) {
        setActiveMenuCommentId(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowEmojiPicker(false);
        setShowMoodMenu(false);
        setSortDropdownOpen(false);
        setIdentityMenuOpen(false);
        setActiveMenuCommentId(null);
        if (replyingToItem) {
          setReplyingToItem(null);
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [replyingToItem]);

  // Real Image Upload Workflow
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
      const uploadedUrl = res.data?.data?.imageUrl || res.data?.imageUrl || '';
      if (uploadedUrl) {
        setAttachedImageUrl(uploadedUrl);
        addToast('Photo attached successfully.', 'success');
      } else {
        throw new Error('No image URL returned from upload.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to upload photo';
      addToast(msg, 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectMood = (mood) => {
    setShowMoodMenu(false);
    if (!commentText.includes(mood.tag)) {
      setCommentText((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${mood.tag}` : mood.tag;
      });
    }
  };

  // Cursor-aware emoji insertion
  const handleEmojiSelect = (emojiData) => {
    const emoji = emojiData?.emoji || emojiData;
    if (!emoji) return;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? commentText.length;
      const end = textarea.selectionEnd ?? commentText.length;
      const newText = commentText.slice(0, start) + emoji + commentText.slice(end);
      setCommentText(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setCommentText((prev) => prev + emoji);
    }
  };

  // Submit comment or reply via single bottom composer
  const handlePostSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      addToast('Please log in to join the discussion.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }

    const trimmed = commentText.trim();
    if (!trimmed && !attachedImageUrl) {
      addToast('Please enter your text before posting.', 'error');
      return;
    }

    if (trimmed.length > 500) {
      addToast('Message cannot exceed 500 characters.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (replyingToItem) {
        const parentCommentId = replyingToItem.parentId;
        await onReplySubmit(parentCommentId, trimmed);
        setCommentText('');
        setAttachedImageUrl('');
        setReplyingToItem(null);
        // Expand thread so new reply is immediately visible
        setExpandedThreads((prev) => new Set([...prev, parentCommentId]));
      } else {
        const created = await onCreateComment(trimmed, attachedImageUrl || null);
        if (created && created.id) {
          setSessionNewCommentIds((prev) => [
            created.id,
            ...prev.filter((id) => String(id) !== String(created.id)),
          ]);
        }
        setCommentText('');
        setAttachedImageUrl('');
        // Fix 1: Automatically scroll ONLY the discussion list to the top
        setTimeout(() => {
          if (commentsListRef.current) {
            commentsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      }
    } catch {
      // Draft text is preserved safely on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComposerKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePostSubmit();
    }
  };

  // Toggle Like on a comment or reply
  const handleToggleLike = async (commentId, initialLiked = false, initialCount = 0) => {
    if (!currentUser) {
      addToast('Please log in to react to discussions.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }

    const current = likeState[commentId] ?? {
      liked: Boolean(initialLiked),
      count: Number(initialCount) || 0,
    };

    const nextLiked = !current.liked;
    const nextCount = nextLiked ? current.count + 1 : Math.max(0, current.count - 1);

    // 1. Instant optimistic update
    setLikeState((prev) => ({
      ...prev,
      [commentId]: { liked: nextLiked, count: nextCount },
    }));

    // 2. Dispatch to backend
    try {
      if (nextLiked) {
        await apiCommentService.likeComment(commentId);
      } else {
        await apiCommentService.unlikeComment(commentId);
      }
    } catch {
      // Rollback on failure
      setLikeState((prev) => ({
        ...prev,
        [commentId]: current,
      }));
      addToast('Failed to update reaction', 'error');
    }
  };

  // Trusted server-side ownership verification with username fallback for active sessions
  const isItemOwner = (item) => {
    if (!item || !currentUser) return false;

    // 1. Direct ID matching (server user ID vs authorId / userId / user.id)
    const currentUserId = currentUser.id ?? currentUser.userId;
    const itemAuthorId = item.authorId ?? item.userId ?? item.user?.id;
    if (currentUserId !== null && currentUserId !== undefined && itemAuthorId !== null && itemAuthorId !== undefined) {
      if (String(currentUserId) === String(itemAuthorId)) {
        return true;
      }
    }

    // 2. Fallback matching via normalized handle / username (for active tokens where id was omitted in client payload)
    const rawCurrent = currentUser.username || currentUser.fullName || '';
    const cleanCurrent = rawCurrent.replace(/^@/, '').trim().toLowerCase();

    const rawAuthor = item.authorUsername || item.username || item.authorName || item.user?.username || '';
    const cleanAuthor = rawAuthor.replace(/^@/, '').trim().toLowerCase();

    if (
      cleanCurrent &&
      cleanAuthor &&
      !cleanCurrent.startsWith('anonymous') &&
      !cleanCurrent.startsWith('user_') &&
      cleanCurrent === cleanAuthor
    ) {
      return true;
    }

    return false;
  };

  // Save inline comment or reply edit
  const handleSaveEdit = async (itemId) => {
    if (!currentUser) {
      addToast('Please log in to edit discussions.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }

    const trimmed = (editingText || '').trim();
    if (!trimmed) {
      addToast('Comment content cannot be empty.', 'error');
      return;
    }

    if (trimmed.length > 500) {
      addToast('Comment cannot exceed 500 characters.', 'error');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      if (onUpdateComment) {
        await onUpdateComment(itemId, trimmed);
      } else {
        await apiCommentService.updateComment(itemId, trimmed);
      }
      setEditingItemId(null);
      setEditingText('');
    } catch {
      // Draft text preserved safely on error
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Fix 2: Immediate deletion of comment or reply without confirmation modal
  const handleImmediateDelete = async (itemId, isReply = false, parentId = null) => {
    if (!currentUser) {
      addToast('Please log in to delete discussions.', 'error');
      if (onNavigate) onNavigate('/login');
      return;
    }

    // Disable repeated deletion requests for the same comment
    if (deletingIds.has(itemId)) return;

    setActiveMenuCommentId(null);
    setDeletingIds((prev) => new Set(prev).add(itemId));

    // Remove from pinned session list if deleted
    if (!isReply) {
      setSessionNewCommentIds((prev) => prev.filter((id) => String(id) !== String(itemId)));
    }

    try {
      if (onDeleteComment) {
        await onDeleteComment(itemId, isReply, parentId);
      } else {
        await apiCommentService.deleteComment(itemId);
      }
    } catch {
      // Rollback is handled by caller (PulseDetailsPage query snapshot rollback)
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const toggleThreadExpanded = (commentId) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  // Sorting calculation (Fix 1: Session new comments pinned at index 0, followed by activeTab sorted comments)
  const sortedComments = useMemo(() => {
    const commentsById = new Map();
    comments.forEach((c) => {
      if (c && c.id !== undefined && c.id !== null) {
        commentsById.set(String(c.id), c);
      }
    });

    // Pinned session comments at the top in reverse-chronological order of session creation
    const sessionPinned = [];
    const seenPinnedIds = new Set();
    sessionNewCommentIds.forEach((id) => {
      const stringId = String(id);
      const found = commentsById.get(stringId);
      if (found && !seenPinnedIds.has(stringId)) {
        sessionPinned.push(found);
        seenPinnedIds.add(stringId);
      }
    });

    // All other comments to be sorted normally
    const regular = comments.filter((c) => c && !seenPinnedIds.has(String(c.id)));

    if (activeTab === 'LATEST') {
      regular.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (activeTab === 'MOST_LIKED') {
      regular.sort((a, b) => (Number(b.likeCount) || 0) - (Number(a.likeCount) || 0));
    } else {
      // TOP / Most Relevant: engagement score
      regular.sort((a, b) => {
        const scoreA = (Number(a.likeCount) || 0) * 2 + (a.replies?.length || 0);
        const scoreB = (Number(b.likeCount) || 0) * 2 + (b.replies?.length || 0);
        return scoreB - scoreA;
      });
    }

    return [...sessionPinned, ...regular];
  }, [comments, activeTab, sessionNewCommentIds]);

  const totalCommentCount = comments.length;

  return (
    <section
      id="pulse-discussion-section"
      className="pulse-article-discussion-panel"
      aria-label="Discussion Panel"
    >
      {/* ── 1. DISCUSSION HEADER ROW ── */}
      <div className="pulse-discussion-panel-header">
        <div className="pulse-discussion-header-left">
          <MessageSquare size={18} className="pulse-discussion-header-icon" />
          <h2 className="pulse-discussion-header-title">
            Discussion ({totalCommentCount})
          </h2>
        </div>

        {/* Anonymous selector pill */}
        <div className="pulse-identity-dropdown-wrap">
          <button
            type="button"
            className="pulse-identity-pill"
            onClick={() => setIdentityMenuOpen(!identityMenuOpen)}
            aria-expanded={identityMenuOpen}
            title="Posting identity mode"
          >
            <User size={14} className="pulse-identity-user-icon" />
            <span className="pulse-identity-label">Anonymous</span>
            <ChevronDown size={13} className="pulse-identity-chevron" />
          </button>

          {identityMenuOpen && (
            <div className="pulse-identity-menu">
              <div className="pulse-identity-option active">
                <Shield size={14} />
                <div>
                  <div className="pulse-opt-name">Anonymous Perspective</div>
                  <div className="pulse-opt-sub">Protected avatar and pseudonym</div>
                </div>
              </div>
              <div
                className="pulse-identity-option"
                onClick={() => {
                  setIdentityMenuOpen(false);
                  addToast('All Pulse comments are safely anonymized for honest dialogue.', 'info');
                }}
              >
                <Sparkles size={14} />
                <div>
                  <div className="pulse-opt-name">Public Profile</div>
                  <div className="pulse-opt-sub">Switch to visible username</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. SECTION HEADING & CLEAN SORT DROPDOWN ── */}
      <div className="pulse-discussion-sort-bar">
        <h3 className="pulse-discussion-heading">Top Comments</h3>

        {/* Right Sort Dropdown */}
        <div className="pulse-sort-dropdown-wrap">
          <button
            type="button"
            className="pulse-sort-trigger-btn"
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            aria-expanded={sortDropdownOpen}
            title="Sort comment order"
          >
            <span>
              {activeTab === 'TOP' ? 'Most Relevant' : activeTab === 'MOST_LIKED' ? 'Most Liked' : 'Latest'}
            </span>
            <ChevronDown size={13} />
          </button>

          {sortDropdownOpen && (
            <div className="pulse-sort-menu">
              <button
                type="button"
                className={`pulse-sort-option ${activeTab === 'TOP' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('TOP');
                  setSortDropdownOpen(false);
                }}
              >
                Most Relevant
              </button>
              <button
                type="button"
                className={`pulse-sort-option ${activeTab === 'MOST_LIKED' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('MOST_LIKED');
                  setSortDropdownOpen(false);
                }}
              >
                Most Liked
              </button>
              <button
                type="button"
                className={`pulse-sort-option ${activeTab === 'LATEST' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('LATEST');
                  setSortDropdownOpen(false);
                }}
              >
                Latest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. SCROLLABLE COMMENTS LIST (INDEPENDENT SCROLL) ── */}
      <div
        ref={commentsListRef}
        className="pulse-discussion-comments-list"
        role="region"
        aria-label="Comments stream"
      >
        {isLoading ? (
          <div className="pulse-comments-loading-state">
            <Loader2 size={24} className="spin-animation" color="#C4005D" />
            <span>Loading discussion...</span>
          </div>
        ) : sortedComments.length === 0 ? (
          <div className="pulse-comments-compact-empty">
            <p className="pulse-empty-text">No discussions yet. Start the conversation.</p>
          </div>
        ) : (
          sortedComments.map((comment) => {
            const commentUser = comment.username || comment.authorUsername || '@anonymous';
            const initials = getInitials(commentUser, comment.avatarInitials);
            const avatarBg = getAvatarColor(commentUser);
            const rawLikes = Number(comment.likeCount) || 0;
            const currentLike = likeState[comment.id] ?? {
              liked: Boolean(comment.likedByCurrentUser),
              count: rawLikes,
            };

            const replies = comment.replies || [];
            const hasReplies = replies.length > 0;
            const isThreadExpanded = expandedThreads.has(comment.id);
            // Hide nested replies by default; expand on toggle
            const visibleReplies = isThreadExpanded ? replies : [];

            const isOwner = isItemOwner(comment);
            const isEditingThis = editingItemId === comment.id;

            return (
              <div key={comment.id} className="pulse-comment-card-item" data-comment-id={comment.id}>
                {/* Parent Comment Row */}
                <div className="pulse-comment-row">
                  {/* Avatar */}
                  <div
                    className="pulse-comment-avatar"
                    style={{ backgroundColor: avatarBg }}
                    title={commentUser}
                  >
                    <span>{initials}</span>
                  </div>

                  {/* Comment Details */}
                  <div className="pulse-comment-content-wrap">
                    {/* Header: User, Time, Menu */}
                    <div className="pulse-comment-meta-row">
                      <div className="pulse-comment-user-box">
                        <span className="pulse-comment-username">{commentUser}</span>
                        <span className="pulse-comment-time">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>

                      {/* Comment Menu button */}
                      <div className="pulse-comment-menu-wrap">
                        <button
                          type="button"
                          className="pulse-comment-more-btn"
                          onClick={() =>
                            setActiveMenuCommentId(
                              activeMenuCommentId === comment.id ? null : comment.id
                            )
                          }
                          title="More options"
                          aria-label="Comment options"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {activeMenuCommentId === comment.id && (
                          <div className="pulse-comment-context-menu">
                            {isOwner ? (
                              <>
                                <button
                                  type="button"
                                  className="pulse-context-item"
                                  onClick={() => {
                                    setEditingItemId(comment.id);
                                    setEditingText(comment.content || comment.originalContent || '');
                                    setActiveMenuCommentId(null);
                                  }}
                                >
                                  <Edit3 size={13} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="pulse-context-item"
                                  onClick={() => {
                                    navigator.clipboard.writeText(comment.content || comment.originalContent || '');
                                    addToast('Comment copied to clipboard', 'info');
                                    setActiveMenuCommentId(null);
                                  }}
                                >
                                  <Copy size={13} />
                                  <span>Copy Text</span>
                                </button>
                                <button
                                  type="button"
                                  className="pulse-context-item danger"
                                  disabled={deletingIds.has(comment.id)}
                                  onClick={() => {
                                    handleImmediateDelete(comment.id, false, null);
                                  }}
                                >
                                  <Trash2 size={13} />
                                  <span>{deletingIds.has(comment.id) ? 'Deleting...' : 'Delete'}</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="pulse-context-item"
                                  onClick={() => {
                                    navigator.clipboard.writeText(comment.content || comment.originalContent || '');
                                    addToast('Comment copied to clipboard', 'info');
                                    setActiveMenuCommentId(null);
                                  }}
                                >
                                  <Copy size={13} />
                                  <span>Copy Text</span>
                                </button>
                                <button
                                  type="button"
                                  className="pulse-context-item danger"
                                  onClick={() => {
                                    setReportingItem({
                                      id: comment.id,
                                      content: comment.content || comment.originalContent || '',
                                      username: commentUser,
                                      isReply: false,
                                    });
                                    setActiveMenuCommentId(null);
                                  }}
                                >
                                  <Flag size={13} />
                                  <span>Report</span>
                                </button>
                                <button
                                  type="button"
                                  className="pulse-context-item"
                                  onClick={() => {
                                    addToast(`Muted perspectives from ${commentUser}`, 'info');
                                    setActiveMenuCommentId(null);
                                  }}
                                >
                                  <VolumeX size={13} />
                                  <span>Mute User</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Text Body or Inline Editor */}
                    {isEditingThis ? (
                      <div className="pulse-inline-edit-composer">
                        <textarea
                          className="pulse-inline-edit-textarea"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          maxLength={500}
                          autoFocus
                          placeholder="Edit your comment..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              handleSaveEdit(comment.id);
                            } else if (e.key === 'Escape') {
                              setEditingItemId(null);
                              setEditingText('');
                            }
                          }}
                        />
                        <div className="pulse-inline-edit-actions">
                          <span className="pulse-inline-edit-count">{editingText.length}/500</span>
                          <button
                            type="button"
                            className="pulse-inline-edit-cancel-btn"
                            disabled={isSubmittingEdit}
                            onClick={() => {
                              setEditingItemId(null);
                              setEditingText('');
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="pulse-inline-edit-save-btn"
                            disabled={isSubmittingEdit || !editingText.trim()}
                            onClick={() => handleSaveEdit(comment.id)}
                          >
                            {isSubmittingEdit ? <Loader2 size={13} className="spin-animation" /> : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <TruncatedCommentText
                        text={comment.content || comment.originalContent || ''}
                        isExpanded={expandedTextIds.has(comment.id)}
                        onToggleExpand={() => toggleTextExpand(comment.id)}
                      />
                    )}

                    {/* Photo attachment if present */}
                    {comment.imageUrl && (
                      <div className="pulse-comment-image-attachment">
                        <img
                          src={getMediaUrl(comment.imageUrl)}
                          alt="Comment attachment"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Action Bar: Reactions & Reply */}
                    <div className="pulse-comment-actions-row">
                      {/* Heart Like Action */}
                      <button
                        type="button"
                        className={`pulse-comment-action-btn ${currentLike.liked ? 'liked' : ''}`}
                        onClick={() =>
                          handleToggleLike(
                            comment.id,
                            comment.likedByCurrentUser,
                            comment.likeCount
                          )
                        }
                        title={currentLike.liked ? 'Unlike' : 'Like'}
                      >
                        <Heart
                          size={14}
                          fill={currentLike.liked ? '#E11D48' : 'none'}
                          stroke={currentLike.liked ? '#E11D48' : 'currentColor'}
                        />
                        <span>{currentLike.count > 0 ? currentLike.count : ''}</span>
                      </button>

                      {/* Reply Action: Activates Single Shared Bottom Composer */}
                      <button
                        type="button"
                        className="pulse-comment-action-btn"
                        onClick={() => {
                          if (!currentUser) {
                            addToast('Please log in to reply.', 'error');
                            if (onNavigate) onNavigate('/login');
                            return;
                          }
                          setReplyingToItem({
                            id: comment.id,
                            parentId: comment.id,
                            username: commentUser,
                          });
                          setTimeout(() => {
                            if (textareaRef.current) textareaRef.current.focus();
                          }, 50);
                        }}
                        title="Reply to comment"
                      >
                        <MessageSquare size={14} />
                        <span>
                          {hasReplies ? `• ${replies.length} replies` : 'Reply'}
                        </span>
                      </button>
                    </div>

                    {/* ── NESTED REPLIES THREAD ── */}
                    {hasReplies && (
                      <div className="pulse-nested-replies-thread">
                        <button
                          type="button"
                          className="pulse-toggle-replies-btn"
                          onClick={() => toggleThreadExpanded(comment.id)}
                          aria-expanded={isThreadExpanded}
                        >
                          <ChevronRight
                            size={12}
                            className={`pulse-expand-chevron ${isThreadExpanded ? 'expanded' : ''}`}
                          />
                          <span>
                            {isThreadExpanded
                              ? 'Hide replies'
                              : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                          </span>
                        </button>

                        {isThreadExpanded &&
                          visibleReplies.map((reply) => {
                          const replyUser = reply.username || reply.authorUsername || '@anonymous';
                          const replyInitials = getInitials(replyUser, reply.avatarInitials);
                          const replyAvatarBg = getAvatarColor(replyUser);
                          const replyLikes = Number(reply.likeCount) || 0;
                          const currentReplyLike = likeState[reply.id] ?? {
                            liked: Boolean(reply.likedByCurrentUser),
                            count: replyLikes,
                          };

                          const isReplyOwner = isItemOwner(reply);
                          const isEditingThisReply = editingItemId === reply.id;

                          return (
                            <div key={reply.id} className="pulse-reply-row">
                              {/* Sub Avatar */}
                              <div
                                className="pulse-reply-avatar"
                                style={{ backgroundColor: replyAvatarBg }}
                                title={replyUser}
                              >
                                <span>{replyInitials}</span>
                              </div>

                              <div className="pulse-reply-content-wrap">
                                <div className="pulse-comment-meta-row">
                                  <div className="pulse-comment-user-box">
                                    <span className="pulse-comment-username">{replyUser}</span>
                                    <span className="pulse-comment-time">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>

                                  {/* Reply Menu button */}
                                  <div className="pulse-comment-menu-wrap">
                                    <button
                                      type="button"
                                      className="pulse-comment-more-btn"
                                      onClick={() =>
                                        setActiveMenuCommentId(
                                          activeMenuCommentId === reply.id ? null : reply.id
                                        )
                                      }
                                      title="More options"
                                      aria-label="Reply options"
                                    >
                                      <MoreHorizontal size={15} />
                                    </button>

                                    {activeMenuCommentId === reply.id && (
                                      <div className="pulse-comment-context-menu">
                                        {isReplyOwner ? (
                                          <>
                                            <button
                                              type="button"
                                              className="pulse-context-item"
                                              onClick={() => {
                                                setEditingItemId(reply.id);
                                                setEditingText(reply.content || reply.originalContent || '');
                                                setActiveMenuCommentId(null);
                                              }}
                                            >
                                              <Edit3 size={13} />
                                              <span>Edit</span>
                                            </button>
                                            <button
                                              type="button"
                                              className="pulse-context-item"
                                              onClick={() => {
                                                navigator.clipboard.writeText(reply.content || reply.originalContent || '');
                                                addToast('Reply copied to clipboard', 'info');
                                                setActiveMenuCommentId(null);
                                              }}
                                            >
                                              <Copy size={13} />
                                              <span>Copy Text</span>
                                            </button>
                                            <button
                                              type="button"
                                              className="pulse-context-item danger"
                                              disabled={deletingIds.has(reply.id)}
                                              onClick={() => {
                                                handleImmediateDelete(reply.id, true, comment.id);
                                              }}
                                            >
                                              <Trash2 size={13} />
                                              <span>{deletingIds.has(reply.id) ? 'Deleting...' : 'Delete'}</span>
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              type="button"
                                              className="pulse-context-item"
                                              onClick={() => {
                                                navigator.clipboard.writeText(reply.content || reply.originalContent || '');
                                                addToast('Reply copied to clipboard', 'info');
                                                setActiveMenuCommentId(null);
                                              }}
                                            >
                                              <Copy size={13} />
                                              <span>Copy Text</span>
                                            </button>
                                            <button
                                              type="button"
                                              className="pulse-context-item danger"
                                              onClick={() => {
                                                setReportingItem({
                                                  id: reply.id,
                                                  content: reply.content || reply.originalContent || '',
                                                  username: replyUser,
                                                  isReply: true,
                                                });
                                                setActiveMenuCommentId(null);
                                              }}
                                            >
                                              <Flag size={13} />
                                              <span>Report</span>
                                            </button>
                                            <button
                                              type="button"
                                              className="pulse-context-item"
                                              onClick={() => {
                                                addToast(`Muted perspectives from ${replyUser}`, 'info');
                                                setActiveMenuCommentId(null);
                                              }}
                                            >
                                              <VolumeX size={13} />
                                              <span>Mute User</span>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Reply Text Body or Inline Editor */}
                                {isEditingThisReply ? (
                                  <div className="pulse-inline-edit-composer">
                                    <textarea
                                      className="pulse-inline-edit-textarea"
                                      value={editingText}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      maxLength={500}
                                      autoFocus
                                      placeholder="Edit your reply..."
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                          e.preventDefault();
                                          handleSaveEdit(reply.id);
                                        } else if (e.key === 'Escape') {
                                          setEditingItemId(null);
                                          setEditingText('');
                                        }
                                      }}
                                    />
                                    <div className="pulse-inline-edit-actions">
                                      <span className="pulse-inline-edit-count">{editingText.length}/500</span>
                                      <button
                                        type="button"
                                        className="pulse-inline-edit-cancel-btn"
                                        disabled={isSubmittingEdit}
                                        onClick={() => {
                                          setEditingItemId(null);
                                          setEditingText('');
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        className="pulse-inline-edit-save-btn"
                                        disabled={isSubmittingEdit || !editingText.trim()}
                                        onClick={() => handleSaveEdit(reply.id)}
                                      >
                                        {isSubmittingEdit ? <Loader2 size={13} className="spin-animation" /> : 'Save'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <TruncatedCommentText
                                    text={reply.content || reply.originalContent || ''}
                                    isExpanded={expandedTextIds.has(reply.id)}
                                    onToggleExpand={() => toggleTextExpand(reply.id)}
                                  />
                                )}

                                <div className="pulse-comment-actions-row">
                                  <button
                                    type="button"
                                    className={`pulse-comment-action-btn ${currentReplyLike.liked ? 'liked' : ''}`}
                                    onClick={() =>
                                      handleToggleLike(
                                        reply.id,
                                        reply.likedByCurrentUser,
                                        reply.likeCount
                                      )
                                    }
                                  >
                                    <Heart
                                      size={13}
                                      fill={currentReplyLike.liked ? '#E11D48' : 'none'}
                                      stroke={currentReplyLike.liked ? '#E11D48' : 'currentColor'}
                                    />
                                    <span>{currentReplyLike.count > 0 ? currentReplyLike.count : ''}</span>
                                  </button>

                                  {/* Reply Action: Activates Single Shared Bottom Composer */}
                                  <button
                                    type="button"
                                    className="pulse-comment-action-btn"
                                    onClick={() => {
                                      if (!currentUser) {
                                        addToast('Please log in to reply.', 'error');
                                        if (onNavigate) onNavigate('/login');
                                        return;
                                      }
                                      setReplyingToItem({
                                        id: reply.id,
                                        parentId: comment.id,
                                        username: replyUser,
                                      });
                                      setTimeout(() => {
                                        if (textareaRef.current) textareaRef.current.focus();
                                      }, 50);
                                    }}
                                  >
                                    <span>Reply</span>
                                  </button>
                                </div>
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

      {/* ── 4. BOTTOM MESSAGE COMPOSER (PERMANENTLY ANCHORED) ── */}
      <div className="pulse-discussion-bottom-composer">
        {/* Reply Strip when in Reply Mode */}
        {replyingToItem && (
          <div className="pulse-composer-reply-strip">
            <div className="pulse-composer-reply-info">
              <CornerDownRight size={13} className="pulse-reply-strip-icon" />
              <span>Replying to <strong>{replyingToItem.username}</strong></span>
            </div>
            <button
              type="button"
              className="pulse-reply-strip-cancel-btn"
              onClick={() => setReplyingToItem(null)}
              title="Cancel reply (Esc)"
              aria-label="Cancel reply"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Voice Listening / Transcribing Indicator Banner */}
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
              title="Finish voice input"
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

        <div className="pulse-composer-top-row">
          <img
            src={avatarSilhouette}
            alt="Anonymous User"
            className="pulse-composer-user-avatar"
          />

          <div className="pulse-composer-input-container">
            <textarea
              ref={textareaRef}
              id="pulse-comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              maxLength={500}
              placeholder={replyingToItem ? `Reply to ${replyingToItem.username}...` : 'Share your thoughts... (Anonymous)'}
              className="pulse-composer-textarea"
              rows={1}
            />
          </div>
        </div>

        {/* Photo Attachment Preview if selected */}
        {attachedImageUrl && (
          <div className="pulse-composer-attached-preview">
            <img
              src={getMediaUrl(attachedImageUrl)}
              alt="Attached preview"
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

        {/* Toolbar Row */}
        <div className="pulse-composer-toolbar-row">
          <div className="pulse-composer-tools-left">
            {/* Hidden File Input for Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
              disabled={isUploadingPhoto || isSubmitting}
            />

            {/* Photo Attachment Button */}
            <button
              type="button"
              className="pulse-tool-icon-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto || isSubmitting}
              title="Attach photo"
              aria-label="Attach photo"
            >
              {isUploadingPhoto ? (
                <Loader2 size={18} className="spin-animation" />
              ) : (
                <ImageIcon size={18} />
              )}
            </button>

            {/* Modern Emoji Picker Popover */}
            <div className="pulse-emoji-popover-anchor">
              <button
                type="button"
                className={`pulse-tool-icon-btn ${showEmojiPicker ? 'active' : ''}`}
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowMoodMenu(false);
                }}
                title="Insert emoji"
                aria-label="Insert emoji"
              >
                <Smile size={18} />
              </button>

              {showEmojiPicker && (
                <div className="pulse-emoji-popover-menu">
                  <EmojiPicker
                    onEmojiClick={handleEmojiSelect}
                    autoFocusSearch={false}
                    theme={Theme.LIGHT}
                    emojiStyle={EmojiStyle.NATIVE}
                    lazyLoadEmojis={true}
                    width={320}
                    height={380}
                    searchPlaceHolder="Search emojis..."
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
            </div>

            {/* Mood Perspective Popover */}
            <div className="pulse-mood-popover-anchor">
              <button
                type="button"
                className={`pulse-tool-icon-btn ${showMoodMenu ? 'active' : ''}`}
                onClick={() => {
                  setShowMoodMenu(!showMoodMenu);
                  setShowEmojiPicker(false);
                }}
                title="Tag mood perspective"
                aria-label="Tag mood perspective"
              >
                <Sparkles size={17} />
              </button>

              {showMoodMenu && (
                <div className="pulse-mood-popover-menu">
                  {AVAILABLE_MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="pulse-mood-option-btn"
                      onClick={() => handleSelectMood(m)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Microphone Button (Speech to Text) */}
            <button
              type="button"
              className={`pulse-tool-icon-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
              disabled={isTranscribing}
              title={isRecording ? 'Stop recording' : 'Voice note to text'}
              aria-label="Voice note to text"
            >
              {isRecording ? (
                <MicOff size={18} />
              ) : isTranscribing ? (
                <Loader2 size={18} className="spin-animation" />
              ) : (
                <Mic size={18} />
              )}
            </button>

            {/* Language Selector Pills for Speech Recognition */}
            <div className="pulse-voice-lang-picker" title="Speech language">
              {['EN', 'HI', 'MR'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`pulse-voice-lang-btn ${voiceLanguage === lang ? 'active' : ''}`}
                  onClick={() => setVoiceLanguage(lang)}
                  disabled={isRecording}
                  title={`Voice recognition in ${lang === 'EN' ? 'English' : lang === 'HI' ? 'Hindi' : 'Marathi'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="pulse-composer-actions-right">
            {/* Character counter */}
            <span className="pulse-composer-char-count">
              {commentText.length}/500
            </span>

            {/* Post/Reply Button */}
            <button
              type="button"
              className="pulse-composer-post-btn"
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



      {/* ── 6. REPORT MODAL ── */}
      {reportingItem && (
        <ReportModal
          isOpen={Boolean(reportingItem)}
          onClose={() => setReportingItem(null)}
          contentType={reportingItem.isReply ? 'REPLY' : 'COMMENT'}
          targetId={reportingItem.id}
          reportedContent={reportingItem.content}
          authorUsername={reportingItem.username}
        />
      )}
    </section>
  );
}
