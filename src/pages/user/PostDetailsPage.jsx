import React from 'react';
import { PostDiscussionPage } from './PostDiscussionPage.jsx';

export function PostDetailsPage({ postId, onNavigate }) {
  return <PostDiscussionPage postId={postId} onNavigate={onNavigate} />;
}
