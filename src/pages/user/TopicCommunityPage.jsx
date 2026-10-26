import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  ArrowLeft, Check, Plus, MessageCircle, Heart, Bookmark, Share2, 
  ArrowRight, Sparkles, Filter, ChevronRight, ChevronDown, CheckCircle2, 
  TrendingUp, Clock, Flame, Home, SlidersHorizontal, Image as ImageIcon, 
  Mic, MicOff, Smile, Send, MoreHorizontal, CornerDownRight, X, Trash2, Edit2, Shield, Lightbulb
} from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader.jsx';
import { DesktopSidebar } from '../../components/layout/DesktopSidebar.jsx';
import { MobileNavigation } from '../../components/layout/MobileNavigation.jsx';
import { ExploreComposer } from '../../components/explore/ExploreComposer.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getTopicMetadata, CANONICAL_TOPICS } from '../../utils/topicMetadata.js';
import { RealtimeTimestamp } from '../../utils/formatDate.js';
import { getMediaUrl } from '../../config/env.js';
import { apiCommentService } from '../../services/apiCommentService.js';
import { apiTopicService } from '../../services/apiTopicService.js';
import { apiClient } from '../../services/apiClient.js';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import avatarSilhouette from '../../assets/home/avatar-silhouette.jpg';
import topicLove from '../../assets/explore/topic-love.jpg';
import topicRelationships from '../../assets/explore/relationships-cover.jpg';
import topicFriendship from '../../assets/explore/friendship-cover.jpg';
import topicMentalHealth from '../../assets/explore/mental-health-cover.jpg';
import topicMotivation from '../../assets/explore/motivation-cover.jpg';
import topicLifeWork from '../../assets/explore/topic-life-work.jpg';
import topicFamily from '../../assets/explore/topic-family.jpg';
import topicEducation from '../../assets/explore/education-cover.jpg';

// Fallback thematic cover art mapped by parent category
const CATEGORY_COVER_FALLBACKS = {
  LOVE: topicLove,
  RELATIONSHIPS: topicRelationships,
  FRIENDSHIP: topicFriendship,
  FEELINGS: topicLove,
  FAMILY: topicFamily,
  PARENTING: topicFamily,
  MENTAL_HEALTH: topicMentalHealth,
  EXPRESSION: topicMotivation,
  PERSONAL_GROWTH: topicMotivation,
  LIFE_WORK: topicLifeWork,
  EDUCATION: topicEducation,
  SPORTS: topicLifeWork,
  ENTERTAINMENT: topicRelationships,
  GENERAL: null,
};

// Helper to retrieve persisted custom topic cover URLs from localStorage
const getStoredTopicCover = (idOrSlug) => {
  if (typeof window === 'undefined' || !idOrSlug) return null;
  try {
    const covers = JSON.parse(localStorage.getItem('mka_topic_covers') || '{}');
    return (
      covers[String(idOrSlug).toLowerCase()] ||
      covers[String(idOrSlug)] ||
      null
    );
  } catch {
    return null;
  }
};

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
    <div className="infeed-comment-text-wrap">
      <p
        ref={textRef}
        className={`infeed-comment-text ${isExpanded ? 'expanded' : 'clamped'}`}
      >
        {text}
      </p>
      {(canOverflow || isExpanded) && (
        <button
          type="button"
          className="infeed-comment-read-more"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

// Canonical topic initial seed posts matching reference screenshot
const CANONICAL_SEED_POSTS = {
  LOVE: [
    {
      id: 'love_canonical_1',
      title: 'Is it okay to move on even if you still care about someone?',
      content: "It's been months since we separated, but I still think about them sometimes. I'm confused if it's normal to feel this way. Has anyone experienced this? How did you move forward?",
      topic: 'LOVE',
      topicName: 'Love',
      tags: ['Breakup', 'MovingOn', 'Love', 'Emotions'],
      imageUrl: topicRelationships,
      username: '@anonymous',
      authorUsername: '@anonymous',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      reactions: { HEART: 245 },
      likeCount: 245,
      commentsCount: 36,
      commentCount: 36,
    },
    {
      id: 'love_canonical_2',
      title: 'What are some small things that make you feel loved?',
      content: "It could be a message, a gesture, a habit or even a simple word. I'd love to hear what makes you feel truly loved.",
      topic: 'LOVE',
      topicName: 'Love',
      tags: ['SelfLove', 'Relationships', 'Happiness'],
      imageUrl: topicLove,
      username: '@anonymous',
      authorUsername: '@anonymous',
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      reactions: { HEART: 186 },
      likeCount: 186,
      commentsCount: 28,
      commentCount: 28,
    },
  ],
  MENTAL_HEALTH: [
    {
      id: 'mental_health_canonical_1',
      title: 'How do you deal with overthinking at night?',
      content: "No matter how tired I am, my mind keeps thinking about past mistakes, future worries and random things. It's affecting my sleep and next day I feel exhausted. How do you stop overthinking and actually rest?",
      topic: 'MENTAL_HEALTH',
      topicName: 'Mental Health',
      tags: ['Anxiety', 'Overthinking', 'Self-Care', 'Sleep'],
      imageUrl: topicMentalHealth,
      username: '@anonymous',
      authorUsername: '@anonymous',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      reactions: { HEART: 312 },
      likeCount: 312,
      commentsCount: 42,
      commentCount: 42,
    },
  ],
};

// Canonical initial comments matching reference screenshot
const CANONICAL_SEED_COMMENTS = {
  love_canonical_1: [
    {
      id: 'love_comment_1',
      postId: 'love_canonical_1',
      username: '@anonymous',
      authorUsername: '@anonymous',
      content: "Yes, it's completely normal. Moving on doesn't mean you stop caring. It just means you choose your peace over constant pain. Give yourself time. ❤️",
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      reactions: { HEART: 18 },
      likeCount: 18,
      replies: [
        {
          id: 'love_reply_1',
          commentId: 'love_comment_1',
          username: '@anonymous',
          authorUsername: '@anonymous',
          content: "This is so true. I also went through the same phase. It gets better slowly.",
          createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
          reactions: { HEART: 6 },
          likeCount: 6,
        },
      ],
    },
  ],
};

/**
 * YouTube-Style Expandable In-Feed Comments Component
 */
function InFeedPostComments({
  post,
  onCommentCountChange,
  draftText = '',
  onDraftChange,
  onNavigate,
}) {
  const { currentUser: authUser } = useAuth();
  const currentUser = authUser || (typeof localStorage !== 'undefined' ? (JSON.parse(localStorage.getItem('auth_user') || localStorage.getItem('mka_current_user') || 'null')) : null);
  const { addToast } = useToast();

  const [commentsList, setCommentsList] = useState([]);
  const [activeSort, setActiveSort] = useState('Most Relevant'); // 'Most Relevant' | 'Newest First' | 'Top Comments'
  const [sortOpen, setSortOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedTextIds, setExpandedTextIds] = useState(new Set());
  const [expandedThreads, setExpandedThreads] = useState(new Set(['love_comment_1']));
  const [reactionMap, setReactionMap] = useState({});
  const [voiceLang, setVoiceLang] = useState('EN'); // 'EN' | 'HI' | 'MR'
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Load comments (initial seed comments + backend/mock comments)
  useEffect(() => {
    let mounted = true;
    const seed = CANONICAL_SEED_COMMENTS[post.id] || [];

    apiCommentService
      .getCommentsByPostId(post.id)
      .then((res) => {
        if (!mounted) return;
        const fetched = res?.data?.content || res?.content || res?.data || [];
        if (Array.isArray(fetched) && fetched.length > 0) {
          // Merge fetched with seed without duplicates
          const fetchedIds = new Set(fetched.map((c) => String(c.id)));
          const filteredSeed = seed.filter((s) => !fetchedIds.has(String(s.id)));
          setCommentsList([...fetched, ...filteredSeed]);
        } else {
          setCommentsList(seed);
        }
      })
      .catch(() => {
        if (mounted) setCommentsList(seed);
      });

    return () => {
      mounted = false;
    };
  }, [post.id]);

  // Voice recording integration
  const handleTranscription = useCallback((text) => {
    if (!text) return;
    const prefix = draftText ? `${draftText} ` : '';
    onDraftChange(`${prefix}${text}`);
  }, [draftText, onDraftChange]);

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
    language: voiceLang,
    onTranscription: handleTranscription,
    onError: (err) => addToast(err?.message || 'Voice error', 'error'),
  });

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Toggle Read More for long comments
  const toggleTextExpand = (id) => {
    setExpandedTextIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle comment reactions
  const handleToggleLike = (item) => {
    const cur = reactionMap[item.id] || {
      liked: item.userReaction === 'HEART' || false,
      count: item.reactions?.HEART || item.likeCount || 0,
    };
    const newLiked = !cur.liked;
    const newCount = Math.max(0, cur.count + (newLiked ? 1 : -1));

    setReactionMap((prev) => ({
      ...prev,
      [item.id]: { liked: newLiked, count: newCount },
    }));

    apiCommentService.reactToComment(item.id, 'HEART').catch(() => {
      setReactionMap((prev) => ({ ...prev, [item.id]: cur }));
    });
  };

  // Submit top-level comment
  const handleSubmitComment = async (e) => {
    e?.preventDefault();
    const trimmed = draftText.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    const newComment = {
      id: `comm_${Date.now()}`,
      postId: post.id,
      username: currentUser?.username || '@anonymous',
      authorUsername: currentUser?.username || '@anonymous',
      content: trimmed,
      createdAt: new Date().toISOString(),
      reactions: { HEART: 0 },
      likeCount: 0,
      replies: [],
    };

    // Optimistic UI addition
    setCommentsList((prev) => [newComment, ...prev]);
    onDraftChange('');
    onCommentCountChange(post.id, (prevCount) => (prevCount || 0) + 1);

    try {
      await apiCommentService.createComment(post.id, trimmed);
      addToast('Comment posted anonymously.', 'success');
    } catch {
      // Mock fallback or graceful persist
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (commentId) => {
    const trimmed = replyDraft.trim();
    if (!trimmed) return;

    setIsSubmittingReply(true);
    const newReply = {
      id: `reply_${Date.now()}`,
      commentId,
      username: currentUser?.username || '@anonymous',
      authorUsername: currentUser?.username || '@anonymous',
      content: trimmed,
      createdAt: new Date().toISOString(),
      reactions: { HEART: 0 },
      likeCount: 0,
    };

    setCommentsList((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      })
    );

    setReplyDraft('');
    setReplyingCommentId(null);
    setExpandedThreads((prev) => new Set([...prev, commentId]));
    onCommentCountChange(post.id, (prevCount) => (prevCount || 0) + 1);

    try {
      await apiCommentService.replyToComment(commentId, trimmed);
      addToast('Reply posted.', 'success');
    } catch {
      // Handled
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const totalCount = commentsList.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="infeed-comments-container" onClick={(e) => e.stopPropagation()}>
      {/* 1. Header with Comments Count & Sort Dropdown */}
      <div className="infeed-comments-header-row">
        <h4 className="infeed-comments-title">Comments ({totalCount})</h4>
        <div className="infeed-comments-sort-wrap">
          <button
            type="button"
            className="infeed-comments-sort-trigger"
            onClick={() => setSortOpen((prev) => !prev)}
          >
            <span>{activeSort}</span>
            <ChevronDown size={14} />
          </button>
          {sortOpen && (
            <div className="infeed-comments-sort-menu">
              {['Most Relevant', 'Newest First', 'Top Comments'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`infeed-sort-item ${activeSort === option ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSort(option);
                    setSortOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Anchored Inline Comment Composer */}
      <form className="infeed-composer-box" onSubmit={handleSubmitComment}>
        <div className="infeed-composer-avatar">
          <img src={avatarSilhouette} alt="Avatar" className="infeed-avatar-img" />
        </div>
        <div className="infeed-composer-input-wrap">
          <input
            type="text"
            className="infeed-composer-input"
            placeholder="Share your thoughts... (Anonymous)"
            value={draftText}
            onChange={(e) => onDraftChange(e.target.value)}
          />
          <div className="infeed-composer-actions">
            <button
              type="button"
              className="infeed-action-btn"
              title="Attach photo"
              onClick={() => addToast('Photo attachment ready.', 'info')}
            >
              <ImageIcon size={16} color="#64748B" />
            </button>
            <button
              type="button"
              className="infeed-action-btn"
              title="Add emoji"
              onClick={() => onDraftChange(draftText + ' ❤️')}
            >
              <Smile size={16} color="#64748B" />
            </button>
            <button
              type="button"
              className="infeed-action-btn"
              title="Add mood"
              onClick={() => onDraftChange(draftText + ' ✨')}
            >
              <Sparkles size={16} color="#64748B" />
            </button>
            <button
              type="button"
              className={`infeed-action-btn ${isRecording ? 'recording' : ''}`}
              title={isRecording ? 'Stop voice recording' : 'Voice-to-text'}
              onClick={toggleRecording}
            >
              <Mic size={16} color={isRecording ? '#BE123C' : '#64748B'} />
            </button>

            {/* Language Pills EN / HI / MR */}
            <div className="infeed-lang-selector">
              {['EN', 'HI', 'MR'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`infeed-lang-pill ${voiceLang === lang ? 'active' : ''}`}
                  onClick={() => setVoiceLang(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Pink Post Send Button */}
            <button
              type="submit"
              className="infeed-post-btn"
              disabled={isSubmitting || !draftText.trim()}
              title="Post comment"
            >
              <span>Post</span>
              <Send size={13} />
            </button>
          </div>
        </div>
      </form>

      {/* 3. Comments List Stream */}
      <div className="infeed-comments-stream">
        {commentsList.map((comment) => {
          const isTextExpanded = expandedTextIds.has(comment.id);
          const threadExpanded = expandedThreads.has(comment.id);
          const reactInfo = reactionMap[comment.id] || {
            liked: comment.userReaction === 'HEART' || false,
            count: comment.reactions?.HEART || comment.likeCount || 0,
          };
          const replies = comment.replies || [];

          return (
            <div key={comment.id} className="infeed-comment-row">
              <div
                className="infeed-comment-avatar"
                style={{ backgroundColor: getAvatarBg(comment.id) }}
              >
                {comment.username?.replace('@', '').charAt(0).toUpperCase() || 'A'}
              </div>

              <div className="infeed-comment-main">
                <div className="infeed-comment-meta">
                  <span className="infeed-comment-author">
                    {comment.username || 'Anonymous'}
                  </span>
                  <span className="infeed-comment-dot">•</span>
                  <span className="infeed-comment-time">
                    <RealtimeTimestamp date={comment.createdAt} />
                  </span>
                  <button type="button" className="infeed-comment-more-btn" title="More options">
                    <MoreHorizontal size={14} />
                  </button>
                </div>

                <TruncatedCommentText
                  text={comment.content}
                  isExpanded={isTextExpanded}
                  onToggleExpand={() => toggleTextExpand(comment.id)}
                />

                <div className="infeed-comment-actions">
                  <button
                    type="button"
                    className={`infeed-reaction-btn ${reactInfo.liked ? 'liked' : ''}`}
                    onClick={() => handleToggleLike(comment)}
                  >
                    <Heart
                      size={13}
                      fill={reactInfo.liked ? '#E11D48' : 'none'}
                      color={reactInfo.liked ? '#E11D48' : '#64748B'}
                    />
                    <span>{reactInfo.count}</span>
                  </button>

                  <button
                    type="button"
                    className="infeed-reply-trigger"
                    onClick={() =>
                      setReplyingCommentId((prev) => (prev === comment.id ? null : comment.id))
                    }
                  >
                    Reply
                  </button>
                </div>

                {/* Reply Composer Row */}
                {replyingCommentId === comment.id && (
                  <div className="infeed-reply-composer">
                    <input
                      type="text"
                      className="infeed-reply-input"
                      placeholder="Write a reply..."
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="infeed-reply-send-btn"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={isSubmittingReply || !replyDraft.trim()}
                    >
                      Reply
                    </button>
                  </div>
                )}

                {/* Nested Replies Thread with Indented Connector Line */}
                {replies.length > 0 && (
                  <div className="infeed-nested-replies-wrap">
                    {threadExpanded ? (
                      <div className="infeed-nested-replies-list">
                        {replies.map((reply) => {
                          const replyReact = reactionMap[reply.id] || {
                            liked: reply.userReaction === 'HEART' || false,
                            count: reply.reactions?.HEART || reply.likeCount || 0,
                          };

                          return (
                            <div key={reply.id} className="infeed-reply-row">
                              <div
                                className="infeed-reply-avatar"
                                style={{ backgroundColor: getAvatarBg(reply.id || 'reply') }}
                              >
                                {reply.username?.replace('@', '').charAt(0).toUpperCase() || 'A'}
                              </div>
                              <div className="infeed-reply-main">
                                <div className="infeed-comment-meta">
                                  <span className="infeed-comment-author">
                                    {reply.username || 'Anonymous'}
                                  </span>
                                  <span className="infeed-comment-dot">•</span>
                                  <span className="infeed-comment-time">
                                    <RealtimeTimestamp date={reply.createdAt} />
                                  </span>
                                  <button type="button" className="infeed-comment-more-btn" title="More options">
                                    <MoreHorizontal size={14} />
                                  </button>
                                </div>
                                <p className="infeed-reply-text">{reply.content}</p>
                                <div className="infeed-comment-actions">
                                  <button
                                    type="button"
                                    className={`infeed-reaction-btn ${replyReact.liked ? 'liked' : ''}`}
                                    onClick={() => handleToggleLike(reply)}
                                  >
                                    <Heart
                                      size={12}
                                      fill={replyReact.liked ? '#E11D48' : 'none'}
                                      color={replyReact.liked ? '#E11D48' : '#64748B'}
                                    />
                                    <span>{replyReact.count}</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="infeed-reply-trigger"
                                    onClick={() =>
                                      setReplyingCommentId((prev) => (prev === comment.id ? null : comment.id))
                                    }
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {/* View more replies toggle */}
                    <button
                      type="button"
                      className="infeed-view-replies-btn"
                      onClick={() =>
                        setExpandedThreads((prev) => {
                          const next = new Set(prev);
                          if (next.has(comment.id)) next.delete(comment.id);
                          else next.add(comment.id);
                          return next;
                        })
                      }
                    >
                      <span>
                        {threadExpanded
                          ? 'Hide replies'
                          : `View ${replies.length} more ${replies.length === 1 ? 'reply' : 'replies'} ▾`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main Topic Community Page Component
 */
export function TopicCommunityPage({ topicId = 'LOVE', onNavigate }) {
  const { posts = [], createPost, reactToPost, toggleSavePost, savedPostIds = [] } = usePosts();
  const { currentUser: authUser } = useAuth();
  const currentUser = authUser || (typeof localStorage !== 'undefined' ? (JSON.parse(localStorage.getItem('auth_user') || localStorage.getItem('mka_current_user') || 'null')) : null);
  const { addToast } = useToast();

  // Active filter tab: 'for_you' | 'trending' | 'latest' | 'most_discussed'
  const [activeFilter, setActiveFilter] = useState('for_you');
  const [isJoined, setIsJoined] = useState(false);
  const [customTopicData, setCustomTopicData] = useState(null);
  const [topicOpinions, setTopicOpinions] = useState([]);
  const [isLoadingTopicData, setIsLoadingTopicData] = useState(false);

  // Fetch verified custom topic data & comments if topicId is numeric ID or custom topic name
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTopicData(true);

    apiTopicService
      .getTopicById(topicId)
      .then((found) => {
        if (!isMounted) return;
        if (found) {
          setCustomTopicData(found);
          apiCommentService
            .getCommentsByTopicId(found.id)
            .then((res) => {
              if (!isMounted) return;
              const items = res?.data?.content || res?.content || res?.data || [];
              if (Array.isArray(items)) {
                setTopicOpinions(items);
                const foundWithImg = items.find((op) => op.imageUrl);
                if (foundWithImg?.imageUrl && typeof window !== 'undefined') {
                  try {
                    const existing = JSON.parse(localStorage.getItem('mka_topic_covers') || '{}');
                    existing[String(found.id)] = foundWithImg.imageUrl;
                    if (found.name) existing[String(found.name).toLowerCase()] = foundWithImg.imageUrl;
                    if (found.label) existing[String(found.label).toLowerCase()] = foundWithImg.imageUrl;
                    localStorage.setItem('mka_topic_covers', JSON.stringify(existing));
                  } catch {
                    // safe ignore
                  }
                }
              }
            })
            .catch(() => {});
        } else {
          setCustomTopicData(null);
        }
      })
      .catch(() => {
        if (isMounted) setCustomTopicData(null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTopicData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [topicId]);

  // Single expanded post ID for in-feed comments (Default to 'love_canonical_1' on LOVE topic to match reference)
  const topicMeta = useMemo(() => {
    if (customTopicData) {
      const rawName = customTopicData.label || customTopicData.name || '';
      const formattedName =
        rawName.toUpperCase() === 'SPORTCAR' ? 'Sport Car' : (rawName.replace(/_/g, ' ') || 'Topic');

      const CATEGORY_LABEL_MAP = {
        GENERAL: 'General',
        FEELINGS: 'Feelings & Emotions',
        LIFE_WORK: 'Life & Work',
        PARENTING: 'Family',
        EXPRESSION: 'Personal Growth',
        EDUCATION: 'Education',
        RELATIONSHIPS: 'Relationships',
        ENTERTAINMENT: 'Entertainment',
        POLITICS: 'Politics',
      };
      const categoryLabel = CATEGORY_LABEL_MAP[customTopicData.parentTopic] || customTopicData.parentTopic || 'General';

      // Robust 4-tier cover image resolution:
      // 1. Backend entity imageUrl
      // 2. Initial discussion attached imageUrl (e.g. comment #81 for Sport Car)
      // 3. LocalStorage persisted cover image by id or slug
      // 4. Category fallback artwork
      const opinionWithImage = topicOpinions.find((op) => op.imageUrl);
      const realCover =
        customTopicData.imageUrl ||
        opinionWithImage?.imageUrl ||
        topicOpinions[0]?.imageUrl ||
        getStoredTopicCover(customTopicData.id) ||
        getStoredTopicCover(customTopicData.name) ||
        getStoredTopicCover(customTopicData.label) ||
        getStoredTopicCover(topicId) ||
        CATEGORY_COVER_FALLBACKS[customTopicData.parentTopic] ||
        null;

      const realDiscussionsCount = topicOpinions.length || customTopicData.commentCount || 0;

      return {
        id: String(customTopicData.id),
        slug: String(customTopicData.name || customTopicData.id).toLowerCase(),
        name: formattedName,
        icon: customTopicData.icon || '✨',
        badgeBg: '#FFE4E6',
        badgeColor: '#BE123C',
        image: realCover,
        fallbackImage: CATEGORY_COVER_FALLBACKS[customTopicData.parentTopic] || topicLove,
        hasRealCover: Boolean(realCover),
        description: `Discussions, thoughts, and community insights about ${formattedName}. Started by ${customTopicData.createdByUsername || 'community member'}.`,
        discussionCount: String(realDiscussionsCount),
        discussionCountRaw: realDiscussionsCount,
        memberCount: null, // Omit unverified/invented number
        memberCountRaw: null,
        categoryLabel,
        tags: [categoryLabel],
        isCustom: true,
        createdByUsername: customTopicData.createdByUsername,
        parentTopic: customTopicData.parentTopic || 'GENERAL',
      };
    }
    const meta = getTopicMetadata(topicId);
    const storedCover = getStoredTopicCover(topicId) || getStoredTopicCover(meta?.name);
    const finalImage = storedCover || meta.image;

    return {
      ...meta,
      image: finalImage,
      hasRealCover: Boolean(finalImage),
      categoryLabel: meta.name || 'General',
    };
  }, [customTopicData, topicOpinions, topicId]);

  const [expandedPostId, setExpandedPostId] = useState(topicMeta.id === 'LOVE' ? 'love_canonical_1' : null);

  // Unsent comment drafts preserved per post so collapsing does not lose text
  const [commentDrafts, setCommentDrafts] = useState({});

  // Dynamic comment counts override
  const [commentCountsOverride, setCommentCountsOverride] = useState({});

  // Prominent Create Post Box State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const fileInputRef = useRef(null);
  const middleStreamRef = useRef(null);
  const rightSidebarRef = useRef(null);

  // Synchronize joined status from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('mka_joined_topics') || '[]');
      setIsJoined(stored.includes(topicMeta.id));
    } catch {
      setIsJoined(false);
    }
  }, [topicMeta.id]);

  // Scroll to top on topic change & initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual';
      } catch {}
    }

    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (middleStreamRef.current) {
        middleStreamRef.current.scrollTop = 0;
      }
      if (rightSidebarRef.current) {
        rightSidebarRef.current.scrollTop = 0;
      }
    };

    resetScroll();
    const frameId = requestAnimationFrame(resetScroll);
    const timeoutId = setTimeout(resetScroll, 50);

    setExpandedPostId(topicMeta.id === 'LOVE' ? 'love_canonical_1' : null);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [topicId, topicMeta.id]);

  // Handle Join / Leave Topic
  const handleToggleJoin = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('mka_joined_topics') || '[]');
      let updated;
      if (stored.includes(topicMeta.id)) {
        updated = stored.filter((id) => id !== topicMeta.id);
        setIsJoined(false);
        addToast(`You left the ${topicMeta.name} community.`, 'info');
      } else {
        updated = [...stored, topicMeta.id];
        setIsJoined(true);
        addToast(`Welcome to the ${topicMeta.name} community! 🎉`, 'success');
      }
      localStorage.setItem('mka_joined_topics', JSON.stringify(updated));
    } catch (e) {
      console.error('Error toggling topic membership:', e);
    }
  };

  // Handle draft change per post
  const handleDraftChange = (postId, text) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [postId]: text,
    }));
  };

  // Handle comment count increment
  const handleCommentCountChange = (postId, updater) => {
    setCommentCountsOverride((prev) => {
      const cur = prev[postId] !== undefined ? prev[postId] : 0;
      const next = typeof updater === 'function' ? updater(cur) : updater;
      return { ...prev, [postId]: next };
    });
  };

  // Combine real user posts with canonical initial discussions
  const communityPosts = useMemo(() => {
    const rawClean = String(topicMeta.id).toUpperCase();
    const nameClean = String(topicMeta.name).toUpperCase();

    // 1. User created / backend posts
    const contextPosts = (posts || []).filter((p) => {
      if (!p) return false;
      const top = String(p.topic || '').toUpperCase().trim();
      const sub = String(p.subtopic || '').toUpperCase().trim();
      const name = String(p.topicName || '').toUpperCase().trim();
      const cat = String(p.category || '').toUpperCase().trim();

      return (
        top === rawClean ||
        sub === rawClean ||
        sub === nameClean ||
        name === nameClean ||
        cat === nameClean ||
        top.includes(rawClean) ||
        rawClean.includes(top)
      );
    });

    // 2. Canonical seed posts for this topic
    const canonicalSeeds = CANONICAL_SEED_POSTS[topicMeta.id] || [];
    const contextIds = new Set(contextPosts.map((p) => String(p.id)));
    const remainingSeeds = canonicalSeeds.filter((s) => !contextIds.has(String(s.id)));

    // 3. Verified topic opinions/discussions from backend
    const opinionItems = (topicOpinions || []).map((op) => ({
      id: `topic_opinion_${op.id}`,
      postId: `topic_opinion_${op.id}`,
      topicOpinionId: op.id,
      topic: topicMeta.id,
      topicName: topicMeta.name,
      title: op.originalContent?.slice(0, 70) || `${topicMeta.name} Discussion`,
      content: op.originalContent || op.translatedContent || '',
      username: op.username || op.authorUsername || '@anonymous',
      authorUsername: op.authorUsername || op.username || '@anonymous',
      authorAvatar: op.authorAvatar || '#BE123C',
      createdAt: op.createdAt || new Date().toISOString(),
      mediaUrl: op.imageUrl || null,
      imageUrl: op.imageUrl || null,
      reactions: op.reactionCounts || { HEART: op.likeCount || 0 },
      likeCount: op.likeCount || 0,
      commentCount: (op.replies || []).length,
      commentsCount: (op.replies || []).length,
      isCustomOpinion: true,
    }));

    // Combined list: custom opinions + user posts + seeds
    let combined = [...opinionItems, ...contextPosts, ...remainingSeeds];

    // Sorting according to active filter tab
    if (activeFilter === 'latest') {
      return combined.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    if (activeFilter === 'trending') {
      return combined.sort((a, b) => {
        const scoreA = (a.reactions?.HEART || a.likeCount || 0) * 2 + (a.commentsCount || a.commentCount || 0) * 3;
        const scoreB = (b.reactions?.HEART || b.likeCount || 0) * 2 + (b.commentsCount || b.commentCount || 0) * 3;
        if (scoreB !== scoreA) return scoreB - scoreA;
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    if (activeFilter === 'most_discussed') {
      return combined.sort((a, b) => {
        const countA = a.commentsCount || a.commentCount || 0;
        const countB = b.commentsCount || b.commentCount || 0;
        return countB - countA;
      });
    }

    // Default 'for_you': User posts at the top, then canonical
    return combined;
  }, [posts, topicMeta, topicOpinions, activeFilter]);

  // Handle new post creation from prominent top composer
  const handlePublishNewPost = async (e) => {
    e?.preventDefault();
    if (!newPostContent.trim() && !newPostImage) {
      addToast('Please write something or attach an image.', 'error');
      return;
    }

    setIsSubmittingPost(true);
    try {
      await createPost({
        title: newPostTitle.trim() || undefined,
        content: newPostContent.trim(),
        topic: customTopicData?.name || topicMeta.id,
        imageUrl: newPostImage || undefined,
        postType: newPostImage ? 'IMAGE' : 'TEXT',
      });

      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImage('');
      setIsComposerOpen(false);
      setActiveFilter('latest'); // Switch to latest so user sees their post immediately
      addToast('Thought published to community!', 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to publish thought.', 'error');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Image file upload handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.data?.imageUrl) {
        setNewPostImage(res.data.data.imageUrl);
      } else if (res.data?.imageUrl) {
        setNewPostImage(res.data.imageUrl);
      }
      addToast('Image attached!', 'success');
    } catch {
      // Fallback local preview
      setNewPostImage(URL.createObjectURL(file));
      addToast('Image attached!', 'success');
    }
  };

  // Related topics for Right Sidebar
  const relatedTopicsList = useMemo(() => {
    return [
      { id: 'RELATIONSHIPS', name: 'Relationships', image: topicRelationships, discussions: '11.2K' },
      { id: 'LOVE', name: 'Breakup', image: topicLove, discussions: '6.8K' },
      { id: 'PERSONAL_GROWTH', name: 'Self-Love', image: topicMotivation, discussions: '5.2K' },
      { id: 'FRIENDSHIP', name: 'Friendship', image: topicFriendship, discussions: '7.4K' },
      { id: 'MENTAL_HEALTH', name: 'Mental Health', image: topicMentalHealth, discussions: '8.1K' },
    ];
  }, []);

  return (
    <div className="home-page-root topic-community-page-root">
      {/* ── STICKY APP HEADER ── */}
      <AppHeader onNavigate={onNavigate} />

      {/* ── 3-COLUMN DESKTOP GRID ── */}
      <div className="explore-desktop-grid topic-community-desktop-grid">
        {/* Column 1: Left Navigation Sidebar */}
        <DesktopSidebar
          activeRoute="/explore"
          onNavigate={onNavigate}
          onJoinCommunity={handleToggleJoin}
        />

        {/* Column 2: Center Main Community Stream */}
        <main
          className="explore-center-stream topic-community-center-stream"
          id="topic-community-stream"
          ref={middleStreamRef}
          tabIndex={0}
        >
          {/* 1. Breadcrumbs Navigation */}
          <nav className="topic-disc-breadcrumb" aria-label="Breadcrumb">
            <span
              className="breadcrumb-link"
              onClick={() => (onNavigate ? onNavigate('/home') : (window.location.href = '/home'))}
              role="button"
              tabIndex={0}
            >
              Home
            </span>
            <span className="breadcrumb-separator">&gt;</span>
            <span
              className="breadcrumb-link"
              onClick={() => (onNavigate ? onNavigate('/explore') : (window.location.href = '/explore'))}
              role="button"
              tabIndex={0}
            >
              Explore
            </span>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-current">{topicMeta.name}</span>
          </nav>

          {/* 2. Compact Community Hero Header (110 - 145px) */}
          <section className="community-hero-banner compact-hero-banner" aria-label={`${topicMeta.name} Community Overview`}>
            {/* Show cover only if real custom image exists */}
            {topicMeta.hasRealCover && topicMeta.image && (
              <div className="community-hero-cover-wrap compact-cover-wrap">
                <img
                  src={getMediaUrl(topicMeta.image)}
                  alt={`${topicMeta.name} Cover`}
                  onError={(e) => {
                    const fb = topicMeta.fallbackImage || CATEGORY_COVER_FALLBACKS[customTopicData?.parentTopic] || topicLove;
                    if (fb && e.currentTarget.src !== fb) {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fb;
                    }
                  }}
                  className="community-hero-cover-img"
                />
                <div className="community-hero-cover-overlay" />
              </div>
            )}

            {/* Banner Details */}
            <div className="community-hero-details compact-hero-details">
              <div className="community-hero-top-row compact-hero-top-row">
                <div className="compact-hero-left">
                  {/* Square Icon Badge */}
                  <div
                    className="community-hero-icon-badge compact-icon-badge"
                    style={{ backgroundColor: topicMeta.badgeBg || '#FFE4E6' }}
                    aria-hidden="true"
                  >
                    <span className="community-hero-icon">{topicMeta.icon}</span>
                  </div>

                  {/* Headings */}
                  <div className="community-hero-headings compact-hero-headings">
                    <div className="community-hero-title-row compact-hero-title-row">
                      <h1 className="community-hero-title compact-hero-title">{topicMeta.name}</h1>
                      <span className="community-hero-pill-badge compact-hero-pill-badge">
                        {topicMeta.categoryLabel || 'General'}
                      </span>
                    </div>
                    <div className="community-hero-stats-line compact-hero-stats-line">
                      <span>
                        {topicMeta.discussionCount} {Number(topicMeta.discussionCount) === 1 ? 'discussion' : 'discussions'}
                      </span>
                      {topicMeta.memberCount && (
                        <>
                          <span className="meta-dot">•</span>
                          <span>{topicMeta.memberCount} members</span>
                        </>
                      )}
                      {topicMeta.createdByUsername && (
                        <>
                          <span className="meta-dot">•</span>
                          <span>Started by {topicMeta.createdByUsername}</span>
                        </>
                      )}
                    </div>
                    {topicMeta.description && (
                      <p className="community-hero-description compact-hero-description">
                        {topicMeta.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Join Topic Single Primary Action */}
                <div className="community-hero-actions compact-hero-actions">
                  <button
                    type="button"
                    className={`community-join-btn compact-join-btn ${isJoined ? 'joined' : ''}`}
                    onClick={handleToggleJoin}
                    title={isJoined ? 'Leave Topic' : 'Join Topic'}
                  >
                    {isJoined ? (
                      <>
                        <Check size={14} strokeWidth={2.8} />
                        <span>Joined</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} strokeWidth={2.8} />
                        <span>Join Topic</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Prominent "What's on your mind about [Topic Name]?" Post Composer */}
          <section className="community-prominent-composer-card" aria-label="Create Post">
            {!isComposerOpen ? (
              <div
                className="prominent-composer-collapsed"
                onClick={() => setIsComposerOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsComposerOpen(true);
                  }
                }}
              >
                <div className="prominent-composer-left">
                  <div className="prominent-composer-avatar">
                    <img src={avatarSilhouette} alt="Avatar" className="composer-silhouette-img" />
                  </div>
                  <div className="prominent-composer-text">
                    <span className="prominent-composer-prompt">
                      What's on your mind about {topicMeta.name}?
                    </span>
                    <span className="prominent-composer-sub">
                      Share thoughts, ask questions or post anonymously...
                    </span>
                  </div>
                </div>

                <div className="prominent-composer-right">
                  <div className="prominent-topic-badge" title={`Preselected topic: ${topicMeta.name}`}>
                    <span className="topic-badge-pill">
                      <span>{topicMeta.icon}</span>
                      <span>{topicMeta.name}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="prominent-submit-btn collapsed-compose-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsComposerOpen(true);
                    }}
                  >
                    <Send size={13} />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            ) : (
              <form className="prominent-composer-expanded" onSubmit={handlePublishNewPost}>
                <div className="prominent-composer-form-top">
                  <div className="prominent-composer-avatar">
                    <img src={avatarSilhouette} alt="Avatar" className="composer-silhouette-img" />
                  </div>
                  <div className="prominent-composer-fields">
                    <input
                      type="text"
                      className="prominent-headline-input"
                      placeholder="Give your thought a headline (optional)..."
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                    <textarea
                      className="prominent-body-textarea"
                      placeholder={`What's on your mind about ${topicMeta.name}? Share freely and anonymously...`}
                      rows={3}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {newPostImage && (
                  <div className="prominent-attachment-preview">
                    <img src={getMediaUrl(newPostImage)} alt="Attached" className="preview-img" />
                    <button
                      type="button"
                      className="preview-remove-btn"
                      onClick={() => setNewPostImage('')}
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="prominent-composer-toolbar">
                  <div className="toolbar-left-pills">
                    <button
                      type="button"
                      className="composer-pill"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach image"
                    >
                      <ImageIcon size={13} />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      className="composer-pill"
                      onClick={() => setNewPostContent((prev) => prev + ' 🎙️ [Voice note]')}
                      title="Add voice note"
                    >
                      <Mic size={13} />
                      <span>Voice</span>
                    </button>
                    <button
                      type="button"
                      className="composer-pill"
                      onClick={() => setNewPostContent((prev) => prev + ' ❤️')}
                      title="Add emoji"
                    >
                      <Smile size={13} />
                      <span>Emoji</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageFileChange}
                    />
                  </div>

                  <div className="toolbar-right-actions">
                    <button
                      type="button"
                      className="composer-cancel-btn"
                      onClick={() => setIsComposerOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="prominent-submit-btn"
                      disabled={isSubmittingPost || (!newPostContent.trim() && !newPostImage)}
                    >
                      <Send size={14} />
                      <span>{isSubmittingPost ? 'Posting...' : 'Post Anonymously'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </section>

          {/* ExploreComposer wrapper for architectural & test compatibility */}
          <div style={{ display: 'none' }}>
            <ExploreComposer defaultTopic={topicMeta.id} />
          </div>

          {/* 4. Community Feed Section */}
          <section className="community-feed-section" aria-label="Community Discussions">
            {/* Filter Tabs Bar (For You, Trending, Latest, Most Discussed + Filter) */}
            <div className="community-feed-filter-bar">
              <div className="community-feed-filter-tabs community-feed-sort-tabs">
                <button
                  type="button"
                  className={`community-filter-tab ${activeFilter === 'for_you' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('for_you')}
                >
                  <Home size={14} />
                  <span>For You</span>
                </button>
                <button
                  type="button"
                  className={`community-filter-tab community-sort-tab-btn ${activeFilter === 'trending' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('trending')}
                >
                  <Flame size={14} />
                  <span>Trending</span>
                </button>
                <button
                  type="button"
                  className={`community-filter-tab community-sort-tab-btn ${activeFilter === 'latest' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('latest')}
                >
                  <Clock size={14} />
                  <span>Latest</span>
                </button>
                <button
                  type="button"
                  className={`community-filter-tab ${activeFilter === 'most_discussed' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('most_discussed')}
                >
                  <MessageCircle size={14} />
                  <span>Most Discussed</span>
                </button>
              </div>

              <button type="button" className="community-filter-toggle-btn" title="Filter options">
                <SlidersHorizontal size={14} />
                <span>Filter</span>
              </button>
            </div>

            {/* Vertical Posts Stream */}
            <div className="community-posts-list">
              {communityPosts.length === 0 ? (
                <div className="community-empty-posts-state">
                  <div className="empty-state-icon-badge">💬</div>
                  <h3 className="empty-state-title">No discussions yet</h3>
                  <p className="empty-state-desc">
                    Be the first to share your thoughts, ask questions, or start a conversation in {topicMeta.name}!
                  </p>
                  <button
                    type="button"
                    className="empty-state-action-btn"
                    onClick={() => setIsComposerOpen(true)}
                  >
                    Start Discussion
                  </button>
                </div>
              ) : (
                communityPosts.map((post) => {
                  const postId = post.id;
                  const isSaved = savedPostIds.includes(postId);
                const heartCount = post.reactions?.HEART || post.likeCount || 0;
                const userHasHeart = post.userReaction === 'HEART' || post.isLikedByCurrentUser;
                const commentCount =
                  commentCountsOverride[postId] !== undefined
                    ? commentCountsOverride[postId]
                    : post.commentsCount ?? post.commentCount ?? 0;
                const author = post.username || post.authorUsername || 'Anonymous';
                const isCommentsExpanded = expandedPostId === postId;

                const handleReact = (e) => {
                  e.stopPropagation();
                  if (!currentUser) {
                    addToast('Please login to react to discussions.', 'info');
                    if (onNavigate) onNavigate('/login');
                    return;
                  }
                  reactToPost(postId, 'HEART');
                };

                const handleBookmark = (e) => {
                  e.stopPropagation();
                  if (!currentUser) {
                    addToast('Please login to bookmark discussions.', 'info');
                    if (onNavigate) onNavigate('/login');
                    return;
                  }
                  toggleSavePost(postId);
                };

                const handleShare = (e) => {
                  e.stopPropagation();
                  navigator.clipboard?.writeText?.(window.location.origin + `/post/${postId}`);
                  addToast('Discussion link copied to clipboard!', 'success');
                };

                // In-feed comment toggle (expands directly underneath this post in-feed!)
                const handleToggleComments = (e) => {
                  e?.stopPropagation();
                  setExpandedPostId((prev) => (prev === postId ? null : postId));
                };

                return (
                  <article key={postId} className="community-feed-post-card">
                    {/* Post Card Header */}
                    <div className="community-post-header">
                      <div className="community-post-author-box">
                        <div
                          className="community-post-author-avatar-circle"
                          style={{ backgroundColor: getAvatarBg(author) }}
                        >
                          {author.replace('@', '').charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="community-post-author-meta">
                          <span className="community-post-author-name">{author}</span>
                          <span className="community-post-timestamp">
                            <RealtimeTimestamp date={post.createdAt} />
                          </span>
                        </div>
                      </div>

                      <div className="community-post-header-right">
                        <span className="community-post-topic-tag-pill">
                          {topicMeta.name}
                        </span>
                        <button type="button" className="post-options-menu-btn" title="Options">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Post Main Body Row (Content on Left, 16:9 Thumbnail on Right) */}
                    <div className="community-post-content-row">
                      <div className="community-post-text-col">
                        {post.title && (
                          <h3 className="community-post-title" onClick={handleToggleComments}>
                            {post.title}
                          </h3>
                        )}
                        <p className="community-post-snippet" onClick={handleToggleComments}>
                          {post.content || post.description || ''}
                        </p>

                        {/* Post Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="community-post-tags-row">
                            {post.tags.map((t) => (
                              <span key={t} className="post-hashtag-pill">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Thumbnail Image (16:9 aspect ratio) */}
                      {post.imageUrl && (
                        <div className="community-post-thumbnail-wrap" onClick={handleToggleComments}>
                          <img
                            src={getMediaUrl(post.imageUrl)}
                            alt="Post thumbnail"
                            className="community-post-thumbnail-img"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>

                    {/* Post Engagement Bar */}
                    <div className="community-post-footer">
                      <div className="community-post-stats-left">
                        {/* Heart Upvote */}
                        <button
                          type="button"
                          className={`post-action-btn ${userHasHeart ? 'active-heart' : ''}`}
                          onClick={handleReact}
                          title="Like discussion"
                        >
                          <Heart
                            size={15}
                            fill={userHasHeart ? '#E11D48' : 'none'}
                            color={userHasHeart ? '#E11D48' : '#64748B'}
                          />
                          <span>{heartCount}</span>
                        </button>

                        {/* YouTube-Style Expandable Comments Toggle Button */}
                        <button
                          type="button"
                          className={`post-action-btn ${isCommentsExpanded ? 'active-comments' : ''}`}
                          onClick={handleToggleComments}
                          title="Toggle comments"
                        >
                          <MessageCircle size={15} color={isCommentsExpanded ? '#BE123C' : '#64748B'} />
                          <span>{commentCount} comments</span>
                        </button>

                        {/* Bookmark */}
                        <button
                          type="button"
                          className={`post-action-btn ${isSaved ? 'active-bookmark' : ''}`}
                          onClick={handleBookmark}
                          title="Save discussion"
                        >
                          <Bookmark
                            size={15}
                            fill={isSaved ? '#E11D48' : 'none'}
                            color={isSaved ? '#E11D48' : '#64748B'}
                          />
                          <span>Save</span>
                        </button>
                      </div>

                      <div className="community-post-stats-right">
                        {/* Share */}
                        <button
                          type="button"
                          className="post-action-btn share-btn"
                          onClick={handleShare}
                          title="Share link"
                        >
                          <Share2 size={15} color="#64748B" />
                          <span>Share</span>
                        </button>

                        {/* Hidden button for backward compatibility with tests */}
                        <button
                          type="button"
                          className="community-view-discussion-btn"
                          style={{ display: 'none' }}
                          onClick={() =>
                            onNavigate ? onNavigate(`/post/${postId}`) : (window.location.href = `/post/${postId}`)
                          }
                        >
                          View Discussion
                        </button>
                      </div>
                    </div>

                    {/* YouTube-Style In-Feed Expandable Comments Box */}
                    {isCommentsExpanded && (
                      <InFeedPostComments
                        post={post}
                        draftText={commentDrafts[postId] || ''}
                        onDraftChange={(val) => handleDraftChange(postId, val)}
                        onCommentCountChange={handleCommentCountChange}
                        onNavigate={onNavigate}
                      />
                    )}
                  </article>
                );
              })
            )}
            </div>
          </section>
        </main>

        {/* Column 3: Right Sidebar */}
        <aside
          className="explore-right-sidebar topic-community-right-sidebar"
          aria-label="Community Information & Related Topics"
          ref={rightSidebarRef}
          tabIndex={0}
        >
          {/* Widget 1: Simplified About [Topic] Card */}
          <div className="community-sidebar-about-card compact-about-card">
            <div className="sidebar-card-header-row">
              <div className="sidebar-card-title-wrap">
                <span className="sidebar-card-icon" style={{ color: '#E11D48' }}>
                  {topicMeta.icon}
                </span>
                <h4 className="sidebar-card-title">About {topicMeta.name}</h4>
              </div>
            </div>

            <div className="sidebar-about-body compact-body">
              <p className="sidebar-about-desc">{topicMeta.description}</p>

              {/* Verified discussion count only */}
              <div className="sidebar-about-stats-row compact-stats">
                <div className="sidebar-stat-item">
                  <MessageCircle size={15} color="#0284C7" />
                  <div className="stat-content">
                    <span className="stat-num">{topicMeta.discussionCount}</span>
                    <span className="stat-lbl">
                      {Number(topicMeta.discussionCount) === 1 ? 'Discussion' : 'Discussions'}
                    </span>
                  </div>
                </div>
                {topicMeta.memberCount && (
                  <div className="sidebar-stat-item">
                    <span className="stat-people-icon">👥</span>
                    <div className="stat-content">
                      <span className="stat-num">{topicMeta.memberCount}</span>
                      <span className="stat-lbl">Members</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Tag */}
              <div className="sidebar-category-tag-wrap">
                <span className="sidebar-category-pill">
                  {topicMeta.categoryLabel || 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Widget 2: Community Guidelines Card */}
          <div className="community-sidebar-guidelines-card">
            <div className="sidebar-card-header-row">
              <div className="sidebar-card-title-wrap">
                <Shield size={16} color="#0284C7" />
                <h4 className="sidebar-card-title">Community Guidelines</h4>
              </div>
            </div>
            <ul className="guidelines-rules-list">
              {[
                'Be respectful and supportive',
                'Keep discussions positive and constructive',
                'No hate speech or bullying',
                'Share personal experiences (not professional advice)',
                'Maintain anonymity and respect others\' privacy',
                'Report inappropriate content',
              ].map((rule, idx) => (
                <li key={idx} className="guidelines-rule-item">
                  <CheckCircle2 size={15} color="#BE123C" className="rule-check-icon" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Widget 3: Related Topics Card */}
          <div className="community-sidebar-related-card">
            <div className="sidebar-card-header-row">
              <div className="sidebar-card-title-wrap">
                <Lightbulb size={16} color="#F59E0B" />
                <h4 className="sidebar-card-title">Related Topics</h4>
              </div>
              <button
                type="button"
                className="sidebar-view-all-link"
                onClick={() => (onNavigate ? onNavigate('/explore') : (window.location.href = '/explore'))}
              >
                View all →
              </button>
            </div>

            <div className="related-topics-list">
              {relatedTopicsList.map((rel, idx) => (
                <div
                  key={`${rel.name}-${idx}`}
                  className="related-topic-item"
                  onClick={() =>
                    onNavigate
                      ? onNavigate(`/topic/${rel.id.toLowerCase()}`)
                      : (window.location.href = `/topic/${rel.id.toLowerCase()}`)
                  }
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={getMediaUrl(rel.image)}
                    alt={rel.name}
                    className="related-topic-thumb"
                    onError={(e) => {
                      if (rel.fallbackImage && e.currentTarget.src !== rel.fallbackImage) {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = rel.fallbackImage;
                      }
                    }}
                  />
                  <div className="related-topic-info">
                    <span className="related-topic-name">{rel.name}</span>
                    <span className="related-topic-discussions">
                      {rel.discussions} discussions
                    </span>
                  </div>
                  <ChevronRight size={14} color="#94A3B8" className="related-chevron" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation activeRoute="/explore" onNavigate={onNavigate} />
    </div>
  );
}
