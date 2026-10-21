import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Flag,
  Copy,
  Image as ImageIcon,
  Send,
  Loader2,
  X,
  Edit2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiCommentService } from '../../services/apiCommentService.js';
import { RealtimeTimestamp } from '../../utils/formatDate.js';
import { getMediaUrl } from '../../config/env.js';
import avatarSilhouette from '../../assets/home/avatar-silhouette.jpg';

// Deterministic vibrant avatar background palette matching reference
const AVATAR_COLORS = [
  '#BE123C', // Rose Red
  '#0284C7', // Sky Blue
  '#16A34A', // Emerald Green
  '#9333EA', // Purple
  '#EA580C', // Orange
  '#0D9488', // Teal
];

function getAvatarBg(id = '') {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

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
    <div className="discussion-comment-body">
      <p
        ref={textRef}
        className={`discussion-comment-text ${isExpanded ? 'expanded' : 'clamped'}`}
      >
        {text}
      </p>
      {(canOverflow || isExpanded) && (
        <button
          type="button"
          className="comment-read-more-btn"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export function TopicDiscussionComments({
  postId,
  comments = [],
  onCommentCreated,
  onCommentDeleted,
  onReplyCreated,
  onReplyDeleted,
  onNavigate,
}) {
  const { currentUser: authUser } = useAuth();
  const currentUser = authUser || (typeof localStorage !== 'undefined' ? (JSON.parse(localStorage.getItem('auth_user') || localStorage.getItem('mka_current_user') || 'null')) : null);
  const { addToast } = useToast();

  // Sorting: 'MOST_LIKED' | 'TRENDING' | 'NEWEST'
  const [sortBy, setSortBy] = useState('MOST_LIKED');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortRef = useRef(null);

  // Composer states
  const [commentText, setCommentText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedPreview, setAttachedPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const fileInputRef = useRef(null);

  // Single active reply composer: commentId or null
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const replySubmittingRef = useRef(false);

  // Pin newly created top-level comments at top of list
  const [sessionNewIds, setSessionNewIds] = useState([]);

  // Expanded replies threads: Set of comment IDs
  const [expandedThreads, setExpandedThreads] = useState(new Set());

  // Expanded comment text IDs
  const [expandedTextIds, setExpandedTextIds] = useState(new Set());

  // Optimistic like state map: { [id]: { liked: boolean, count: number } }
  const [reactionMap, setReactionMap] = useState({});

  // Active menu dropdown ID
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
      if (!e.target.closest('.comment-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleTextExpand = (id) => {
    setExpandedTextIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleThreadExpand = (commentId) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  // Image select
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size exceeds 5MB limit.', 'error');
      return;
    }
    setAttachedImage(file);
    setAttachedPreview(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    setAttachedImage(null);
    if (attachedPreview) URL.revokeObjectURL(attachedPreview);
    setAttachedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit new top-level comment
  const handleSubmitComment = async (e) => {
    e?.preventDefault();
    if (isSubmittingRef.current) return;
    const trimmed = commentText.trim();
    if (!trimmed && !attachedImage) return;

    const activeUser = currentUser || (typeof localStorage !== 'undefined' ? (JSON.parse(localStorage.getItem('auth_user') || localStorage.getItem('mka_current_user') || 'null')) : null);
    if (!activeUser) {
      addToast('Please login to post a comment.', 'info');
      onNavigate ? onNavigate('/login') : (window.location.href = '/login');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      let createdComment;
      if (onCommentCreated) {
        createdComment = await onCommentCreated(trimmed, attachedPreview);
      } else {
        const res = await apiCommentService.createComment(postId, trimmed);
        createdComment = res?.data || res;
      }

      if (createdComment?.id) {
        setSessionNewIds((prev) => [createdComment.id, ...prev]);
      }
      setCommentText('');
      handleClearImage();
      addToast('Comment posted anonymously.', 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to post comment. Please try again.', 'error');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Submit reply to a parent comment
  const handleSubmitReply = async (commentId) => {
    if (replySubmittingRef.current) return;
    const trimmed = replyText.trim();
    if (!trimmed) return;

    if (!currentUser) {
      addToast('Please login to reply.', 'info');
      onNavigate ? onNavigate('/login') : (window.location.href = '/login');
      return;
    }

    replySubmittingRef.current = true;
    setIsSubmittingReply(true);

    try {
      if (onReplyCreated) {
        await onReplyCreated(commentId, trimmed);
      } else {
        await apiCommentService.replyToComment(commentId, trimmed);
      }
      setReplyText('');
      setReplyingToCommentId(null);
      // Auto expand thread to show new reply
      setExpandedThreads((prev) => new Set([...prev, commentId]));
      addToast('Reply added.', 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to post reply.', 'error');
    } finally {
      replySubmittingRef.current = false;
      setIsSubmittingReply(false);
    }
  };

  // Immediate delete with rollback on API failure (No extra modal)
  const handleDeleteItem = async (item, isReply = false, parentCommentId = null) => {
    setActiveMenuId(null);
    try {
      if (isReply) {
        if (onReplyDeleted) {
          await onReplyDeleted(item.id, parentCommentId);
        } else {
          await apiCommentService.deleteComment(item.id);
        }
      } else {
        if (onCommentDeleted) {
          await onCommentDeleted(item.id);
        } else {
          await apiCommentService.deleteComment(item.id);
        }
      }
      addToast('Comment deleted.', 'info');
    } catch (err) {
      addToast('Failed to delete comment.', 'error');
    }
  };

  // Toggle Reaction
  const handleToggleReaction = async (item) => {
    if (!currentUser) {
      addToast('Please login to react to comments.', 'info');
      onNavigate ? onNavigate('/login') : (window.location.href = '/login');
      return;
    }

    const currentReact = reactionMap[item.id] || {
      liked: item.userReaction === 'HEART' || item.isLikedByCurrentUser || false,
      count: item.reactions?.HEART || item.likeCount || 0,
    };

    const newLiked = !currentReact.liked;
    const newCount = Math.max(0, currentReact.count + (newLiked ? 1 : -1));

    // Optimistic update
    setReactionMap((prev) => ({
      ...prev,
      [item.id]: { liked: newLiked, count: newCount },
    }));

    try {
      if (newLiked) {
        await apiCommentService.reactToComment(item.id, 'HEART');
      } else {
        await apiCommentService.unreactToComment(item.id);
      }
    } catch {
      // Rollback on failure
      setReactionMap((prev) => ({
        ...prev,
        [item.id]: currentReact,
      }));
    }
  };

  // Sort comments list
  const sortedComments = useMemo(() => {
    const list = [...comments];
    return list.sort((a, b) => {
      // Pinned session new comments first
      const aIsPinned = sessionNewIds.includes(a.id);
      const bIsPinned = sessionNewIds.includes(b.id);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;

      if (sortBy === 'MOST_LIKED') {
        const likesA = (reactionMap[a.id]?.count ?? a.reactions?.HEART ?? a.likeCount ?? 0);
        const likesB = (reactionMap[b.id]?.count ?? b.reactions?.HEART ?? b.likeCount ?? 0);
        if (likesB !== likesA) return likesB - likesA;
      }
      if (sortBy === 'TRENDING') {
        const scoreA = (a.replies?.length || 0) * 2 + (a.reactions?.HEART || a.likeCount || 0);
        const scoreB = (b.replies?.length || 0) * 2 + (b.reactions?.HEART || b.likeCount || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [comments, sortBy, sessionNewIds, reactionMap]);

  const totalCommentCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  const currentUsername = (currentUser?.username || '').toLowerCase().replace(/^@/, '').trim();

  return (
    <section className="topic-discussion-comments-section" id="discussion-comments-area">
      {/* ── Section Header Row: Count on Left, Sort Dropdown on Right ── */}
      <div className="comments-section-header">
        <h3 className="comments-count-title">
          {totalCommentCount} {totalCommentCount === 1 ? 'Comment' : 'Comments'}
        </h3>

        <div className="comments-sort-wrapper" ref={sortRef}>
          <button
            type="button"
            className="comments-sort-trigger"
            onClick={() => setSortDropdownOpen((prev) => !prev)}
            aria-expanded={sortDropdownOpen}
          >
            <span>
              {sortBy === 'MOST_LIKED' ? 'Most Liked' : sortBy === 'TRENDING' ? 'Trending' : 'Newest'}
            </span>
            <ChevronDown size={14} className="sort-chevron-icon" />
          </button>

          {sortDropdownOpen && (
            <div className="comments-sort-dropdown">
              <button
                type="button"
                className={`sort-option-btn ${sortBy === 'MOST_LIKED' ? 'active' : ''}`}
                onClick={() => {
                  setSortBy('MOST_LIKED');
                  setSortDropdownOpen(false);
                }}
              >
                Most Liked
              </button>
              <button
                type="button"
                className={`sort-option-btn ${sortBy === 'TRENDING' ? 'active' : ''}`}
                onClick={() => {
                  setSortBy('TRENDING');
                  setSortDropdownOpen(false);
                }}
              >
                Trending
              </button>
              <button
                type="button"
                className={`sort-option-btn ${sortBy === 'NEWEST' ? 'active' : ''}`}
                onClick={() => {
                  setSortBy('NEWEST');
                  setSortDropdownOpen(false);
                }}
              >
                Newest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Compact Inline Comment Composer (matching screenshot) ── */}
      <form className="compact-comment-composer-card" onSubmit={handleSubmitComment}>
        {/* User Avatar Circle */}
        <div className="composer-user-avatar">
          {currentUser?.username ? currentUser.username.replace('@', '').charAt(0).toUpperCase() : 'A'}
        </div>

        {/* Input Text Box */}
        <div className="composer-input-wrapper">
          <input
            type="text"
            className="composer-inline-input"
            placeholder="Share your thoughts anonymously..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isSubmitting}
          />

          {/* Action Pills: [Text] and [Image] */}
          <div className="composer-action-pills">
            <span className="composer-pill-tag active">
              <Edit2 size={12} className="tag-icon" />
              <span>Text</span>
            </span>

            <button
              type="button"
              className="composer-pill-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach photo"
            >
              <ImageIcon size={14} />
              <span>Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
          </div>
        </div>

        {/* Post Button */}
        <button
          type="submit"
          className="composer-post-btn"
          disabled={isSubmitting || (!commentText.trim() && !attachedImage)}
        >
          {isSubmitting ? <Loader2 size={15} className="spin-animation" /> : 'Post'}
        </button>
      </form>

      {/* Attached image preview if any */}
      {attachedPreview && (
        <div className="composer-preview-container">
          <img src={attachedPreview} alt="Attached preview" className="composer-preview-thumb" />
          <button type="button" className="composer-preview-remove" onClick={handleClearImage}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Comments List ── */}
      <div className="comments-stream-list">
        {sortedComments.length === 0 ? (
          <div className="comments-empty-notice">
            <p>No comments yet. Be the first to share your perspective anonymously!</p>
          </div>
        ) : (
          sortedComments.map((comment) => {
            const author = (comment.username || comment.authorUsername || '').toLowerCase().replace(/^@/, '').trim();
            const isOwner = Boolean(currentUsername && author && currentUsername === author);
            const isTextExpanded = expandedTextIds.has(comment.id);
            const reactState = reactionMap[comment.id] || {
              liked: comment.userReaction === 'HEART' || comment.isLikedByCurrentUser || false,
              count: comment.reactions?.HEART || comment.likeCount || 0,
            };
            const replies = comment.replies || [];
            const isThreadExpanded = expandedThreads.has(comment.id);
            const visibleReplies = isThreadExpanded ? replies : replies.slice(0, 1);
            const remainingRepliesCount = replies.length - visibleReplies.length;

            return (
              <div key={comment.id} className="comment-thread-block">
                {/* ── Parent Comment ── */}
                <div className="comment-card-item">
                  <div className="comment-item-top">
                    <div className="comment-author-group">
                      <div
                        className="comment-avatar-circle"
                        style={{ backgroundColor: getAvatarBg(comment.id) }}
                      >
                        <img src={avatarSilhouette} alt="Avatar" className="comment-avatar-img" />
                      </div>
                      <span className="comment-author-name">
                        {comment.isAnonymous !== false ? 'Anonymous' : (comment.username || 'Anonymous')}
                      </span>
                      <span className="comment-dot">·</span>
                      <span className="comment-timestamp">
                        <RealtimeTimestamp date={comment.createdAt || new Date()} />
                      </span>
                    </div>

                    <div className="comment-menu-container">
                      <button
                        type="button"
                        className="comment-menu-btn"
                        onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                        aria-label="Comment options"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeMenuId === comment.id && (
                        <div className="comment-action-popover">
                          <button
                            type="button"
                            className="popover-action-btn"
                            onClick={() => {
                              navigator.clipboard?.writeText?.(comment.content || '');
                              addToast('Comment text copied!', 'success');
                              setActiveMenuId(null);
                            }}
                          >
                            <Copy size={13} />
                            <span>Copy Text</span>
                          </button>

                          {isOwner ? (
                            <button
                              type="button"
                              className="popover-action-btn delete-action"
                              onClick={() => handleDeleteItem(comment, false)}
                            >
                              <Trash2 size={13} />
                              <span>Delete Comment</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="popover-action-btn"
                              onClick={() => {
                                addToast('Comment reported.', 'info');
                                setActiveMenuId(null);
                              }}
                            >
                              <Flag size={13} />
                              <span>Report Comment</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Body */}
                  <TruncatedCommentText
                    text={comment.content}
                    isExpanded={isTextExpanded}
                    onToggleExpand={() => toggleTextExpand(comment.id)}
                  />

                  {/* Optional comment image */}
                  {comment.imageUrl && (
                    <div className="comment-attached-media">
                      <img
                        src={getMediaUrl(comment.imageUrl)}
                        alt="Comment media"
                        className="comment-media-thumb"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Comment Actions: Heart Reaction + Reply */}
                  <div className="comment-action-row">
                    <button
                      type="button"
                      className={`comment-react-btn ${reactState.liked ? 'active' : ''}`}
                      onClick={() => handleToggleReaction(comment)}
                    >
                      <Heart
                        size={15}
                        className={`action-heart-icon ${reactState.liked ? 'filled' : ''}`}
                        fill={reactState.liked ? '#E11D48' : 'none'}
                      />
                      <span>{reactState.count}</span>
                    </button>

                    <button
                      type="button"
                      className="comment-reply-btn"
                      onClick={() => {
                        setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id);
                        setReplyText('');
                      }}
                    >
                      <MessageSquare size={14} className="action-reply-icon" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>

                {/* ── Single Active Reply Composer Under Comment ── */}
                {replyingToCommentId === comment.id && (
                  <div className="inline-reply-composer-wrap">
                    <div className="reply-composer-inner">
                      <input
                        type="text"
                        className="reply-input-field"
                        placeholder="Write an anonymous reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        autoFocus
                      />
                      <div className="reply-composer-actions">
                        <button
                          type="button"
                          className="reply-cancel-btn"
                          onClick={() => {
                            setReplyingToCommentId(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="reply-send-btn"
                          disabled={isSubmittingReply || !replyText.trim()}
                          onClick={() => handleSubmitReply(comment.id)}
                        >
                          {isSubmittingReply ? (
                            <Loader2 size={13} className="spin-animation" />
                          ) : (
                            'Reply'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Nested Replies (Indented with connector line) ── */}
                {replies.length > 0 && (
                  <div className="replies-nested-container">
                    {visibleReplies.map((reply) => {
                      const replyAuthor = (reply.username || reply.authorUsername || '').toLowerCase().replace(/^@/, '').trim();
                      const isReplyOwner = Boolean(currentUsername && replyAuthor && currentUsername === replyAuthor);
                      const isReplyTextExpanded = expandedTextIds.has(reply.id);
                      const replyReactState = reactionMap[reply.id] || {
                        liked: reply.userReaction === 'HEART' || reply.isLikedByCurrentUser || false,
                        count: reply.reactions?.HEART || reply.likeCount || 0,
                      };

                      return (
                        <div key={reply.id} className="nested-reply-item">
                          <div className="comment-item-top">
                            <div className="comment-author-group">
                              <div
                                className="comment-avatar-circle small"
                                style={{ backgroundColor: getAvatarBg(reply.id) }}
                              >
                                <img src={avatarSilhouette} alt="Avatar" className="comment-avatar-img" />
                              </div>
                              <span className="comment-author-name">
                                {reply.isAnonymous !== false ? 'Anonymous' : (reply.username || 'Anonymous')}
                              </span>
                              <span className="comment-dot">·</span>
                              <span className="comment-timestamp">
                                <RealtimeTimestamp date={reply.createdAt || new Date()} />
                              </span>
                            </div>

                            <div className="comment-menu-container">
                              <button
                                type="button"
                                className="comment-menu-btn"
                                onClick={() => setActiveMenuId(activeMenuId === reply.id ? null : reply.id)}
                                aria-label="Reply options"
                              >
                                <MoreHorizontal size={15} />
                              </button>

                              {activeMenuId === reply.id && (
                                <div className="comment-action-popover">
                                  {isReplyOwner ? (
                                    <button
                                      type="button"
                                      className="popover-action-btn delete-action"
                                      onClick={() => handleDeleteItem(reply, true, comment.id)}
                                    >
                                      <Trash2 size={13} />
                                      <span>Delete Reply</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="popover-action-btn"
                                      onClick={() => {
                                        addToast('Reply reported.', 'info');
                                        setActiveMenuId(null);
                                      }}
                                    >
                                      <Flag size={13} />
                                      <span>Report Reply</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <TruncatedCommentText
                            text={reply.content}
                            isExpanded={isReplyTextExpanded}
                            onToggleExpand={() => toggleTextExpand(reply.id)}
                          />

                          <div className="comment-action-row">
                            <button
                              type="button"
                              className={`comment-react-btn ${replyReactState.liked ? 'active' : ''}`}
                              onClick={() => handleToggleReaction(reply)}
                            >
                              <Heart
                                size={14}
                                className={`action-heart-icon ${replyReactState.liked ? 'filled' : ''}`}
                                fill={replyReactState.liked ? '#E11D48' : 'none'}
                              />
                              <span>{replyReactState.count}</span>
                            </button>

                            <button
                              type="button"
                              className="comment-reply-btn"
                              onClick={() => {
                                setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id);
                                setReplyText(`@Anonymous `);
                              }}
                            >
                              <MessageSquare size={13} className="action-reply-icon" />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* View more replies toggle */}
                    {remainingRepliesCount > 0 && (
                      <button
                        type="button"
                        className="view-more-replies-btn"
                        onClick={() => toggleThreadExpand(comment.id)}
                      >
                        View {remainingRepliesCount} more {remainingRepliesCount === 1 ? 'reply' : 'replies'}
                      </button>
                    )}
                    {isThreadExpanded && replies.length > 1 && (
                      <button
                        type="button"
                        className="view-more-replies-btn collapse-btn"
                        onClick={() => toggleThreadExpand(comment.id)}
                      >
                        Hide replies
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
