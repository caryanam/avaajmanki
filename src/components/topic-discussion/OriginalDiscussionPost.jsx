import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, Flag, Trash2, Edit3, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getMediaUrl } from '../../config/env.js';
import { RealtimeTimestamp } from '../../utils/formatDate.js';
import avatarSilhouette from '../../assets/home/avatar-silhouette.jpg';

export function OriginalDiscussionPost({ post, onNavigate, onCommentsClick }) {
  const { currentUser: authUser } = useAuth();
  const currentUser = authUser || (typeof localStorage !== 'undefined' ? (JSON.parse(localStorage.getItem('auth_user') || localStorage.getItem('mka_current_user') || 'null')) : null);
  const { reactToPost, toggleSavePost, savedPostIds = [], deletePost } = usePosts();
  const { addToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef(null);

  if (!post) return null;

  const postId = post.id;
  const isSaved = savedPostIds.includes(postId);
  const heartCount = post.reactions?.HEART || post.likeCount || post.likesCount || 0;
  const userHasHeart = post.userReaction === 'HEART' || post.isLikedByCurrentUser;
  const commentCount = post.commentsCount ?? post.commentCount ?? 0;

  const currentUsername = (currentUser?.username || '').toLowerCase().replace(/^@/, '').trim();
  const postAuthor = (post.username || post.authorUsername || '').toLowerCase().replace(/^@/, '').trim();
  const isOwner = Boolean(currentUsername && postAuthor && currentUsername === postAuthor);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const handleReact = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      addToast('Please login to react to discussions.', 'info');
      onNavigate ? onNavigate('/login') : (window.location.href = '/login');
      return;
    }
    reactToPost(postId, 'HEART');
  };

  const handleSave = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      addToast('Please login to bookmark discussions.', 'info');
      onNavigate ? onNavigate('/login') : (window.location.href = '/login');
      return;
    }
    toggleSavePost(postId);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      addToast('Discussion link copied to clipboard!', 'success');
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    try {
      await deletePost(postId);
      addToast('Discussion deleted.', 'info');
      if (onNavigate) onNavigate('/explore');
    } catch {
      addToast('Could not delete discussion.', 'error');
    }
  };

  // Determine hashtag/topic label
  const rawTag = post.hashtag || post.subtopic || post.topicName || post.topic || 'Anxiety';
  const displayTag = String(rawTag).startsWith('#') ? rawTag : `#${String(rawTag).replace(/\s+/g, '')}`;

  const formattedHeartCount =
    typeof heartCount === 'number'
      ? heartCount >= 1000
        ? (heartCount / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
        : heartCount
      : heartCount;

  const formattedCommentCount =
    typeof commentCount === 'number'
      ? commentCount >= 1000
        ? (commentCount / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
        : commentCount
      : commentCount;

  return (
    <article className="original-discussion-post-card" aria-label="Original Discussion Post">
      {/* Top Row: Anonymous Avatar + Username + Timestamp + More Menu */}
      <div className="post-header-row">
        <div className="post-author-info">
          <div className="post-author-avatar-wrap">
            <img
              src={avatarSilhouette}
              alt="Anonymous author"
              className="post-author-avatar"
            />
          </div>
          <div className="post-author-meta">
            <span className="post-author-name">
              {post.isAnonymous !== false ? 'Anonymous' : (post.username || 'Anonymous')}
            </span>
            <span className="post-meta-dot">·</span>
            <span className="post-timestamp">
              <RealtimeTimestamp date={post.createdAt || new Date()} />
            </span>
          </div>
        </div>

        <div className="post-menu-container" ref={menuRef}>
          <button
            type="button"
            className="post-menu-trigger"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Discussion options"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div className="post-dropdown-menu">
              <button
                type="button"
                className="post-dropdown-item"
                onClick={() => {
                  handleShare({ stopPropagation: () => {} });
                  setMenuOpen(false);
                }}
              >
                <Copy size={14} />
                <span>Copy Link</span>
              </button>

              {isOwner ? (
                <button
                  type="button"
                  className="post-dropdown-item delete-item"
                  onClick={handleDelete}
                >
                  <Trash2 size={14} />
                  <span>Delete Post</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="post-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    addToast('Post reported to moderators.', 'info');
                  }}
                >
                  <Flag size={14} />
                  <span>Report Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Title */}
      {post.title && (
        <h2 className="original-post-title">{post.title}</h2>
      )}

      {/* Hashtag / Topic Pill */}
      <div className="post-tag-container">
        <span className="post-topic-tag-pill">{displayTag}</span>
      </div>

      {/* Post Body Content */}
      <div className="original-post-body">
        {post.content ? (
          post.content.split('\n\n').map((para, index) => (
            <p key={index} className="post-body-paragraph">
              {para}
            </p>
          ))
        ) : (
          <p className="post-body-paragraph">
            No matter how tired I am, my mind keeps thinking about past mistakes, future worries and random things. It's affecting my sleep and next day I feel exhausted. How do you stop overthinking and actually rest?
          </p>
        )}
      </div>

      {/* Optional Attached Media */}
      {post.imageUrl && !imgError && (
        <div className="post-media-wrap">
          <img
            src={getMediaUrl(post.imageUrl)}
            alt="Attached discussion media"
            className="post-media-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
      )}

      {/* Bottom Actions Row: Heart Reaction, Comments, Bookmark, Share */}
      <div className="post-action-bar">
        <div className="post-actions-left">
          <button
            type="button"
            className={`post-action-btn heart-btn ${userHasHeart ? 'active' : ''}`}
            onClick={handleReact}
            aria-label={`${formattedHeartCount} hearts`}
          >
            <Heart
              size={18}
              className={`action-icon heart-icon ${userHasHeart ? 'filled' : ''}`}
              fill={userHasHeart ? '#E11D48' : 'none'}
            />
            <span className="action-count">{formattedHeartCount}</span>
          </button>

          <button
            type="button"
            className="post-action-btn comment-btn"
            onClick={onCommentsClick}
            aria-label={`${formattedCommentCount} comments`}
          >
            <MessageSquare size={17} className="action-icon" />
            <span className="action-count">{formattedCommentCount}</span>
          </button>

          <button
            type="button"
            className={`post-action-btn bookmark-btn ${isSaved ? 'active' : ''}`}
            onClick={handleSave}
            aria-label={isSaved ? 'Saved' : 'Save discussion'}
          >
            <Bookmark
              size={17}
              className="action-icon"
              fill={isSaved ? '#6F405F' : 'none'}
            />
            <span className="action-count">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        <div className="post-actions-right">
          <button
            type="button"
            className="post-action-btn share-btn"
            onClick={handleShare}
            aria-label="Share discussion"
          >
            <Share2 size={17} className="action-icon" />
            <span className="action-count">Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}
