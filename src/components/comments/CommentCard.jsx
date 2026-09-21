import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { CommentReactions } from './CommentReactions.jsx';
import { CommentMenu } from './CommentMenu.jsx';
import { ReplyComposer } from './ReplyComposer.jsx';
import { ReplyList } from './ReplyList.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ReportModal } from '../reports/ReportModal.jsx';
import { Reply, Languages, Heart } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { getMediaUrl } from '../../config/env.js';
import { sanitizeEncodedSymbols } from '../../services/apiMappers.js';

const EMOJI_REACTIONS = ['😀', '❤️', '👍', '🔥', '💯', '🤝'];

const keyMap = {
  'relate': '❤️',
  'helpful': '🔥',
  'wellSaid': '👍',
  'stayStrong': '🤝',
  'madeMeThink': '💯',
  'happy': '😀'
};

const emojiMap = {
  '❤️': 'relate',
  '🔥': 'helpful',
  '👍': 'wellSaid',
  '🤝': 'stayStrong',
  '💯': 'madeMeThink',
  '😀': 'relate'
};

export function CommentCard({ comment, postId, postAuthorUsername, onNavigate, onReplySubmit, isActiveReply, onReplyToggle }) {
  const { currentUser } = useAuth();
  const { updateComment, deleteComment, createReply, reactToComment, activeReplyCommentId, setActiveReplyCommentId } = useComments();
  const { blockUser, blockedUsers = [], mutedUsers = [] } = useReports();
  const { t, currentLanguage, translateTextAsync } = useLanguage();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [isHovered, setIsHovered] = useState(false);
  const [localShowReplyComposer, setLocalShowReplyComposer] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);

  const isThisCommentActiveReply = (activeReplyCommentId !== null && activeReplyCommentId !== undefined)
    ? String(activeReplyCommentId) === String(comment.id)
    : (isActiveReply !== undefined ? isActiveReply : localShowReplyComposer);

  const showReplyComposer = isThisCommentActiveReply;

  const toggleReplyComposer = (open) => {
    if (setActiveReplyCommentId) {
      setActiveReplyCommentId(open ? comment.id : null);
    }
    if (onReplyToggle) {
      onReplyToggle(open);
    }
    setLocalShowReplyComposer(open);
  };

  const isBlockedOrMuted = (() => {
    const author = (comment.username || '').toLowerCase().replace(/^@/, '').trim();
    if (!author) return false;
    const isB = (blockedUsers || []).some(u => String(u).toLowerCase().replace(/^@/, '').trim() === author);
    const isM = (mutedUsers || []).some(u => String(u).toLowerCase().replace(/^@/, '').trim() === author);
    return isB || isM;
  })();

  const isOwner = Boolean(
    currentUser && (
      (currentUser.id && comment.userId && String(currentUser.id) === String(comment.userId)) ||
      (currentUser.username && comment.username && currentUser.username.toLowerCase() === comment.username.toLowerCase())
    )
  );

  // TanStack Query for Comment Translation with 3-second refetchInterval
  const sourceText = comment?.originalContent || comment?.content || '';
  const commentTranslationQuery = useQuery({
    queryKey: ['comment-translation', comment?.id, currentLanguage, sourceText],
    queryFn: async () => {
      if (!sourceText || !currentLanguage || !translateTextAsync) return null;
      const res = await translateTextAsync(sourceText, currentLanguage);
      return res || null;
    },
    staleTime: Infinity,
    enabled: Boolean(sourceText && currentLanguage),
  });

  const dynamicCommentTranslation = commentTranslationQuery.data || null;

  const [activeEmojis, setActiveEmojis] = useState(() => {
    const list = [];
    const r = comment.reactions || {};
    if (r.relate > 0) list.push('❤️');
    if (r.helpful > 0) list.push('🔥');
    if (r.wellSaid > 0) list.push('👍');
    if (r.stayStrong > 0) list.push('🤝');
    if (r.madeMeThink > 0) list.push('💯');
    const userR = comment.userReaction;
    if (userR && keyMap[userR]) {
      const emoji = keyMap[userR];
      return [emoji, ...list.filter(x => x !== emoji)];
    }
    return list;
  });

  if (hidden || isBlockedOrMuted) {
    return null;
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    try {
      updateComment(comment.id, postId, editText.trim());
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id, postId);
    } catch {
      // CommentContext displays the API error and keeps the comment visible.
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(comment.content);
    addToast('Comment copied to clipboard.', 'info');
  };

  const handleAddReply = async (replyText) => {
    if (onReplySubmit) await onReplySubmit(comment.id, replyText);
    else await createReply(comment.id, postId, replyText, comment.username);
    toggleReplyComposer(false);
  };

  const rawDisplayContent = manualToggle
    ? (comment.originalContent || comment.content)
    : (dynamicCommentTranslation || comment.translatedContent || comment.content || comment.originalContent);

  const displayContent = sanitizeEncodedSymbols(rawDisplayContent);

  const isTranslated = !manualToggle && Boolean(
    (dynamicCommentTranslation && dynamicCommentTranslation !== (comment.originalContent || comment.content)) ||
    (comment.originalLanguage && comment.displayLanguage && comment.originalLanguage.toLowerCase() !== comment.displayLanguage.toLowerCase()) ||
    (comment.translatedContent && comment.originalContent && comment.translatedContent !== comment.originalContent)
  );

  const handleEmojiClick = (emoji, e) => {
    if (e) e.stopPropagation();
    const exists = activeEmojis.includes(emoji);
    setActiveEmojis(prev => {
      if (exists) {
        return prev.filter(x => x !== emoji);
      } else {
        return [emoji, ...prev]; // Latest first!
      }
    });

    const key = emojiMap[emoji] || 'relate';
    if (reactToComment) reactToComment(comment.id, key, exists);
  };

  const handleLikeToggle = (e) => {
    if (e) e.stopPropagation();
    handleEmojiClick('❤️');
  };

  const userLiked = activeEmojis.includes('❤️');
  const reactionCount = Object.values(comment.reactions || {}).reduce((sum, count) => sum + count, 0);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="animate-fade-in"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        padding: '6px 0',
        backgroundColor: 'transparent',
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {/* ── FLOATING HOVER EMOJI BAR ── */}
      {isHovered && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: '-26px',
            left: '44px',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#ffffff',
            padding: '4px 10px',
            borderRadius: '24px',
            boxShadow: '0 6px 20px rgba(45,29,21,0.22), 0 2px 6px rgba(0,0,0,0.1)',
            border: '1.5px solid #6F405F',
            pointerEvents: 'auto',
          }}
        >

          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={(e) => handleEmojiClick(emoji, e)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '2px 4px',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Left Avatar */}
      <button
        onClick={() => onNavigate(`/profile/${comment.username.replace('@', '')}`)}
        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, flexShrink: 0, marginTop: '2px' }}
      >
        <InitialAvatar username={comment.username} initials={comment.avatarInitials} size={32} />
      </button>

      {/* Middle Content Column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {isEditing ? (
          <form onSubmit={handleUpdate} className="flex-col gap-xs" style={{ width: '100%' }}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <div className="flex-row gap-xs justify-between">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="caption-text"
                style={{ color: 'var(--hurricane)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="caption-text bold"
                style={{ color: 'var(--deep-plum)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'inline', fontSize: '14px', lineHeight: 1.4, color: 'var(--eclipse)' }}>
            <button
              type="button"
              onClick={() => onNavigate(`/profile/${comment.username.replace('@', '')}`)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                marginRight: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--eclipse)',
                display: 'inline',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {comment.username}
            </button>
            {postAuthorUsername && comment.username === postAuthorUsername && (
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: 'var(--deep-plum)',
                backgroundColor: 'var(--deep-plum-light)',
                padding: '1px 4px',
                borderRadius: '3px',
                textTransform: 'uppercase',
                marginRight: '6px',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}>
                Author
              </span>
            )}
            <span style={{ whiteSpace: 'pre-line' }}>{displayContent}</span>
            {comment.imageUrl && <img src={getMediaUrl(comment.imageUrl)} alt={t('commentImage', 'Comment attachment')} style={{ display: 'block', maxWidth: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 10, marginTop: 8 }} />}
          </div>
        )}

        {/* Action / Meta row below text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', fontSize: '12px', color: 'var(--hurricane)' }}>
          <span>{formatDate(comment.createdAt)}</span>
          
          {reactionCount > 0 && (
            <span style={{ fontWeight: 600 }}>{reactionCount} {reactionCount === 1 ? 'like' : 'likes'}</span>
          )}

          <button
            type="button"
            onClick={handleLikeToggle}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: userLiked ? 700 : 500,
              color: userLiked ? 'var(--deep-plum)' : 'var(--hurricane)',
              padding: 0,
            }}
          >
            {userLiked ? 'Liked' : 'Like'}
          </button>

          <button
            type="button"
            onClick={() => toggleReplyComposer(!showReplyComposer)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--hurricane)',
              padding: 0,
            }}
          >
            Reply
          </button>


          {/* More options menu link inside action bar */}
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <CommentMenu
              isOwner={isOwner}
              onReply={() => toggleReplyComposer(!showReplyComposer)}
              onCopy={handleCopy}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
              onReport={() => setReportModalOpen(true)}
              onMute={() => setHidden(true)}
              onBlock={() => blockUser(comment.username)}
            />
          </div>
        </div>

        {/* 1-Level Nested Replies List & Composer nested inside it */}
        <ReplyList
          replies={comment.replies || []}
          postId={postId}
          commentId={comment.id}
          onNavigate={onNavigate}
          showReplyComposer={showReplyComposer}
          onCancelReplyComposer={() => toggleReplyComposer(false)}
          onSubmitReply={handleAddReply}
          targetUsername={comment.username}
          onReplyTrigger={(username) => {
            toggleReplyComposer(true);
          }}
        />
      </div>

      {/* Far Right Active Emojis Display */}
      {activeEmojis.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          alignSelf: 'flex-start',
          marginTop: '4px',
          flexShrink: 0
        }}>
          {activeEmojis.map((emoji, index) => (
            <span key={index} style={{ fontSize: '14px' }}>{emoji}</span>
          ))}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        contentType="COMMENT"
        targetId={comment.id}
        postId={postId}
        reportedContent={comment.content}
        authorUsername={comment.username}
      />
    </div>
  );
}
