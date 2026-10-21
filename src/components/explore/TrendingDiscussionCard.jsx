import React, { useState } from 'react';
import { 
  ArrowUp, MessageCircle, Bookmark, MoreHorizontal, ArrowRight, Leaf, Heart, Briefcase, Home, TrendingUp, BookOpen
} from 'lucide-react';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getMediaUrl } from '../../config/env.js';
import { RealtimeTimestamp } from '../../utils/formatDate.js';
import avatarSilhouette from '../../assets/home/avatar-silhouette.jpg';

// Photography assets for topic-contextual fallbacks matching approved reference
import topicLove from '../../assets/explore/topic-love.jpg';
import topicLifeWork from '../../assets/explore/topic-life-work.jpg';
import topicMentalHealth from '../../assets/explore/mental-health-cover.jpg';
import topicFamily from '../../assets/explore/topic-family.jpg';
import topicEducation from '../../assets/explore/education-cover.jpg';
import topicMotivation from '../../assets/explore/motivation-cover.jpg';
import topicRelationships from '../../assets/explore/relationships-cover.jpg';
import topicFriendship from '../../assets/explore/friendship-cover.jpg';

export function TrendingDiscussionCard({ post, onNavigate }) {
  const { reactToPost, toggleSavePost, savedPostIds = [] } = usePosts();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [imageFailed, setImageFailed] = useState(false);

  if (!post) return null;

  const postId = post.id;
  const isSaved = savedPostIds.includes(postId);
  const heartCount = post.reactions?.HEART || post.likeCount || post.likesCount || 0;
  const userHasHeart = post.userReaction === 'HEART' || post.isLikedByCurrentUser;
  const commentCount = post.commentsCount ?? post.commentCount ?? 0;

  const username = post.username || post.authorUsername || '@anonymous';
  const rawTopic = post.subtopic || post.topicName || post.topic || 'Mental Health';
  const topicLabel = String(rawTopic).replace(/_/g, ' ');

  const formattedHeartCount =
    typeof heartCount === 'number'
      ? heartCount >= 1000
        ? (heartCount / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
        : heartCount
      : heartCount;

  const handleReact = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      addToast('Please login to react to discussions.', 'info');
      onNavigate ? onNavigate('/login') : (window.location.href = '/login');
      return;
    }
    reactToPost(postId, 'HEART');
  };

  const handleBookmark = (e) => {
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
    navigator.clipboard?.writeText?.(window.location.origin + `/post/${postId}`);
    addToast('Discussion link copied to clipboard!', 'success');
  };

  const handleJoinDiscussion = (e) => {
    e.stopPropagation();
    onNavigate ? onNavigate(`/post/${postId}`) : (window.location.href = `/post/${postId}`);
  };

  // Dynamic topic badge styling & icon
  const getTopicMeta = (t) => {
    const key = String(t).toUpperCase();
    if (key.includes('MENTAL') || key.includes('ANXIETY') || key.includes('FEELING') || key.includes('OVERTHINK')) {
      return { bg: '#DCFCE7', color: '#15803D', Icon: Leaf };
    }
    if (key.includes('WORK') || key.includes('CAREER') || key.includes('JOB') || key.includes('PRODUCTIV')) {
      return { bg: '#E0F2FE', color: '#0369A1', Icon: Briefcase };
    }
    if (key.includes('LOVE') || key.includes('RELATION') || key.includes('BREAKUP')) {
      return { bg: '#FFE4E6', color: '#BE123C', Icon: Heart };
    }
    if (key.includes('FAMILY') || key.includes('PARENT')) {
      return { bg: '#FFEDD5', color: '#C2410C', Icon: Home };
    }
    if (key.includes('GROWTH') || key.includes('MOTIVAT')) {
      return { bg: '#FFE4E6', color: '#E11D48', Icon: TrendingUp };
    }
    if (key.includes('EDUCAT') || key.includes('STUDENT') || key.includes('COLLEGE')) {
      return { bg: '#E0F2FE', color: '#0284C7', Icon: BookOpen };
    }
    if (key.includes('MUSIC') || key.includes('ENTERTAIN') || key.includes('SONG')) {
      return { bg: '#FEF3C7', color: '#B45309', Icon: MessageCircle };
    }
    return { bg: '#F1F5F9', color: '#475569', Icon: MessageCircle };
  };

  const getTopicFallbackImage = (t) => {
    const k = String(t || '').toUpperCase();
    if (k.includes('MENTAL') || k.includes('ANXIETY') || k.includes('SLEEP') || k.includes('OVERTHINK')) {
      return topicMentalHealth;
    }
    if (k.includes('WORK') || k.includes('CAREER') || k.includes('JOB') || k.includes('PRODUCTIV')) {
      return topicLifeWork;
    }
    if (k.includes('LOVE') || k.includes('RELATION') || k.includes('BREAKUP')) {
      return topicRelationships;
    }
    if (k.includes('FAMILY') || k.includes('PARENT')) {
      return topicFamily;
    }
    if (k.includes('EDUCAT') || k.includes('COLLEGE') || k.includes('STUDENT')) {
      return topicEducation;
    }
    if (k.includes('MOTIVAT') || k.includes('GROWTH')) {
      return topicMotivation;
    }
    if (k.includes('FRIEND')) {
      return topicFriendship;
    }
    if (k.includes('MUSIC') || k.includes('ENTERTAIN')) {
      return topicLifeWork;
    }
    return topicMentalHealth;
  };

  const { bg: topicBg, color: topicColor, Icon: TopicIcon } = getTopicMeta(rawTopic);
  const resolvedImageUrl = post.imageUrl ? getMediaUrl(post.imageUrl) : null;
  const finalMediaUrl = (resolvedImageUrl && !imageFailed) ? resolvedImageUrl : getTopicFallbackImage(rawTopic);

  // Compute contextual hashtag pills
  const getHashtags = () => {
    if (Array.isArray(post.tags) && post.tags.length > 0) {
      return post.tags.map((t) => t.replace(/^#/, ''));
    }
    const tags = [];
    const top = String(post.topic || '').trim();
    const sub = String(post.subtopic || '').trim();
    if (sub && sub !== top) tags.push(sub.replace(/\s+/g, ''));
    if (top && top !== 'GENERAL') tags.push(top.replace(/\s+/g, ''));

    const key = (top + ' ' + sub + ' ' + (post.title || '')).toUpperCase();
    if (key.includes('MENTAL') || key.includes('OVERTHINK') || key.includes('ANXIETY')) {
      tags.push('Anxiety', 'Overthinking', 'Sleep', 'MentalHealth');
    } else if (key.includes('LOVE') || key.includes('RELATION')) {
      tags.push('Breakup', 'Healing', 'MovingOn', 'Relationships');
    } else if (key.includes('WORK') || key.includes('JOB') || key.includes('PRODUCTIV')) {
      tags.push('Productivity', 'WorkFromHome', 'Discipline', 'Career');
    } else if (key.includes('FAMILY')) {
      tags.push('Family', 'Home', 'LifeReflections');
    } else {
      tags.push('Anonymous', 'RealThoughts');
    }
    return Array.from(new Set(tags)).slice(0, 4);
  };

  const hashtags = getHashtags();
  const discussingCount = Math.max(15, (commentCount || 0) * 4 + 48);

  return (
    <article 
      className="trending-discussion-card"
      onClick={() => onNavigate ? onNavigate(`/post/${postId}`) : (window.location.href = `/post/${postId}`)}
    >
      {/* 1. Left Vote / Upvote Column */}
      <div 
        className={`discussion-vote-box ${userHasHeart ? 'voted' : ''}`}
        onClick={handleReact}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleReact(e);
          }
        }}
        title={userHasHeart ? 'Upvoted' : 'Upvote discussion'}
      >
        <ArrowUp size={16} strokeWidth={2.8} className="vote-arrow-icon" />
        <span className="vote-count-text">{formattedHeartCount}</span>
      </div>

      {/* 2. Main Discussion Area */}
      <div className="discussion-main-col">
        {/* Header: Author Avatar, Topic Pill, Timestamp, Menu */}
        <div className="discussion-card-header">
          <div className="discussion-header-left">
            <div className="discussion-author-avatar">
              <img
                src={(post.avatarUrl || post.authorAvatarUrl) ? getMediaUrl(post.avatarUrl || post.authorAvatarUrl) : avatarSilhouette}
                alt={username}
                onError={(e) => { e.currentTarget.src = avatarSilhouette; }}
              />
            </div>

            <span 
              className="discussion-topic-badge" 
              style={{ backgroundColor: topicBg, color: topicColor }}
            >
              <span>{topicLabel}</span>
            </span>

            <span className="discussion-meta-dot">•</span>

            <span className="discussion-timestamp">
              <RealtimeTimestamp date={post.createdAt} />
            </span>
          </div>

          <div className="discussion-header-right">
            <button
              type="button"
              className="discussion-icon-btn"
              onClick={handleShare}
              title="Share discussion"
            >
              <MoreHorizontal size={17} color="#64748B" />
            </button>
          </div>
        </div>

        {/* Content Body with Right Photographic Thumbnail */}
        <div className="discussion-content-row">
          <div className="discussion-text-col">
            {post.title && (
              <h3 className="discussion-title">
                {post.title}
              </h3>
            )}
            <p className="discussion-snippet">
              {post.content || post.description || ''}
            </p>

            {/* Hashtag Pills */}
            {hashtags.length > 0 && (
              <div className="discussion-tags-row">
                {hashtags.map((tag) => (
                  <span key={tag} className="discussion-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Image Thumbnail */}
          {finalMediaUrl && (
            <div className="discussion-media-thumb">
              <img
                src={finalMediaUrl}
                alt="Discussion thumbnail"
                className="discussion-media-img"
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            </div>
          )}
        </div>

        {/* Footer: Comments Count + Participant Stack + Join Discussion Action */}
        <div className="discussion-card-footer">
          <div className="discussion-footer-meta">
            <button
              type="button"
              className="discussion-comment-count-btn"
              onClick={handleJoinDiscussion}
              title="View comments"
            >
              <MessageCircle size={15} color="#64748B" />
              <span>{commentCount} comments</span>
            </button>

            {/* Participant Stack */}
            <div className="discussion-participant-group">
              <div className="discussion-participant-stack" aria-hidden="true">
                <span className="stacked-avatar stack-1">👤</span>
                <span className="stacked-avatar stack-2">🧔</span>
                <span className="stacked-avatar stack-3">👩</span>
              </div>
              <span className="discussion-participant-text">
                +{discussingCount} people are discussing
              </span>
            </div>
          </div>

          <div className="discussion-footer-actions">
            <button
              type="button"
              className={`discussion-icon-btn ${isSaved ? 'active' : ''}`}
              onClick={handleBookmark}
              title={isSaved ? 'Remove bookmark' : 'Save discussion'}
            >
              <Bookmark
                size={16}
                fill={isSaved ? '#E11D48' : 'none'}
                color={isSaved ? '#E11D48' : '#64748B'}
              />
            </button>

            {/* Join Discussion Action Pill */}
            <button
              type="button"
              className="join-discussion-action-btn"
              onClick={handleJoinDiscussion}
              title="Join this conversation"
            >
              <span>Join Discussion</span>
              <ArrowRight size={13} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

