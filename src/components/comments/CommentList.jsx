import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CommentCard } from './CommentCard.jsx';
import { CommentSort } from './CommentSort.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { apiCommentService } from '../../services/apiCommentService.js';
import { mapComment } from '../../services/apiMappers.js';
import { EmptyState } from '../common/EmptyState.jsx';
import { MessageSquare } from 'lucide-react';

export function CommentList({ postId, postAuthorUsername, onNavigate, activeReplyCommentId, onReplyStateChange }) {
  const { commentsByPost, fetchComments } = useComments();
  const [sortBy, setSortBy] = useState('Latest');
  const commentsEndRef = useRef(null);
  const containerRef = useRef(null);

  // TanStack Query for Post Comments with 3-second refetchInterval
  const commentsQuery = useQuery({
    queryKey: ['post-comments', postId, sortBy],
    queryFn: async () => {
      const data = await fetchComments(postId, sortBy);
      return data || [];
    },
    refetchInterval: 3000,
    staleTime: 1000,
    enabled: Boolean(postId),
  });

  const rawComments = commentsByPost[postId] || commentsByPost[String(postId)] || commentsByPost[Number(postId)] || [];
  
  // Chat-style sorting: Oldest at top, Newest at bottom (so new comments appear at the bottom above the input box)
  const comments = [...rawComments].sort((a, b) => {
    if (sortBy === 'Latest') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Auto-scroll inside comment list container only (never scroll main window)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [comments.length]);


  return (
    <div className="flex-col gap-sm" style={{ marginTop: '10px', paddingTop: '4px' }}>
      {comments.length > 0 && (
        <div className="flex-row justify-between items-center" style={{ borderBottom: '1.5px solid #EAE2E0', paddingBottom: '8px', marginBottom: '12px' }}>
          <h3 className="card-heading" style={{ fontSize: '13.5px', fontWeight: 800, color: '#6F405F', margin: 0 }}>
            💬 Comments ({comments.length})
          </h3>
          <CommentSort
            currentSort={sortBy}
            onSortChange={(newSort) => {
              setSortBy(newSort);
              fetchComments(postId, newSort);
            }}
          />
        </div>
      )}


      {comments.length === 0 ? (
        <div
          style={{
            padding: '10px 14px',
            fontSize: '12px',
            color: '#8C8385',
            textAlign: 'center',
            background: '#FAF8F7',
            borderRadius: '10px',
            border: '1px dashed #E5DFDE',
            margin: '4px 0',
          }}
        >
          <span>No comments yet. Be the first to share your thoughts below! 👇</span>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-col gap-md hide-scrollbar"
          style={{
            maxHeight: '340px',
            overflowY: 'auto',
            paddingTop: '28px',
            paddingRight: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >

          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              postId={postId}
              postAuthorUsername={postAuthorUsername}
              onNavigate={onNavigate}
              isActiveReply={activeReplyCommentId === comment.id}
              onReplyToggle={(isOpen) => {
                if (onReplyStateChange) {
                  onReplyStateChange(isOpen ? comment.id : null);
                }
              }}
            />
          ))}
          <div ref={commentsEndRef} />
        </div>
      )}
    </div>
  );
}
