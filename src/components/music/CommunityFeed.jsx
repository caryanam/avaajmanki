import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Trash2, Flag, LoaderCircle, Music } from 'lucide-react';
import { apiPostService } from '../../services/apiPostService.js';
import { WaveformPlayer } from './WaveformPlayer.jsx';
import { CommentList } from '../comments/CommentList.jsx';
import { CommentComposer } from '../comments/CommentComposer.jsx';
import { InitialAvatar } from './InitialAvatar.jsx';

function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffSecs = Math.floor((now - date) / 1000);

  if (diffSecs < 60) return 'Just now';
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  return `${Math.floor(diffSecs / 86400)}d ago`;
}

function FeedPostCard({ post, currentUserId, onPostDeleted, onReportPost }) {
  const [isLiked, setIsLiked] = useState(Boolean(post.isLikedByCurrentUser));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isSaved, setIsSaved] = useState(Boolean(post.isSavedByCurrentUser));
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const isOwner = currentUserId && (String(post.authorId) === String(currentUserId) || post.username === currentUserId);

  const handleToggleLike = async () => {
    try {
      if (isLiked) {
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
        await apiPostService.unlikePost(post.id);
      } else {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        await apiPostService.likePost(post.id);
      }
    } catch (err) {
      console.warn('Like toggle failed:', err);
    }
  };

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        setIsSaved(false);
        await apiPostService.unsavePost(post.id);
      } else {
        setIsSaved(true);
        await apiPostService.savePost(post.id);
      }
    } catch (err) {
      console.warn('Save toggle failed:', err);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/posts/${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiPostService.deletePost(post.id);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      alert(err?.message || 'Failed to delete post.');
    }
  };

  const audio = post.audio;

  return (
    <article className="community-post-card">
      {/* Author Header */}
      <header className="post-card-header">
        <div className="post-author-info">
          <InitialAvatar
            className="post-author-avatar"
            name={post.username}
            src={post.authorAvatar}
          />
          <div>
            <h4 className="post-author-username">@{post.username || 'anonymous'}</h4>
            <span className="post-timestamp">{formatRelativeTime(post.createdAt)}</span>
          </div>
        </div>

        {/* 3-Dot Menu */}
        <div className="post-menu-container">
          <button className="post-menu-btn" type="button" onClick={() => setShowMenu(!showMenu)} aria-label="Post actions">
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div className="post-dropdown-menu">
              {isOwner ? (
                <button className="dropdown-item dropdown-danger" type="button" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete Post
                </button>
              ) : (
                <button className="dropdown-item" type="button" onClick={() => { setShowMenu(false); if (onReportPost) onReportPost(post); }}>
                  <Flag size={14} /> Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Title & Caption Content */}
      <div className="post-content-body">
        {post.title && <h3 className="post-title">{post.title}</h3>}
        {post.originalContent && <p className="post-text">{post.originalContent}</p>}
      </div>

      {/* Waveform Player for Audio Attachment (Voice Note or Music Track) */}
      {(post.audioUrl || (audio && audio.audioUrl)) && (
        <div className="post-audio-attachment">
          <WaveformPlayer
            audioUrl={post.audioUrl || audio?.audioUrl}
            durationSeconds={audio?.durationSeconds || 0}
            waveform={audio?.waveform || audio?.waveformData || []}
            title={post.title || audio?.title || (post.type === 'VOICE_NOTE' ? 'Voice Note' : 'Community Song')}
            artistName={audio?.artistName || post.username}
            trackId={post.id}
            coverUrl={audio?.coverUrl}
          />
        </div>
      )}

      {/* Attached Image if any */}
      {post.imageUrl && (
        <div className="post-image-attachment">
          <img src={post.imageUrl} alt="Post attachment" loading="lazy" />
        </div>
      )}

      {/* Action Row - Like Only */}
      <footer className="post-action-bar">
        <div className="action-buttons-group">
          <button
            className={`action-btn ${isLiked ? 'active-like' : ''}`}
            type="button"
            onClick={handleToggleLike}
            aria-label="Like post"
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>
        </div>
      </footer>
    </article>
  );
}

export function CommunityFeed({ posts = [], isLoading, isError, onRefetch, currentUserId, onPostDeleted, onReportPost }) {
  if (isLoading) {
    return (
      <div className="community-feed-loading">
        <LoaderCircle className="music-spin" size={32} />
        <p>Loading community posts & voice notes...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="community-feed-error">
        <p>Unable to load community feed.</p>
        <button className="music-secondary" type="button" onClick={onRefetch}>
          Retry
        </button>
      </div>
    );
  }

  const audioPosts = (posts || []).filter(
    (p) => Boolean(p && (p.audioUrl || p.audio?.audioUrl || p.musicTrackId || p.type === 'VOICE_NOTE' || p.postType === 'VOICE_NOTE' || p.type === 'MUSIC'))
  );

  if (!audioPosts || audioPosts.length === 0) {
    return (
      <div className="community-feed-empty">
        <Music size={40} opacity={0.4} />
        <h3>No voice notes or music shared yet</h3>
        <p>Be the first to record a voice note or share a song with the community!</p>
      </div>
    );
  }

  return (
    <div className="community-feed-list">
      {audioPosts.map((post) => (
        <FeedPostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onPostDeleted={onPostDeleted}
          onReportPost={onReportPost}
        />
      ))}
    </div>
  );
}
