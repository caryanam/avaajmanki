import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { Feather, Loader2, Sparkles, AlertCircle, Info } from 'lucide-react';

export function WriteYourTakeModal({ isOpen, onClose, pulseItem, onTakeCreated }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { createPost } = usePosts();

  const [caption, setCaption] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !pulseItem) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim() || submitting) return;

    if (!currentUser) {
      addToast('Please log in to share your perspective.', 'error');
      return;
    }

    if (
      currentUser.status === 'POST_RESTRICTED' ||
      currentUser.status === 'TEMPORARILY_SUSPENDED' ||
      currentUser.status === 'BANNED'
    ) {
      addToast(`Posting restricted: ${currentUser.restrictionReason || 'Account restricted.'}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const topicTag = (pulseItem.topic || 'POLITICS').toUpperCase().replace(/[^A-Z0-9_]/g, '');

      // Construct take post payload linking to pulseItemId
      const postPayload = {
        title: caption.trim() ? caption.trim() : `Perspective on: ${pulseItem.title.slice(0, 80)}`,
        content: content.trim(),
        topic: topicTag,
        subtopic: pulseItem.subtopic || topicTag,
        postType: 'Thought',
        pulseItemId: pulseItem.id,
      };

      const newPost = await createPost(postPayload);
      addToast('Your take was shared with the community!', 'success');
      setContent('');
      setCaption('');
      if (onTakeCreated) {
        onTakeCreated(newPost);
      }
      onClose();
    } catch (err) {
      console.error('[WriteYourTakeModal] Failed to create take:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit take';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write Your Take" maxWidth="560px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Pulse Context Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(111,64,95,0.08) 0%, rgba(217,108,61,0.08) 100%)',
            border: '1.5px solid rgba(111,64,95,0.15)',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--deep-plum)',
                background: 'rgba(111,64,95,0.12)',
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
              }}
            >
              #{pulseItem.topic || 'NEWS'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--hurricane)', fontWeight: 600 }}>
              Perspective on Live Pulse Story
            </span>
          </div>

          <div
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: 'var(--eclipse)',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {pulseItem.title}
          </div>
        </div>

        {/* Anonymous Identity Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--hurricane)',
            padding: '0 4px',
          }}
        >
          <Info size={14} color="var(--deep-plum)" />
          <span>
            Publishing as <strong>{currentUser?.username || '@anonymous'}</strong>. Your thoughts remain anonymous and protected.
          </span>
        </div>

        {/* Optional Headline / Caption */}
        <div>
          <label
            htmlFor="take-caption"
            style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--eclipse)', marginBottom: '6px' }}
          >
            Take Headline <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--zorba)' }}>(Optional)</span>
          </label>
          <input
            id="take-caption"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Sum up your perspective in a few words..."
            maxLength={180}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1.5px solid var(--border-light)',
              fontSize: '13.5px',
              color: 'var(--eclipse)',
              outline: 'none',
              background: '#FFFFFF',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Main Perspective Body */}
        <div>
          <label
            htmlFor="take-content"
            style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--eclipse)', marginBottom: '6px' }}
          >
            Your Perspective <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <textarea
            id="take-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What is your analysis or opinion on this news development? Be authentic and constructive..."
            rows={5}
            maxLength={2000}
            required
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '14px',
              border: '1.5px solid var(--border-light)',
              fontSize: '14px',
              color: 'var(--eclipse)',
              outline: 'none',
              resize: 'vertical',
              lineHeight: 1.5,
              background: '#FFFFFF',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', fontSize: '11px', color: 'var(--zorba)' }}>
            {content.length} / 2000 characters
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              background: '#F0ECEB',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              color: 'var(--eclipse)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            style={{
              padding: '10px 24px',
              borderRadius: '20px',
              background: (!content.trim() || submitting) ? '#D5CECD' : 'var(--deep-plum)',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 800,
              color: '#FFFFFF',
              cursor: (!content.trim() || submitting) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: (!content.trim() || submitting) ? 'none' : '0 4px 12px rgba(111,64,95,0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="spin-animation" />
                Publishing...
              </>
            ) : (
              <>
                <Feather size={15} />
                Publish Take
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
