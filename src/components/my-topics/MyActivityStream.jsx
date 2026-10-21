import React from 'react';
import { 
  FileText, Bookmark, Heart, MessageSquare, ArrowRight, Trash2, Calendar 
} from 'lucide-react';
import { getMediaUrl } from '../../config/env.js';
import { formatTimeAgo } from './MyTopicItemCard.jsx';

export function MyActivityStream({ 
  type = 'posts', 
  items = [], 
  onViewPost, 
  onUnsavePost, 
  onOpenCreateModal 
}) {
  if (!items || items.length === 0) {
    let emptyIcon = <FileText size={24} strokeWidth={2.2} />;
    let emptyTitle = 'No posts yet';
    let emptyDesc = 'You have not published any posts on AwaajManKi yet.';
    let actionText = '+ Create Your First Post';
    let actionHandler = onOpenCreateModal;

    if (type === 'saved') {
      emptyIcon = <Bookmark size={24} strokeWidth={2.2} />;
      emptyTitle = 'No saved posts';
      emptyDesc = 'Bookmark posts you find meaningful to revisit them anytime.';
      actionText = null;
    } else if (type === 'liked') {
      emptyIcon = <Heart size={24} strokeWidth={2.2} />;
      emptyTitle = 'No liked posts yet';
      emptyDesc = 'Posts you like or react to will be collected here.';
      actionText = null;
    } else if (type === 'comments') {
      emptyIcon = <MessageSquare size={24} strokeWidth={2.2} />;
      emptyTitle = 'No comments yet';
      emptyDesc = 'Engage in open discussions to share your viewpoint.';
      actionText = null;
    }

    return (
      <div className="my-topics-empty-card">
        <div className="my-topics-empty-icon-wrap">
          {emptyIcon}
        </div>
        <h3 className="my-topics-empty-title">{emptyTitle}</h3>
        <p className="my-topics-empty-desc">{emptyDesc}</p>
        {actionText && actionHandler && (
          <button 
            type="button" 
            className="my-topics-empty-action-btn"
            onClick={actionHandler}
          >
            {actionText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="my-topics-list">
      {items.map((item, idx) => {
        const itemId = item.id || `item-${idx}`;
        const topic = item.topic || 'GENERAL';
        const title = item.title || item.originalContent?.slice(0, 50) || (type === 'comments' ? 'Discussion Comment' : 'Shared Post');
        const content = item.content || item.originalContent || '';
        const imageUrl = item.imageUrl ? getMediaUrl(item.imageUrl) : null;
        const timeAgo = formatTimeAgo(item.createdAt);
        const likeCount = item.likeCount || 0;
        const commentCount = item.commentCount || 0;

        return (
          <article key={`${type}-${itemId}-${idx}`} className="my-topic-post-card">
            {/* Header */}
            <div className="my-topic-post-header">
              <span className="my-topic-tag-pill" style={{ background: '#FFF1F2', color: '#E11D48' }}>
                {topic}
              </span>
              <span style={{ fontSize: 12, color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} />
                <span>{timeAgo}</span>
              </span>
            </div>

            {/* Post Title & Content */}
            {item.title && (
              <h4 className="my-topic-post-title">{item.title}</h4>
            )}
            {content && (
              <p className="my-topic-post-body">{content}</p>
            )}

            {/* Image attachment if present */}
            {imageUrl && (
              <div className="my-topic-post-media">
                <img src={imageUrl} alt="Attached media" loading="lazy" />
              </div>
            )}

            {/* Footer */}
            <div className="my-topic-post-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Heart size={14} style={{ color: '#E11D48' }} />
                  <span>{likeCount}</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MessageSquare size={14} style={{ color: '#0284C7' }} />
                  <span>{commentCount}</span>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {type === 'saved' && onUnsavePost && (
                  <button
                    type="button"
                    onClick={() => onUnsavePost(itemId)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 6,
                    }}
                    title="Remove from saved"
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                <button
                  type="button"
                  className="my-topic-view-btn"
                  onClick={() => onViewPost(item)}
                >
                  <span>View Discussion</span>
                  <ArrowRight size={13} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
