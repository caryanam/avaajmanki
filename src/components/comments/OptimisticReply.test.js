import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Optimistic Replies - Static & Structural Integrity Test Suite', async (t) => {
  const pulseDetailsPath = path.resolve(__dirname, '../../pages/user/PulseDetailsPage.jsx');
  const replyComposerPath = path.resolve(__dirname, 'ReplyComposer.jsx');
  const replyCardPath = path.resolve(__dirname, 'ReplyCard.jsx');
  const replyListPath = path.resolve(__dirname, 'ReplyList.jsx');
  const commentCardPath = path.resolve(__dirname, 'CommentCard.jsx');

  const pulseDetailsSource = fs.readFileSync(pulseDetailsPath, 'utf8');
  const replyComposerSource = fs.readFileSync(replyComposerPath, 'utf8');
  const replyCardSource = fs.readFileSync(replyCardPath, 'utf8');
  const replyListSource = fs.readFileSync(replyListPath, 'utf8');
  const commentCardSource = fs.readFileSync(commentCardPath, 'utf8');

  await t.test('ReplyComposer prevents rapid double-click submissions via isSubmittingRef', () => {
    assert.ok(
      replyComposerSource.includes('isSubmittingRef = useRef(false)'),
      'ReplyComposer must define isSubmittingRef for synchronous double-click prevention'
    );
    assert.ok(
      replyComposerSource.includes('isSubmittingRef.current'),
      'ReplyComposer handleSubmit must inspect isSubmittingRef.current before proceeding'
    );
    assert.ok(
      replyComposerSource.includes('isSubmittingRef.current = true'),
      'ReplyComposer handleSubmit must set isSubmittingRef.current = true synchronously'
    );
    assert.ok(
      replyComposerSource.includes('isSubmittingRef.current = false'),
      'ReplyComposer handleSubmit must reset isSubmittingRef.current = false in finally block'
    );
  });

  await t.test('ReplyComposer preserves input text when onSubmit rejects/throws', () => {
    // In handleSubmit, setText('') must only occur if onSubmit succeeds (before catch or after await)
    const submitBlock = replyComposerSource.substring(
      replyComposerSource.indexOf('const handleSubmit = async'),
      replyComposerSource.indexOf('const handleEmojiClick =')
    );
    assert.ok(submitBlock.includes('try {'), 'handleSubmit must have a try/catch block');
    assert.ok(submitBlock.includes('await onSubmit(text.trim()'), 'handleSubmit must await onSubmit');
    assert.ok(submitBlock.includes('setText(\'\');'), 'handleSubmit must clear text only after await');
    
    // In catch block, text should NOT be cleared
    const catchIndex = submitBlock.indexOf('catch (err)');
    const catchBlock = submitBlock.substring(catchIndex);
    assert.ok(!catchBlock.includes('setText(\'\')'), 'catch block must NOT clear text to preserve user reply on error');
  });

  await t.test('PulseDetailsPage implements handleReplySubmit with collision-safe temporary ID and optimistic cache update', () => {
    assert.ok(
      pulseDetailsSource.includes('handleReplySubmit'),
      'PulseDetailsPage must declare handleReplySubmit handler'
    );
    assert.ok(
      pulseDetailsSource.includes('temp_reply_'),
      'PulseDetailsPage handleReplySubmit must generate temporary ID starting with temp_reply_'
    );
    assert.ok(
      pulseDetailsSource.includes('queryClient.setQueryData'),
      'PulseDetailsPage must immediately update React Query cache via queryClient.setQueryData for instant visibility'
    );
    assert.ok(
      pulseDetailsSource.includes('onReplySubmit={handleReplySubmit}'),
      'PulseDetailsPage must pass onReplySubmit prop to CommentCard'
    );
  });

  await t.test('PulseDetailsPage enforces authentication and rollbacks on reply failure', () => {
    assert.ok(
      pulseDetailsSource.includes('if (!currentUser)'),
      'PulseDetailsPage handleReplySubmit must verify !currentUser to prevent unauthenticated replies'
    );
    assert.ok(
      pulseDetailsSource.includes('moderationCheck'),
      'PulseDetailsPage handleReplySubmit must run moderationCheck before sending'
    );
    assert.ok(
      pulseDetailsSource.includes('filter((r) => r.id !== tempReplyId)'),
      'PulseDetailsPage handleReplySubmit must implement rollback logic removing tempReplyId on failure'
    );
  });

  await t.test('ReplyCard displays subtle Sending indicator when isOptimistic is true', () => {
    assert.ok(
      replyCardSource.includes('reply?.isOptimistic'),
      'ReplyCard must check reply?.isOptimistic'
    );
    assert.ok(
      replyCardSource.includes('Sending...'),
      'ReplyCard must render Sending... indicator for optimistic replies'
    );
    assert.ok(
      replyCardSource.includes('Loader2'),
      'ReplyCard must include Loader2 icon'
    );
  });

  await t.test('ReplyList keeps thread expanded when replies are added or composer is open', () => {
    assert.ok(
      replyListSource.includes('showReplyComposer'),
      'ReplyList must monitor showReplyComposer'
    );
    assert.ok(
      replyListSource.includes('setShowReplies(true)'),
      'ReplyList must auto-expand showReplies when composer opens or replies increase'
    );
  });

  await t.test('CommentCard passes through onReplySubmit to ReplyList and handles error safely', () => {
    assert.ok(
      commentCardSource.includes('onReplySubmit'),
      'CommentCard must accept onReplySubmit prop'
    );
    assert.ok(
      commentCardSource.includes('handleAddReply'),
      'CommentCard must implement handleAddReply'
    );
  });
});
