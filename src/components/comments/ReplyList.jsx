import React, { useState } from 'react';
import { ReplyCard } from './ReplyCard.jsx';
import { ReplyComposer } from './ReplyComposer.jsx';

export function ReplyList({
  replies = [],
  postId,
  commentId,
  onNavigate,
  showReplyComposer,
  onCancelReplyComposer,
  onSubmitReply,
  targetUsername,
  onReplyTrigger
}) {
  const [showReplies, setShowReplies] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const prevCountRef = React.useRef(replies?.length || 0);

  React.useEffect(() => {
    if (showReplyComposer) {
      setShowReplies(true);
    }
  }, [showReplyComposer]);

  React.useEffect(() => {
    if (replies && replies.length > prevCountRef.current) {
      setShowReplies(true);
    }
    prevCountRef.current = replies?.length || 0;
  }, [replies?.length]);

  // If no replies and no composer, show nothing
  if ((!replies || replies.length === 0) && !showReplyComposer) return null;

  const visibleReplies = replies.slice(0, visibleCount);
  const hasMore = replies.length > visibleCount;

  return (
    <div className="flex-col gap-xs" style={{ marginTop: '4px', width: '100%' }}>
      {replies.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 2px 44px' }}>
          {/* Horizontal Line Prefix */}
          <div style={{ width: '24px', height: '1px', backgroundColor: 'var(--hurricane)', opacity: 0.3 }} />
          <button
            onClick={() => setShowReplies(!showReplies)}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--hurricane)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {showReplies ? 'Hide replies' : `View replies (${replies.length})`}
          </button>
        </div>
      )}

      {/* Indented Replies block */}
      {((showReplies && replies.length > 0) || showReplyComposer) && (
        <div className="flex-col gap-xs" style={{ paddingLeft: '44px' }}>
          {showReplies && visibleReplies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              postId={postId}
              commentId={commentId}
              onNavigate={onNavigate}
              onReplyTrigger={() => {
                if (onReplyTrigger) onReplyTrigger(reply.username);
              }}
            />
          ))}

          {showReplies && hasMore && (
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="secondary-text"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--deep-plum)',
                textAlign: 'left',
                margin: '4px 0 4px 32px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Load more replies ({replies.length - visibleCount} remaining)...
            </button>
          )}

          {showReplyComposer && (
            <div style={{ marginTop: '6px', width: '100%' }}>
              <ReplyComposer
                commentId={commentId}
                postId={postId}
                targetUsername={targetUsername}
                onSubmit={onSubmitReply}
                onCancel={onCancelReplyComposer}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
