import React, { useState } from 'react';
import { 
  Heart, MessageSquare, Bookmark, Share2, MoreHorizontal 
} from 'lucide-react';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getMediaUrl } from '../../config/env.js';
import { RealtimeTimestamp } from '../../utils/formatDate.js';
import { CommentList } from '../comments/CommentList.jsx';
import { CommentComposer } from '../comments/CommentComposer.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import postImageFallback from '../../assets/home/post-image-fallback.jpg';
import avatarSilhouette from '../../assets/home/avatar-silhouette.jpg';

export function CommunityPostCard({ post, onNavigate }) {
  const { reactToPost, toggleSavePost, savedPostIds = [] } = usePosts();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { commentsByPost = {}, createComment } = useComments();

  const [showComments, setShowComments] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  if (!post) return null;

  const postId = post.id;
  const isSaved = savedPostIds.includes(postId);
  const postComments = commentsByPost[postId] || [];
  const commentCount = postComments.length > 0 ? postComments.length : (post.commentCount || 0);

  // Total reactions count or heart count
  const heartCount = post.reactions?.RELATE || post.reactions?.HEART || post.likeCount || 0;
  const userHasHeart = post.userReaction === 'RELATE' || post.userReaction === 'HEART';

  const handleReact = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      addToast('Please login to react to posts.', 'info');
      onNavigate('/login');
      return;
    }
    reactToPost(postId, 'RELATE');
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      addToast('Please login to bookmark posts.', 'info');
      onNavigate('/login');
      return;
    }
    toggleSavePost(postId);
    addToast(isSaved ? 'Removed from bookmarks.' : 'Saved to bookmarks!', 'success');
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText?.(window.location.origin + `/post/${postId}`);
    addToast('Post link copied to clipboard!', 'success');
  };

  const rawTopic = post.subtopic || post.topicName || post.topic || 'GENERAL';
  const topicLabel = String(rawTopic).replace(/_/g, ' ');

  const username = post.username || post.authorUsername || '@anonymous';

  // Topic badge colors
  const getTopicStyle = (t) => {
    const key = String(t).toUpperCase();
    if (key.includes('MENTAL') || key.includes('FEELING')) {
      return { background: '#F3E8FF', color: '#7E22CE' };
    }
    if (key.includes('WORK') || key.includes('TECH')) {
      return { background: '#EFF6FF', color: '#2563EB' };
    }
    if (key.includes('LOVE') || key.includes('SHAYARI')) {
      return { background: '#FDF2F8', color: '#DB2777' };
    }
    if (key.includes('MOTIVATION') || key.includes('HEALTH')) {
      return { background: '#ECFDF5', color: '#059669' };
    }
    if (key.includes('SOCIETY') || key.includes('POLITIC')) {
      return { background: '#FFF7ED', color: '#EA580C' };
    }
    return { background: '#F1F5F9', color: '#475569' };
  };

  const topicStyle = getTopicStyle(rawTopic);

  // Real or attached image
  const rawImageUrl = post.imageUrl;
  const resolvedImageUrl = rawImageUrl ? getMediaUrl(rawImageUrl) : null;

  return (
    <article className="community-post-card">
      {/* 1. Header Row */}
      <div className="post-header-row">
        <div className="post-author-group">
          {/* Avatar */}
          <div className="post-avatar">
            <img
              src={(post.avatarUrl || post.authorAvatarUrl) ? getMediaUrl(post.avatarUrl || post.authorAvatarUrl) : avatarSilhouette}
              alt={username}
              onError={(e) => { e.currentTarget.src = avatarSilhouette; }}
            />
          </div>

          {/* Author Handle, Time & Topic Badge */}
          <div className="post-author-meta">
            <span
              className="post-author-handle"
              onClick={() => onNavigate(`/profile/${username.replace('@', '')}`)}
              style={{ cursor: 'pointer' }}
            >
              {username}
            </span>
            <span className="post-timestamp">
              <RealtimeTimestamp date={post.createdAt} />
            </span>
            <span className="post-topic-badge" style={topicStyle}>
              {topicLabel}
            </span>
          </div>
        </div>

        {/* Options Button */}
        <button
          type="button"
          className="post-menu-btn"
          onClick={handleShare}
          title="Share post"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* 2. Post Title (if present) & Body Content */}
      {post.title && (
        <h4 style={{ fontSize: '15.5px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          {post.title}
        </h4>
      )}
      <p className="post-content-text">
        {post.content || post.description}
      </p>

      {/* 3. Media Image Attachment (if present) */}
      {(resolvedImageUrl && !imageFailed) ? (
        <div className="post-attachment-wrap">
          <img
            src={resolvedImageUrl}
            alt="Attached content"
            className="post-attachment-img"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : post.hasSampleMedia ? (
        <div className="post-attachment-wrap">
          <img
            src={postImageFallback}
            alt="Attached media"
            className="post-attachment-img"
          />
        </div>
      ) : null}

      {/* 4. Action Bar (Reactions, Comments, Bookmark, Share) */}
      <div className="post-actions-bar">
        <div className="post-reactions-left">
          {/* Heart / Like */}
          <button
            type="button"
            className={`post-action-btn ${userHasHeart ? 'active' : ''}`}
            onClick={handleReact}
          >
            <Heart size={16} fill={userHasHeart ? 'var(--primary-pink)' : 'none'} color={userHasHeart ? 'var(--primary-pink)' : 'currentColor'} />
            <span>{heartCount}</span>
          </button>

          {/* Comments */}
          <button
            type="button"
            className="post-action-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare size={16} />
            <span>{commentCount}</span>
          </button>

          {/* Bookmark */}
          <button
            type="button"
            className={`post-action-btn ${isSaved ? 'active' : ''}`}
            onClick={handleBookmark}
          >
            <Bookmark size={16} fill={isSaved ? 'var(--primary-pink)' : 'none'} color={isSaved ? 'var(--primary-pink)' : 'currentColor'} />
            <span>{isSaved ? 1 : 0}</span>
          </button>
        </div>

        {/* Share and More buttons */}
        <div className="post-actions-right">
          <button
            type="button"
            className="post-action-btn"
            onClick={handleShare}
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
          <button
            type="button"
            className="post-action-btn post-action-icon-only"
            onClick={handleShare}
            title="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* 5. Inline Expandable Comments Stream */}
      {showComments && (
        <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9', marginTop: '6px' }}>
          <CommentList
            postId={postId}
            postAuthorUsername={username}
            onNavigate={onNavigate}
            activeReplyCommentId={activeReplyId}
            onReplyStateChange={setActiveReplyId}
          />

          {!activeReplyId && (
            <div style={{ marginTop: '10px' }}>
              <CommentComposer
                postId={postId}
                postAuthorUsername={username}
                enableImage={true}
                onSubmit={async (text, imageUrl) => {
                  await createComment(postId, text, username, imageUrl);
                }}
                onNavigate={onNavigate}
                placeholder="Write a comment..."
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}
