import React, { useState, useEffect } from 'react';
import { CommentComposer } from '../comments/CommentComposer.jsx';
import { CommentList } from '../comments/CommentList.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { AvatarThumbnail } from '../avatar/AvatarThumbnail.jsx';
import { MessageSquare, X } from 'lucide-react';

export function SleekCommentSidePanel({ post, onClose, onNavigate }) {
  const { commentsByPost, createComment } = useComments();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!post) return null;

  const postComments = commentsByPost[post.id] || [];
  const matchedCommentCount = commentsByPost[post.id] !== undefined ? postComments.length : (post.commentCount || 0);
  const displayTitle = post.originalTitle || post.title || 'Discussion';

  // Desktop side panel content & mobile slide-up sheet
  const panelContent = (
    <aside
      className="animate-fade-in sleek-comment-panel"
      style={
        isMobile
          ? {
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              maxHeight: '88vh',
              height: '88vh',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              boxShadow: '0 -8px 32px rgba(45,29,21,0.25)',
              padding: '16px 16px 24px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 1100,
              overflowY: 'auto',
            }
          : {
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '440px',
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: '#FFFFFF',
              boxShadow: '-8px 0 36px rgba(45, 29, 21, 0.25)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 1100,
              overflowY: 'auto',
              overflowX: 'hidden',
            }
      }
    >
      {isMobile && (
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: '#D4CECC',
            alignSelf: 'center',
            marginBottom: '4px',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '8px',
          borderBottom: '1px solid #EDE8E6',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageSquare size={16} style={{ color: '#6F405F' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
            {t('comments') || 'Comments'} ({matchedCommentCount})
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#F5F2F0',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6F405F',
          }}
        >
          <X size={15} />
        </button>
      </div>

      <div
        style={{
          padding: '10px 12px',
          borderRadius: '12px',
          backgroundColor: '#FAF6F8',
          border: '1px solid #EFE8EA',
          fontSize: '12.5px',
          lineHeight: '1.4',
          color: '#2D1D15',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AvatarThumbnail
            username={post.username || post.authorUsername || '@writer'}
            initials={post.avatarInitials || 'AN'}
            config={post.avatarConfig}
            size={22}
          />
          <span style={{ fontWeight: 700, color: '#6F405F' }}>{post.username || post.authorUsername || '@anonymous'}</span>
        </div>
        <div style={{ fontWeight: 600, color: '#4A3E3D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayTitle}
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        <CommentComposer postId={post.id} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <CommentList postId={post.id} onNavigate={onNavigate} />
      </div>
    </aside>
  );

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(45, 29, 21, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 1099,
        }}
      />
      {panelContent}
    </>
  );
}
