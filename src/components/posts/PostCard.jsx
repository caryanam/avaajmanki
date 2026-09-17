import React, { useState, useEffect } from 'react';
import { AvatarThumbnail } from '../avatar/AvatarThumbnail.jsx';
import { formatDate, RealtimeTimestamp } from '../../utils/formatDate.js';

import { ReactionsBar } from './ReactionsBar.jsx';
import { PostMenu } from './PostMenu.jsx';
import { Modal } from '../common/Modal.jsx';
import { MessageSquare, Bookmark, Globe, Languages, ChevronDown, ChevronUp, Trash2, Loader2, Edit3, Upload, Image as ImageIcon } from 'lucide-react';
import { CommentComposer } from '../comments/CommentComposer.jsx';
import { CommentList } from '../comments/CommentList.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getMediaUrl } from '../../config/env.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ReportModal } from '../reports/ReportModal.jsx';
import { apiClient } from '../../services/apiClient.js';

export function PostCard({ post, onNavigate, onPostHover, isHoverActive = false, onToggleComments, activeCommentsPostId }) {
  const { reactToPost, toggleSavePost, savedPostIds, deletePost, updatePost } = usePosts();

  const { commentsByPost, createComment, fetchComments } = useComments();
  const { currentUser } = useAuth();
  const { blockUser, muteUser, hidePost, hiddenPosts = [] } = useReports();
  const { currentLanguage, translateText, translateTextAsync, t } = useLanguage();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);
  const [showInlineComments, setShowInlineComments] = useState(true);
  const [isSpoilerRevealed, setIsSpoilerRevealed] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [editTitle, setEditTitle] = useState(post.title || post.originalTitle || '');
  const [editContent, setEditContent] = useState(post.originalContent || post.content || '');
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || '');
  const [updatingPost, setUpdatingPost] = useState(false);



  useEffect(() => {
    if (post?.id && fetchComments) {
      fetchComments(post.id);
    }
  }, [post?.id, fetchComments]);

  const [dynamicTitleTranslation, setDynamicTitleTranslation] = useState(null);
  const [dynamicContentTranslation, setDynamicContentTranslation] = useState(null);
  const [dynamicTopicTranslation, setDynamicTopicTranslation] = useState(null);

  const rawTopic = post.subtopic || post.topicName || post.topic;

  useEffect(() => {
    let isMounted = true;
    if (rawTopic && currentLanguage && translateTextAsync) {
      const topicStr = String(rawTopic).replace(/^#/, '');
      const dictMatch = t(topicStr) || t(topicStr.toUpperCase());
      if (dictMatch && dictMatch !== topicStr && dictMatch !== topicStr.toUpperCase()) {
        if (isMounted) setDynamicTopicTranslation(dictMatch);
      } else {
        translateTextAsync(topicStr, currentLanguage)
          .then((res) => { if (isMounted && res) setDynamicTopicTranslation(res); })
          .catch(() => { if (isMounted) setDynamicTopicTranslation(null); });
      }
    } else {
      setDynamicTopicTranslation(null);
    }
    return () => { isMounted = false; };
  }, [rawTopic, currentLanguage, t, translateTextAsync]);

  useEffect(() => {
    let isMounted = true;
    const titleText = post.title || post.originalTitle;
    const contentText = post.originalContent || post.content || post.description;

    if (titleText && currentLanguage) {
      translateTextAsync(titleText, currentLanguage).then((res) => {
        if (isMounted && res) setDynamicTitleTranslation(res);
      });
    } else {
      setDynamicTitleTranslation(null);
    }

    if (contentText && currentLanguage) {
      translateTextAsync(contentText, currentLanguage).then((res) => {
        if (isMounted && res) setDynamicContentTranslation(res);
      });
    } else {
      setDynamicContentTranslation(null);
    }

    return () => { isMounted = false; };
  }, [currentLanguage, post.title, post.originalTitle, post.originalContent, post.content, post.description, translateTextAsync]);

  const isPostHiddenInContext = Boolean(
    hiddenPosts && (hiddenPosts.includes(String(post?.id)) || hiddenPosts.includes(Number(post?.id)))
  );

  const isSaved = savedPostIds.includes(post.id);
  const isOwner = Boolean(
    post.isOwnPost ||
    (currentUser?.id && (post.userId === currentUser?.id || post.authorId === currentUser?.id))
  );
  const isTranslated = Boolean(
    !manualToggle && 
    (
      (dynamicTitleTranslation && dynamicTitleTranslation !== (post.originalTitle || post.title)) ||
      (dynamicContentTranslation && dynamicContentTranslation !== (post.originalContent || post.content)) ||
      post.isTranslated
    )
  );

  const displayTitle = manualToggle
    ? (post.originalTitle || post.title)
    : (dynamicTitleTranslation || post.translatedTitle || post.title || post.originalTitle);

  const rawDisplayContent = manualToggle
    ? (post.originalContent || post.content || '')
    : (dynamicContentTranslation || post.translatedContent || post.content || post.originalContent || '');

  const displayContent = rawDisplayContent.replace(/^#[\w\u0900-\u097F]+(?:\s+|$)/i, '').trim() || rawDisplayContent;

  const postComments = commentsByPost[post.id] || [];
  const matchedCommentCount = postComments.length > 0 ? postComments.length : (post.commentCount || 0);

  if (hidden || isPostHiddenInContext) {
    return null;
  }


  return (
    <article
      className="post-discussion-card"
      onMouseEnter={(e) => {
        if (onPostHover) {
          const rect = e.currentTarget.getBoundingClientRect();
          onPostHover(post, Math.max(30, rect.top - 84 + 24));
        }
      }}
      style={{
        backgroundColor: '#FFFFFF',
        padding: '16px 18px',
        borderRadius: '16px',
        border: `1.5px solid ${isHoverActive ? 'var(--deep-plum)' : '#E8E2E0'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'all 0.2s ease',
        boxShadow: isHoverActive
          ? '0 8px 24px rgba(111,64,95,0.14)'
          : '0 4px 16px rgba(45,29,21,0.06)',
      }}
    >
      {/* ── HEADER: Avatar, Username, Topic Tag, Time, Language & Translate Button ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/profile/${post.username.replace('@', '')}`);
            }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
          >
            <AvatarThumbnail
              username={post.username}
              initials={post.avatarInitials}
              config={post.avatarConfig}
              size={32}
            />
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(`/profile/${post.username.replace('@', '')}`);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#2D1D15',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                {isOwner ? 'My Thoughts' : post.username}
              </button>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6F405F 0%, #8E527A 100%)',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(111,64,95,0.22)',
                  letterSpacing: '0.02em',
                }}
              >
                🏷️ {dynamicTopicTranslation || post.subtopic || post.topicName || post.topic || post.postType}

              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#8C8385' }}>
              <RealtimeTimestamp date={post.createdAt} />

              {post.language && (
                <>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Globe size={10} /> {post.language}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS: Options Menu ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <PostMenu
            isSaved={isSaved}
            isOwner={isOwner}
            onEdit={() => {
              setEditTitle(post.title || post.originalTitle || '');
              setEditContent(post.originalContent || post.content || '');
              setEditImageUrl(post.imageUrl || '');
              setIsEditModalOpen(true);
            }}
            onDelete={async () => {

              try {
                await deletePost(post.id);
              } catch (e) {
                console.error(e);
              }
            }}
            onSave={() => toggleSavePost(post.id)}
            onHide={() => {
              setHidden(true);
              if (hidePost) {
                hidePost(post.id);
              }
            }}

            onMute={() => {
              muteUser(post.username);
              setHidden(true);
            }}
            onBlock={() => blockUser(post.username)}
            onReport={() => setReportModalOpen(true)}
          />
        </div>
      </div>

      {/* ── MOVIE REVIEW RATING HEADER (If applicable) ── */}
      {post.movieName && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #FAF4F8 0%, #F3E8EF 100%)',
            border: '1px solid rgba(111, 64, 95, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>🎬</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#2D1D15' }}>{post.movieName}</span>
          </div>
          {post.movieRating && (
            <div style={{ fontSize: '13px', letterSpacing: '2px' }}>
              {'⭐'.repeat(post.movieRating)}
            </div>
          )}
        </div>
      )}

      {/* ── CONTENT SNIPPET / SPOILER MASK BODY ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
        {post.isSpoiler && !isSpoilerRevealed ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsSpoilerRevealed(true);
            }}
            style={{
              padding: '24px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2D1D15 0%, #1A0F0C 100%)',
              color: '#FFFFFF',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'transform 0.2s ease',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFD700', letterSpacing: '0.04em' }}>
              ⚠️ SPOILER WARNING — Tap to Reveal Review
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              This review contains plot spoilers for {post.movieName || 'this movie'}
            </span>
          </div>
        ) : (
          <>
            {displayTitle && (
              <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: '#000000', margin: 0, lineHeight: 1.3 }}>
                {displayTitle}
              </h4>
            )}
            <p
              style={{
                fontSize: '14.5px',
                lineHeight: 1.5,
                color: '#111111',
                fontWeight: 500,
                margin: 0,
                wordBreak: 'break-word',
              }}
            >
              {displayContent}
            </p>
            {post.imageUrl && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageModalOpen(true);
                }}
                style={{
                  marginTop: '8px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #EAE6E5',
                  cursor: 'zoom-in',
                  transition: 'opacity 0.2s ease',
                }}
                title="Click to view full image"
              >
                <img
                  src={getMediaUrl(post.imageUrl)}
                  alt="Post attachment"
                  style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

          </>
        )}
      </div>

      {/* ── REACTIONS & COMMENTS BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
        <ReactionsBar
          reactions={post.reactions}
          userReaction={post.userReaction}
          onReact={(type) => reactToPost(post.id, type)}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowInlineComments(!showInlineComments);
            if (onToggleComments) {
              onToggleComments(post);
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            color: showInlineComments ? '#6F405F' : '#524644',
            backgroundColor: showInlineComments ? 'rgba(111,64,95,0.1)' : '#F6F3F2',
            border: showInlineComments ? '1.5px solid #6F405F' : '1px solid #E5E0DF',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <MessageSquare size={14} style={{ color: showInlineComments ? '#6F405F' : '#7A6E6B' }} />
          <span>{t('comments') || 'Comments'} ({matchedCommentCount})</span>
        </button>
      </div>

      {/* ── EXPANDABLE INLINE COMMENT SECTION DIRECTLY BELOW THE POST ── */}
      {showInlineComments && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingTop: '14px',
            borderTop: '1.5px solid #EAE4E4',
            marginTop: '10px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Chat-style Comments Stream (Oldest at top, Newest at bottom) */}
          <CommentList
            postId={post.id}
            postAuthorUsername={post.username}
            onNavigate={onNavigate}
            activeReplyCommentId={activeReplyCommentId}
            onReplyStateChange={setActiveReplyCommentId}
          />

          {/* Comment Composer Input Box AT THE VERY BOTTOM */}
          {!activeReplyCommentId && (
            <CommentComposer
              postId={post.id}
              postAuthorUsername={post.username}
              onSubmit={async (text) => {
                await createComment(post.id, text, post.username);
              }}
              onNavigate={onNavigate}
              placeholder="Write a comment..."
            />
          )}

        </div>
      )}



      {/* Report Modal */}
      {reportModalOpen && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="POST"
          targetId={post.id}
          targetUsername={post.username}
        />
      )}

      {/* Full-Screen Enlarged Image Lightbox Overlay */}
      {isImageModalOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsImageModalOpen(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            cursor: 'zoom-out',
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageModalOpen(false);
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
          <img
            src={getMediaUrl(post.imageUrl)}
            alt="Full-size attachment view"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
          />
        </div>
      )}

      {/* ── EDIT POST MODAL OVERLAY ── */}
      {isEditModalOpen && (

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Your Post"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editContent.trim() || updatingPost) return;
              setUpdatingPost(true);
              try {
                await updatePost(post.id, {
                  title: editTitle.trim(),
                  content: editContent.trim(),
                  imageUrl: editImageUrl,
                });
                setIsEditModalOpen(false);
              } catch (err) {
                console.error(err);
              } finally {
                setUpdatingPost(false);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <input
              type="text"
              placeholder="Title / Summary (optional)..."
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #D4CECC',
                fontSize: '14px',
                outline: 'none',
              }}
            />

            <textarea
              rows={4}
              placeholder="Edit your post content..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #D4CECC',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
              }}
            />

            {/* Image File Attachment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: editImageUrl ? 'rgba(111,64,95,0.08)' : 'rgba(111,64,95,0.12)',
                  color: 'var(--deep-plum)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: '1.5px dashed rgba(111,64,95,0.3)',
                  width: '100%',
                }}
              >
                <Upload size={16} />
                <span>{editImageUrl ? 'Change Attached Image' : '📷 Attach / Replace Image File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const formData = new FormData();
                      formData.append('file', file);
                      const res = await apiClient.post('/api/upload/image', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      if (res.data?.success && res.data?.data?.imageUrl) {
                        setEditImageUrl(res.data.data.imageUrl);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>

              {editImageUrl && (
                <div style={{ position: 'relative', marginTop: '4px', width: 'fit-content' }}>
                  <img src={getMediaUrl(editImageUrl)} alt="Preview" style={{ height: '76px', borderRadius: '10px', border: '1px solid #D4CECC', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => setEditImageUrl('')}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#FF4D4F',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #D4CECC', background: '#FFF', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingPost || !editContent.trim()}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--deep-plum)',
                  color: '#FFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {updatingPost ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </article>


  );
}
