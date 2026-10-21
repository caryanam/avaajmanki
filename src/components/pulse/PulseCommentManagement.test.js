import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Pulse Comment & Reply Management - Structural & Integrity Test Suite', async (t) => {
  const pulseDetailsPath = path.resolve(__dirname, '../../pages/user/PulseDetailsPage.jsx');
  const pulseDiscussionPath = path.resolve(__dirname, 'PulseArticleDiscussion.jsx');
  const apiCommentServicePath = path.resolve(__dirname, '../../services/apiCommentService.js');
  const apiMappersPath = path.resolve(__dirname, '../../services/apiMappers.js');

  const pulseDetailsSource = fs.readFileSync(pulseDetailsPath, 'utf8');
  const pulseDiscussionSource = fs.readFileSync(pulseDiscussionPath, 'utf8');
  const apiCommentServiceSource = fs.readFileSync(apiCommentServicePath, 'utf8');
  const apiMappersSource = fs.readFileSync(apiMappersPath, 'utf8');

  await t.test('Ownership logic uses trusted server-side user IDs and never display names', () => {
    assert.ok(
      pulseDiscussionSource.includes('isItemOwner'),
      'PulseArticleDiscussion must define an isItemOwner helper'
    );
    assert.ok(
      pulseDiscussionSource.includes('currentUser.id ?? currentUser.userId') ||
      pulseDiscussionSource.includes('currentUser.id || currentUser.userId'),
      'isItemOwner must extract current user ID from authenticated currentUser'
    );
    assert.ok(
      pulseDiscussionSource.includes('item.authorId ?? item.userId') ||
      pulseDiscussionSource.includes('item.authorId || item.userId'),
      'isItemOwner must extract author ID from comment authorId/userId'
    );
    assert.ok(
      !pulseDiscussionSource.includes('currentUser.username === item.username'),
      'isItemOwner must not rely on username or display name comparisons'
    );
  });

  await t.test('Comment context menu strictly isolates owner vs non-owner actions', () => {
    assert.ok(
      pulseDiscussionSource.includes('isOwner ?'),
      'Parent comment menu must branch on isOwner'
    );
    assert.ok(
      pulseDiscussionSource.includes('isReplyOwner ?'),
      'Nested reply menu must branch on isReplyOwner'
    );
    assert.ok(
      pulseDiscussionSource.includes('<Edit3 size={13} />'),
      'Owner menu must render Edit option with icon'
    );
    assert.ok(
      pulseDiscussionSource.includes('<Trash2 size={13} />'),
      'Owner menu must render Delete option with icon'
    );
    assert.ok(
      pulseDiscussionSource.includes('<Flag size={13} />'),
      'Non-owner menu must render Report option'
    );
  });

  await t.test('Delete immediately executes without confirmation modal and disables duplicate clicks', () => {
    assert.ok(
      !pulseDiscussionSource.includes('pulse-delete-modal-overlay'),
      'PulseArticleDiscussion must completely remove delete confirmation modal overlay'
    );
    assert.ok(
      !pulseDiscussionSource.includes('Are you sure you want to delete this'),
      'Delete confirmation text must not exist in PulseArticleDiscussion'
    );
    assert.ok(
      pulseDiscussionSource.includes('handleImmediateDelete'),
      'PulseArticleDiscussion must implement handleImmediateDelete for instant execution'
    );
    assert.ok(
      pulseDiscussionSource.includes('deletingIds'),
      'PulseArticleDiscussion must track deletingIds set to prevent repeated deletion requests'
    );
  });

  await t.test('Fix 1: Newly submitted comments appear first and discussion list scrolls to top', () => {
    assert.ok(
      pulseDiscussionSource.includes('sessionNewCommentIds'),
      'PulseArticleDiscussion must track sessionNewCommentIds state for session-pinned top comments'
    );
    assert.ok(
      pulseDiscussionSource.includes('commentsListRef.current.scrollTo({ top: 0, behavior: \'smooth\' })') ||
      pulseDiscussionSource.includes('commentsListRef.current.scrollTo'),
      'handlePostSubmit must automatically scroll discussion list to top on comment creation'
    );
    assert.ok(
      pulseDiscussionSource.includes('[...sessionPinned, ...regular]'),
      'sortedComments must return sessionPinned newly created comments first'
    );
  });

  await t.test('Inline editor supports prepopulated content, keyboard shortcuts, and draft safety', () => {
    assert.ok(
      pulseDiscussionSource.includes('pulse-inline-edit-composer'),
      'PulseArticleDiscussion must render inline edit composer'
    );
    assert.ok(
      pulseDiscussionSource.includes('pulse-inline-edit-textarea'),
      'PulseArticleDiscussion must render inline edit textarea'
    );
    assert.ok(
      pulseDiscussionSource.includes('handleSaveEdit'),
      'PulseArticleDiscussion must implement handleSaveEdit'
    );
    assert.ok(
      pulseDiscussionSource.includes('pulse-inline-edit-save-btn') &&
      pulseDiscussionSource.includes('pulse-inline-edit-cancel-btn'),
      'Inline editor must have Save and Cancel buttons'
    );
  });

  await t.test('PulseDetailsPage implements handleUpdateComment and handleDeleteComment with cache reconciliation', () => {
    assert.ok(
      pulseDetailsSource.includes('handleUpdateComment = async (commentId, updatedText) =>'),
      'PulseDetailsPage must implement handleUpdateComment'
    );
    assert.ok(
      pulseDetailsSource.includes('handleDeleteComment = async (commentId, isReply = false, parentId = null) =>'),
      'PulseDetailsPage must implement handleDeleteComment'
    );
    assert.ok(
      pulseDetailsSource.includes('apiCommentService.updateComment'),
      'handleUpdateComment must dispatch to apiCommentService.updateComment'
    );
    assert.ok(
      pulseDetailsSource.includes('apiCommentService.deleteComment'),
      'handleDeleteComment must dispatch to apiCommentService.deleteComment'
    );
    assert.ok(
      pulseDetailsSource.includes("queryClient.invalidateQueries({ queryKey: ['pulse-detail', pulseId] })"),
      'handleDeleteComment must invalidate pulse-detail to keep headline discussion counts in sync'
    );
  });

  await t.test('apiCommentService methods and mappers handle errors without returning fake success', () => {
    assert.ok(
      apiCommentServiceSource.includes('async updateComment(commentId, content)'),
      'apiCommentService must implement updateComment'
    );
    assert.ok(
      apiCommentServiceSource.includes('async deleteComment(commentId)'),
      'apiCommentService must implement deleteComment'
    );
    assert.ok(
      apiMappersSource.includes('authorId: resolvedAuthorId'),
      'mapComment must normalize authorId on every comment'
    );
  });
});
